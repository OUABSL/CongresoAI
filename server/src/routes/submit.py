from bson.objectid import ObjectId
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
from src.models.tabajo import ScientificArticle  
from src.app import mongo, API, llamus_key
from src.services.dataPreparation import DataHandler
from src.services.preEvaluation import PreEvaluation
from src.services.summary import ArticleSummarizer
from src.services.summary import SYSTEM_PROMPT_BASE as prompt_summary
from src.services.preEvaluation import  SYSTEM_PROMPT_BASE as prompt_eval
from src.services.preEvaluation import  SYSTEM_PROMPT_RESUBMIT as prompt_eval_resubmit
from src.services.reviewerAssignment import ReviewerAssignment
import tempfile, shutil, threading, os
import logging, json
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

"""
Función para gestionar la entrega de artículo científico por autor. incluye la gestión de las primeras entregas y las entregas de mejora. 
- Maneja la extracción de datos, el resumen y la evaluación inicial por la IA generativa. 
- En caso de primera entrega, ejecuta el proceso de asignación de revisores.
- Incluye la actualización del artículo en base de datos

Args: Artículo, ruta de procesamiento, es entrega de mejora?
"""
def process_submit(article:ScientificArticle, dest_path, resubmit:bool = False):
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
            pre_evaluation_instance = PreEvaluation(mongo,  prompt_eval_resubmit, llamus_key, article, resubmit)


        summary =summary_instance.run()
        pre_evaluation = pre_evaluation_instance.run()
        
        error = ("Error" in summary.values()) or ("Error" in pre_evaluation.values())

        if summary and not "Error" in summary.values():
            article.update_properties(summary=summary)

        if pre_evaluation and not "Error" in pre_evaluation.values():
            article.update_properties(evaluation=pre_evaluation)

        if error:
            article.update_properties(processing_state="Fail")
        else:
            article.update_properties(processing_state="Done")
            logging.info(f"La generación de la pre-evaluación se realizó con éxito para el artículo: {article.title}")


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
        return jsonify({"success":False, "message": "You do not have access to this resource"}), 403

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    temp_dir = create_temp_dir(UPLOAD_FOLDER)

    loged_in_author = mongo.db.authors.find_one({'username':get_jwt_identity()})

    file_obj = request.files.get('latex_project', None)
    title = request.form.get("title", None)
    description = request.form.get("description", None)
    key_words = json.loads(request.form.get('key_words', None))
    username = get_jwt_identity()

    # Comprobar la existencia de todos los campos requiridos
    if not all([file_obj, title, description, key_words, loged_in_author]):
        message = "Missing required fields, {}{}".format("File is missing; " if not file_obj else "",
                                                         "Form fields are missing; " if not all([title, description, key_words, loged_in_author]) else "")
        return jsonify({'success':False, 'message': message}), 422
    
    # Comprobar la existencia del título del artículo
    existing_article = mongo.db.articles.find_one({'title': title})

    if existing_article:
        # Devolver con un mensaje de error si el artículo ya existe
        return jsonify({'success': False, 'message': 'An article with this title already exists'}), 400


    key_words = key_words
    submission_id = str(uuid4())
    article = ScientificArticle(author = username, submission_id=submission_id ,title=title, description=description, key_words=key_words, submit_number = 1)
    article.save_files(latex_project=file_obj)
    article.save()
    threading.Thread(target=process_submit, args=(article, temp_dir)).start()
    # Obtener el resumen de la entrega como un diccionario
    submit_summary = article.get_summary_to_dict()

    # Devolver el resumen del artículo junto con el mensaje de éxito
    return jsonify({'success':True, 'message': 'File uploaded and processing', 'submit_summary': submit_summary}), 201

"""
Función para preparar un artículo científico para ser enviado en formato json, 
se eliminan las propiedades innecearias para la petición
"""
def serialize_article(article):
    if "_id" in article:
        article.pop("_id", None) 
    if "content" in article:
        article.pop("content", None)
    if "summary" in article:
        article.pop("summary", None)
    if "evaluation" in article:
        article.pop("evaluation", None)
    if "latex_project_id" in article and article["latex_project_id"]:
        article['latex_project_id'] = str(article['latex_project_id'])
    if "submitted_pdf_id" in article and article["submitted_pdf_id"]:
        article['submitted_pdf_id'] = str(article['submitted_pdf_id'])
    if "review_result" in article and article.get("review_result") == "Pending Review":
        article.pop("review", None)
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
        return make_response(jsonify(serialized_articles), 200)
    else:
        return make_response(jsonify({'success':False,"message": "No articles found for this author."}), 404)

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
        return make_response(jsonify(serialized_article), 200)
    else:
        return make_response(jsonify({"success":False, "message": "No articles found for this author."}), 404)
    


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
        return jsonify({'success':False, "message": "You do not have access to this resource"}), 403
     # Buscar el artículo por autor y título
    #article = DB.find_one({"author": author, "title": title})
    article_updated = ScientificArticle.objects(author=author, title=title).first()


    # Si no se encuentra el artículo
    if not article_updated:
        return jsonify({'success':False, "message": "Article not found"}), 404
    
    key_words = json.loads(request.form.get('key_words', None))
    description = request.form.get('description', None)
    file_obj = request.files.get('latex_project', None)
    improvements = request.form.get('improvements', None)
    review_comments = request.form.get('review_comments', None)
    resubmit = request.form.get('resubmit', None)


    temp_dir = create_temp_dir(UPLOAD_FOLDER)

    # Verificar si todos los campos requeridos están presentes
    if not all([description, key_words,file_obj, improvements, review_comments, resubmit]):
        message = "Missing required fields, {}{}".format(
            "File is missing; " if not file_obj else "",
            "Form fields are missing; " if not all([
                improvements, review_comments, resubmit]) else "")
        return jsonify({'success':False, 'message': message}), 422
    
    old_review_result = article_updated["review_result"]

    # Actualizar el artículo
    article_updated.save_files(latex_project=file_obj)
    article_updated.update_properties(
        key_words = key_words,
        description = description,
        is_resubmited = True,
        review_result = "Pending Review",
        submit_number = 2,
        old_review_result = old_review_result,
        improvements=improvements,
        processing_state="On Process" #TODO: Falta mejorar la logica de resubmit
    )
    print(f"Actualizado el articulo {article_updated.title}, {article_updated.processing_state}")
    article_updated.save()

    # Obtener el resumen del artículo como un diccionario
    submit_summary = article_updated.get_summary_to_dict()

    threading.Thread(target=process_submit, args=(article_updated, temp_dir, True)).start()

    return jsonify({'success':True, 'message': 'Article updated and processing', 'submit_summary': submit_summary}), 200

