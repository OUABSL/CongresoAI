from bson.objectid import ObjectId
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.datastructures import CombinedMultiDict
from werkzeug.utils import secure_filename
from src.models.manuscript import ScientificArticle  
from src.app import mongo, API, llamus_key, gpt_key
from src.services.dataPreparation import DataHandler
from src.services.preEvaluation import PreEvaluation
from src.services.summary import ArticleSummarizer
from src.services.summary import SYSTEM_PROMPT_BASE as prompt_summary
from src.services.preEvaluation import  SYSTEM_PROMPT_BASE as prompt_eval
from src.services.preEvaluation import  SYSTEM_PROMPT_RESUBMIT as prompt_eval_resubmit
from src.services.reviewerAssignment import ReviewerAssignment
import tempfile, shutil, threading, os
import logging
from uuid import uuid4





submit_bp = Blueprint('submit', __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data")
DB = mongo.db.scientific_article
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def create_temp_dir(parent_dir):
    return tempfile.mkdtemp(dir=parent_dir)


def process_submit(article:ScientificArticle, dest_path, resubmit:bool = False):
    #TODO : Implementar la logica de resubmit, incluyendo peticiones a llamus
    try:
        # Data processing
        data_handler = DataHandler(article, dest_path=dest_path)
        data_handler.run()
        if not(resubmit):    
            summary_instance = ArticleSummarizer(mongo, prompt_summary,  gpt_key, article)
            pre_evaluation_instance = PreEvaluation(mongo,  prompt_eval, gpt_key, article)
            assignment_agent = ReviewerAssignment(mongo = mongo, article = article)
            assignment_agent.run()
        else:
            summary_instance = ArticleSummarizer(mongo, prompt_summary,  gpt_keyÇ, article)
            pre_evaluation_instance = PreEvaluation(mongo,  prompt_eval_resubmit, gpt_keyÇ, article, resubmit)

        summary =summary_instance.run()
        pre_evaluation = pre_evaluation_instance.run()
        error = summary.get('error', False) or pre_evaluation.get('error', False)
        if summary and not summary.get('error', False):
            article.update_properties(summary=summary)

        if pre_evaluation and not pre_evaluation.get('error', False):
            article.update_properties(evaluation=pre_evaluation)


        if(error):
            logging.error("Error en el procesamiento del artículo")
            article.update_properties(processing_state="Fail")
        else:
            article.update_properties(processing_state="Done")

        article.save()
        
    except Exception as e:
        logging.error(f"Error exepción {e}")
        article.update_properties(processing_state="Fail")
        article.save()
    finally:
        #Eliminar la carpeta temporal usada en el proceso
        if os.path.isdir(dest_path):
            shutil.rmtree(dest_path)
            print(f"Eliminada la carpeta {dest_path}")

    return None

@submit_bp.route(API + '/submit', methods=['POST'])
@jwt_required()
def submit_article():
    claims = get_jwt()
    if claims["role"] != "author":
        return jsonify({"msg": "You do not have access to this resource"}), 403

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    temp_dir = create_temp_dir(UPLOAD_FOLDER)

    loged_in_author = mongo.db.authors.find_one({'username':get_jwt_identity()})

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
    submission_id = str(uuid4())
    article = ScientificArticle(author = username, submission_id=submission_id ,title=title, description=description, key_words=key_words)
    article.save_files(latex_project=file_obj)
    article.save()
    threading.Thread(target=process_submit, args=(article, temp_dir)).start()
    # Obtener el resumen del artículo como un diccionario
    article_summary = article.get_summary_to_dict()

    # Devolver el resumen del artículo junto con el mensaje de éxito
    return jsonify({'status': 'success', 'message': 'File uploaded and processing', 'article_summary': article_summary}), 201



@submit_bp.route(API + '/submit/<author>', methods=['GET'])
def show_articles(author):
    articles = list(DB.find({"author":str(author)}))
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
    article = DB.find_one({"author":str(author), "title":article_title})
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
    


"""
Función para actualizar un articulo cientifico ya revisado
"""
#TODO : Realizar mejoras y pruebas sobre la función actualizar articulo revisado
@submit_bp.route(API + '/submit/<author>/<title>', methods=['PUT'])
@jwt_required()
def update_article(author, title):
    claims = get_jwt()
    if claims["role"] != "author":
        return jsonify({"msg": "You do not have access to this resource"}), 403
    
    # Buscar el artículo por autor y título
    #article = DB.find_one({"author": author, "title": title})
    article_updated = ScientificArticle.objects(author=author, title=title).first()


    # Si no se encuentra el artículo
    if not article_updated:
        return jsonify({"error": "Article not found"}), 404
    
    file_obj = request.files.get('latex_project', None)
    improvements = request.form.get('improvements', None)
    review_comments = request.form.get('review_comments', None)
    resubmit = request.form.get('resubmit', None)

    temp_dir = create_temp_dir(UPLOAD_FOLDER)

    # Verificar si todos los campos requeridos están presentes
    if not all([file_obj, improvements, review_comments, resubmit]):
        message = "Missing required fields, {}{}".format(
            "File is missing; " if not file_obj else "",
            "Form fields are missing; " if not all([
                improvements, review_comments, resubmit]) else "")
        return jsonify({'error': message}), 422

    # Actualizar el artículo
    #article_updated = ScientificArticle(**article)  
    article_updated.save_files(latex_project=file_obj)
    article_updated.update_properties(
        improvements=improvements,
        processing_state="On Process" #TODO: Falta mejorar la logica de resubmit
    )
    print(f"Actualizado el articulo {article_updated.title}, {article_updated.processing_state}")
    article_updated.save()

    threading.Thread(target=process_submit, args=(article_updated, temp_dir, True)).start()

    return jsonify({'status': 'success', 'message': 'Article updated and processing'}), 200


    #TODO: Solucionar y manejar las llamadas a llamus.