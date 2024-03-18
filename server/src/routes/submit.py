from bson.objectid import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.datastructures import CombinedMultiDict
from werkzeug.utils import secure_filename
from models.user import Author
from models.tabajo import ScientificArticle  
from app import mongo, API, llamus_key
from services.dataPreparation import DataHandler
from services.PreEvaluation import PreEvaluation
from services.summary import ArticleSummarizer
from services.summary import SYSTEM_PROMPT_BASE as prompt_summary
from services.PreEvaluation import  SYSTEM_PROMPT_BASE as prompt_eval
from services.reviewerAssignment import ReviewerAssignment
import tempfile, shutil
import threading
import os, sys



submit_bp = Blueprint('submit', __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

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
    role = claims["rol"]
    if role != "author":
        return jsonify({"msg": "You do not have access to this resource"}), 403
    
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    temp_dir = create_temp_dir(UPLOAD_FOLDER)

    current_user = mongo.db.authors.find_one({'username':(get_jwt_identity())})
    print("username:   ",get_jwt_identity())
    
    data_file = request.files
    data_form = request.form
    #print("data form:  ",data_form)
    print(f"current: \n {current_user}")

    
    required_fields = ['title', 'description', 'key_words']

    if not all(field in data_form for field in required_fields) or not data_file:
        return jsonify({'error': 'Missing required fields'}), 400

    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    #print(current_user)
    file=''
    filename = ''
    for file in data_file.values():
        file = file
        filename = secure_filename(file.filename) # obtener el nombre seguro del archivo
        print(filename) # este es el nombre de tu archivo zip

        # if file.filename != '':
        #     file.save(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename)) + ".zip")
    
   
    title = request.form.get("title")
    description = request.form.get("description")
    key_words = request.form.get('key_words').split(',')

    author = Author.objects.filter(username = "ouabou")

    # Create ScientificArticle instance and save to MongoDB
    saved_article = ScientificArticle(
        title=title, 
        description=description,
        key_words=key_words,
        content={},
        evaluation={}, 
        summary={}
        ).save()
    saved_article.save_files(latex_project=file)
    threading.Thread(target=process_submit, args=(saved_article, temp_dir)).start()
    return jsonify({'status': 'success', 'msg': 'File uploaded successfully'}), 201