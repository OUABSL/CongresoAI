from bson.objectid import ObjectId
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.datastructures import CombinedMultiDict
from werkzeug.utils import secure_filename
from src.models.user import Author
from src.models.tabajo import ScientificArticle  
from src.app import mongo, API, llamus_key
from src.services.dataPreparation import DataHandler
from src.services.PreEvaluation import PreEvaluation
from src.services.summary import ArticleSummarizer
from src.services.summary import SYSTEM_PROMPT_BASE as prompt_summary
from src.services.PreEvaluation import  SYSTEM_PROMPT_BASE as prompt_eval
from src.services.reviewerAssignment import ReviewerAssignment
import tempfile, shutil, threading, os



submit_bp = Blueprint('submit', __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data")
db = mongo.db.scientific_article


def create_temp_dir(parent_dir):
    return tempfile.mkdtemp(dir=parent_dir)


def process_submit(article:ScientificArticle, dest_path):
    try:
        # Data processing
        data_handler = DataHandler(article, dest_path=dest_path)
        data_handler.run()
        summary_instance = ArticleSummarizer(mongo, prompt_summary,  llamus_key, article)
        evaluation_instance = PreEvaluation(mongo,  prompt_eval, llamus_key, article)
        assignment_agent = ReviewerAssignment(mongo = mongo, article = article)
        assignment_agent.run()


        evaluation_instance.chat_model = 'TheBloke.llama-2-70b-chat.Q5_K_M.gguf'
        summary_instance.run()
        evaluation_instance.run()
            
        article.update_properties(processing_state="Done")
        article.save()
        
    except Exception as e:
        print(e) # Esto imprimirá el error, puede gestionarlo como desee
        article.processing_state = "Fail"
        article.save()
    finally:
        if os.path.isdir(dest_path):
            shutil.rmtree(dest_path)

    return None

@submit_bp.route(API + '/submit', methods=['POST'])
@jwt_required()
def submit_article():
    claims = get_jwt()
    if claims["rol"] != "author":
        return jsonify({"msg": "You do not have access to this resource"}), 403

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    temp_dir = create_temp_dir(UPLOAD_FOLDER)

    loged_in_author = mongo.db.authors.find_one({'username':get_jwt_identity()})
    print(loged_in_author)

    file_obj = request.files.get('latex_project', None)
    title = request.form.get("title", None)
    description = request.form.get("description", None)
    key_words = request.form.get('key_words', None)
    username = get_jwt_identity()

    # Check if all required fields are present
    if not all([file_obj, title, description, key_words, loged_in_author]):
        message = "Missing required fields, {}{}".format("File is missing; " if not file_obj else "",
                                                         "Form fields are missing; " if not all([title, description, key_words, loged_in_author]) else "")
        return jsonify({'error': message}), 422
    key_words = key_words.split(',')
    article = ScientificArticle(author = username, title=title, description=description, key_words=key_words)
    article.save_files(latex_project=file_obj)
    article.save()
    threading.Thread(target=process_submit, args=(article, temp_dir)).start()
    return jsonify({'status': 'success', 'message': 'File uploaded and processing'}), 201




@submit_bp.route(API + '/submit/<author>', methods=['GET'])
def show_articles(author):
    articles = list(db.find({"author":str(author)}))
    if articles:
        for article in articles:
            if article and 'submitted_pdf_id' in article.keys() and article.get('summary'):
                article.pop("_id")
                article.pop("content")
                article.pop("summary")
                article.pop("evaluation")
                article['latex_project_id'] = str(article.get('latex_project_id'))
                article['submitted_pdf_id'] = str(article.get('submitted_pdf_id'))
                if article.get('result_review') == "Pending Review":
                    article.pop("review")
        return make_response(jsonify(articles), 200)
    else:
        return make_response(jsonify({"msg": "No articles found for this author."}), 404)


@submit_bp.route(API + '/submit/<author>/<article_title>', methods = ['GET'])
@jwt_required()
def show_article(author, article_title):
    article = db.find_one({"author":str(author), "title":article_title})
    print(article)
    if article:
        article.pop("_id")
        article.pop("content")
        article.pop("summary")
        article.pop("evaluation")
        article.pop("sorted_backup_assignment")
        if article.get("review_result") == "Pending Review":
            article.pop("review")
        article['latex_project_id'] = str(article.get('latex_project_id'))
        article['submitted_pdf_id'] = str(article.get('submitted_pdf_id'))
        return make_response(jsonify(article), 200)
    else:
        return make_response(jsonify({"msg": "No articles found for this author."}), 404)
    