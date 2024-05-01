from bson.objectid import ObjectId
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.datastructures import CombinedMultiDict
from werkzeug.utils import secure_filename
from src.models.user import Author
from src.models.tabajo import ScientificArticle  
from src.app import mongo, API, llamus_key
from src.services.dataPreparation import DataHandler
from src.services.preEvaluation import PreEvaluation
from src.services.summary import ArticleSummarizer
from src.services.summary import SYSTEM_PROMPT_BASE as prompt_summary
from src.services.preEvaluation import  SYSTEM_PROMPT_BASE as prompt_eval
from src.services.reviewerAssignment import ReviewerAssignment
import tempfile, shutil, threading, os
import logging
from uuid import uuid4





submit_bp = Blueprint('submit', __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data")
DB = mongo.db.scientific_article
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

#Función para crear carpeta temporal para la extracción de datos desde el proyecto latex.
def create_temp_dir(parent_dir):
    return tempfile.mkdtemp(dir=parent_dir)

#Función para eliminar la carpeta temporal creada, se ejecuta al terminar la extracción de datos desde el proyecto latex. 
def delete_temp_dir(dest_path):
    # Eliminar la carpeta temporal usada en el proceso
    if os.path.isdir(dest_path):
        shutil.rmtree(dest_path)
        if os.path.isdir(dest_path): # verifica si la carpeta todavía existe después de usar shutil.rmtree()
            os.rmdir(dest_path) # se utiliza os.rmdir() para eliminar la carpeta vacía
            print(f"Eliminada la carpeta temporal {dest_path}")


def process_submit(article:ScientificArticle, dest_path, resubmit:bool = False):
    #TODO : Implementar la logica de resubmit, incluyendo peticiones a llamus
    try:
        # Data processing
        data_handler = DataHandler(article, dest_path=dest_path)
        data_handler.run()
        if not(resubmit):    
            summary_instance = ArticleSummarizer(mongo, prompt_summary,  llamus_key, article)
            pre_evaluation_instance = PreEvaluation(mongo,  prompt_eval, llamus_key, article)
            assignment_agent = ReviewerAssignment(mongo = mongo, article = article)
            assignment_agent.run()
        else:
            summary_instance = ArticleSummarizer(mongo, prompt_summary,  llamus_key, article)
            pre_evaluation_instance = PreEvaluation(mongo,  prompt_eval, llamus_key, article, resubmit)


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
        delete_temp_dir(dest_path)
    return None

"""
Función para recibir el POST de una entrega inicial de un artículo por parte del autor.
- Args: rol, zip del proyecto latex, título, descripción, palabras claves 
- Devuelve: mensaje de resultado, codigo de estado, resumen de entrega 
"""
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

    # Comprobar la existencia de todos los campos requiridos
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
    # Obtener el resumen de la entrega como un diccionario
    submit_summary = article.get_summary_to_dict()

    # Devolver el resumen del artículo junto con el mensaje de éxito
    return jsonify({'status': 'success', 'message': 'File uploaded and processing', 'submit_summary': submit_summary}), 201

#Función para preparar un artículo científico para ser enviado en formato json
def serialize_article(article):
    if "_id" in article:
        article.pop("_id")  # Removing MongoDB's _id field which is of type ObjectId
    if "content" in article:
        article.pop("content")
    if "summary" in article:
        article.pop("summary")
    if "evaluation" in article:
        article.pop("evaluation")
    if "latex_project_id" in article and article["latex_project_id"]:
        article['latex_project_id'] = str(article['latex_project_id'])
    if "submitted_pdf_id" in article and article["submitted_pdf_id"]:
        article['submitted_pdf_id'] = str(article['submitted_pdf_id'])
    if "review_result" in article and article.get("review_result") == "Pending Review":
        article.pop("review", None)  # Safe to use pop with default to avoid KeyError
    if "sorted_backup_assignment" in article:
        article.pop("sorted_backup_assignment", None)
    return article

"""
Función para devolver los artículos científicos entregados por parte de un autor. 
    - Se devuelven los datos principales del artículo además del estado de su revisión
"""
@submit_bp.route(API + '/submit/<author>', methods=['GET'])
@jwt_required()
def show_articles(author):
    articles = list(DB.find({"author":str(author)}))
    if articles:
        serialized_articles = [serialize_article(article) for article in articles]
        return make_response(jsonify(articles), 200)
    else:
        return make_response(jsonify({"msg": "No articles found for this author."}), 404)

"""
Función para devolver la revisión de un artículo científico entregado.
    - Incluye además de su revisión, los datos necesarios del artículo científico
"""
@submit_bp.route(API + '/submit/<author>/<article_title>', methods = ['GET'])
@jwt_required()
def show_article(author, article_title):
    article = DB.find_one({"author":str(author), "title":article_title})
    if article:
        serialized_article = serialize_article(article)
        return make_response(jsonify(article), 200)
    else:
        return make_response(jsonify({"msg": "No articles found for this author."}), 404)
    


"""
Función para realizar una segunda entrega a un articulo cientifico ya revisado por parte del revisor. 
    - Para permitir la segunda entrega el resultado de revisión debe ser Pendiente de mejora
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

    # Obtener el resumen del artículo como un diccionario
    submit_summary = article_updated.get_summary_to_dict()

    threading.Thread(target=process_submit, args=(article_updated, temp_dir, True)).start()

    return jsonify({'status': 'success', 'message': 'Article updated and processing', 'submit_summary': submit_summary}), 200

