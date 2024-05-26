from datetime import datetime
import threading, os, tempfile, shutil, logging
from bson.objectid import ObjectId
from flask import Blueprint, request, jsonify, abort
from flask import send_file, make_response, Response
from io import BytesIO
from bson import ObjectId 
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
from src.models.tabajo import ScientificArticle, get_file
from src.app import mongo, API, llamus_key
from src.services.preEvaluation import PreEvaluation
from src.services.summary import ArticleSummarizer
from src.services.dataPreparation import DataHandler
from src.services.summary import SYSTEM_PROMPT_BASE as prompt_summary
from src.services.preEvaluation import  SYSTEM_PROMPT_BASE as prompt_eval


evaluate_bp = Blueprint('evaluate', __name__)
DB = mongo.db.scientific_article
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')




UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data")

#Función para crear carpeta temporal para la extracción de datos desde el proyecto latex.
def create_temp_dir(parent_dir):
    return tempfile.mkdtemp(dir=parent_dir)

#Función para eliminar la carpeta temporal creada, se ejecuta al terminar la extracción de datos desde el proyecto latex. 
def delete_temp_dir(dest_path):
    # Eliminar la carpeta temporal usada en el proceso
    if os.path.isdir(dest_path):
        shutil.rmtree(dest_path)
        if os.path.isdir(dest_path): # verifica si la carpeta ºavía existe después de usar shutil.rmtree()
            os.rmdir(dest_path) # se utiliza os.rmdir() para eliminar la carpeta vacía
    logging.info("Carpeta temporal %s eliminada exitosamente", dest_path)



"""
Función para preparar un artículo científico para ser enviado en formato json, 
se eliminan las propiedades innecearias para la petición
"""
def serialize_article(article):
    if "_id" in article:
        article.pop("_id", None) 
    if "content" in article:
        article.pop("content", None)
    if "latex_project_id" in article and article["latex_project_id"]:
        article['latex_project_id'] = str(article['latex_project_id'])
    if "submitted_pdf_id" in article and article["submitted_pdf_id"]:
        article['submitted_pdf_id'] = str(article['submitted_pdf_id'])
    if "sorted_backup_assignment" in article:
        article.pop("sorted_backup_assignment", None)
    return article

# Obtener los artículos asignados a un revisor en particular
@evaluate_bp.route(API + '/evaluate/<reviewer>', methods = ['GET'])
@jwt_required()
def show_articles(reviewer):
    articles = list(DB.find({"reviewer":str(reviewer)}))
    if articles:
        result = []
        for article in articles:
            if article and 'submitted_pdf_id' in article.keys() and article.get('summary'):
                article["_id"] = str(article["_id"])
                submitted_pdf_id = article.get('submitted_pdf_id')
                if isinstance(submitted_pdf_id, ObjectId):
                    result.append(
                        {
                        "title": article.get("title"),
                        "description": article.get("description"),
                        "pdf": "/file/" + str(submitted_pdf_id),
                        "zip": "/zip/" + str(article.get("latex_project_id")),
                        "processing_state": article.get('processing_state'),
                        "submission_date":article.get("submission_date"),
                        "last_modified":article.get("last_modified"),
                        "review_result":article.get("review_result", "Pending Review"),
                        "submit_number":article.get("submit_number", 1),
                        "is_resubmited":article.get("is_resubmited", False)
                    }
                    )
        return make_response(jsonify(result), 200)
    else:
        return make_response(jsonify({"success":False,  "message": "No articles found for this reviewer."}), 404)

# Servir un archivo PDF solicitado por su id
@evaluate_bp.route(API + '/file/<file_id>', methods=['GET'])
def serve_pdf(file_id):
    pdf_file = get_file(file_id)
    return send_file(BytesIO(pdf_file), mimetype='application/pdf', as_attachment=False, download_name='pdf_file.pdf')
    
# Servir un archivo ZIP solicitado por su id
@evaluate_bp.route(API + '/zip/<file_id>', methods=['GET'])
def serve_zip(file_id):
    zip_file = get_file(file_id)
    return send_file(BytesIO(zip_file), mimetype='application/zip', as_attachment=False, download_name='latex_project.zip')


# Mostrar un artículo específico asignado a un revisor  
@evaluate_bp.route(API + '/evaluate/<reviewer>/<article_title>', methods = ['GET'])
@jwt_required()
def show_article(reviewer, article_title):
    article = DB.find_one({"reviewer":str(reviewer), "title":article_title})
    if article:
        serialized_articles = serialize_article(article)
        return make_response(jsonify(serialized_articles), 200)
    else:
        return make_response(jsonify({"success":False,  "message": "No articles found for this reviewer."}), 404)
    
# Agregar una revisión a un artículo
@evaluate_bp.route(API + '/evaluate/<reviewer>/<article_title>', methods = ['POST'])
@jwt_required()
def add_review(reviewer, article_title):
    article = DB.find_one({"reviewer":str(reviewer), "title":article_title})
    review = article.get('review')

    if not article:
        abort(404, description="No articles found for this reviewer.") 
    review_data = request.get_json()

    # Ensure that review data is provided
    if 'review' not in review_data or 'review_result' not in review_data:
        abort(400, description="Missing required review data.")
    print(f"Review data:  ${review_data['review']}")
    updated_review = dict(review_data['review'])
    for section_name, section_review in updated_review.items():
        review[section_name] = section_review

    review_result = str(review_data['review_result'])
    # Update the article with the new review
    new_review = {"review": review, "review_result": review_result}
    print(f"Review: {new_review}")
    
    DB.update_one({"title":article_title}, {"$set": new_review})
    logging.info("Revisión añadida exitosamente para el artículo con título: %s", article_title)
    return make_response(jsonify({"success":True,  "message": "Review successfully added!"}), 201)

# Actualizar una revisión a un artículo
@evaluate_bp.route(API + '/evaluate/<reviewer>/<article_title>', methods = ['PUT'])
@jwt_required()
def update_review(reviewer, article_title):
    """
    review = {section1:review_section1, section2: review_section2}
    review[section] = {
        Motivation: 'value',
        Novelty:'YES', 
        Clarity:'YES',
        Grammar and Style: 'Can be improved',
        Typos and Errors:'YES',
        Review_Comments = 'TEXT REVIEW'}
    }
    """
    
    review_data = request.get_json()
    article = DB.find_one({"reviewer":str(reviewer), "title":article_title})
    review = article.get("review")

    if article:
        if review:
            new_partial_review = review_data
            for section_name in new_partial_review.keys():
                review[section_name] = new_partial_review[section_name]

            print(f"Review: {new_partial_review}")
            DB.update_one(
                {"reviewer": reviewer, "title": article_title}, 
                {"$set": {"review": review}}
            )        
        else:
            return make_response(jsonify({"success":False,  "message": "No article review found for this reviewer."}), 404)
        logging.info("Revisión actualizada exitosamente para el artículo con título: %s y revisor: %s", article_title, reviewer)
        return make_response(jsonify({"success":True,  "message": "Review successfully updated!"}), 200)
    else:
        return make_response(jsonify({"success":False,  "message": "No article found for this reviewer."}), 404)
    

# Actualizar el estado de un artículo
@evaluate_bp.route(API + '/evaluate/<reviewer>/<article_title>', methods = ['PUT'])
@jwt_required()
def update_status(reviewer, article_title):
    article = DB.find_one({"reviewer":str(reviewer), "title":article_title})
    status = request.get_json()
    if article:
        update_status = { "pending": status }
        DB.update_one({"title":article_title}, {"$set": update_status})
        return make_response(jsonify({"success": False,  "message": "Status successfully updated!"}), 201)
    else:
        return make_response(jsonify({"success":False,  "message": "No articles found for this reviewer."}), 404)


def fetch_article(title:str, reviewer:str):
    article_object = ScientificArticle.objects(reviewer=reviewer, title=title).first()
    if not article_object:  # If no article was found
        return None

    return article_object

"""
Función para gestionar la tarea de regeneración de alguno de los servicios de la aplicación:
 #-Extractción y preparación del contenido del proyecto latex.
 - Resumen generado por la IA generativa
 - Evaluación inicial generada por la IA generativa
 
 Args: Artículo scientifico, los servicios a regenerar (Tarea: chat_model)

"""
def regenerate_pre_evaluation_flow(article:ScientificArticle, tasks:dict):
    try:

        summary = pre_evaluation = {}
        if "datapreparation" in tasks:
            if not os.path.exists(UPLOAD_FOLDER):
                os.makedirs(UPLOAD_FOLDER)
            dest_path = create_temp_dir(UPLOAD_FOLDER)
            data_handler = DataHandler(article, dest_path=dest_path)
            try:
                data_handler.run()
            except Exception as e:
                logging.error(f"Error during rungging DataHandler - evaluate.py-232:  {e}")
            finally:
                delete_temp_dir(dest_path)

        if "summary" in tasks:
            summary_instance = ArticleSummarizer(mongo, prompt_summary, llamus_key, article)
            #summary_instance.chat_model = tasks["summary"]
            summary = summary_instance.run()

        if "initialevaluation" in tasks:
            evaluation_instance = PreEvaluation(mongo, prompt_eval, llamus_key, article)
            #evaluation_instance.chat_model = tasks["initialevaluation"]
            pre_evaluation = evaluation_instance.run()

        error = ("Error" in summary.values()) or ("Error" in pre_evaluation.values())
        if summary and not "Error" in summary.values():
            article.update_properties(summary=summary)

        if pre_evaluation and not "Error" in pre_evaluation.values():
            article.update_properties(evaluation=pre_evaluation)

        if error:
            article.update_properties(processing_state="Fail")
        else:
            article.update_properties(processing_state="Done")
            logging.info(f"La regeneración de la pre-evaluación se realizó con éxito para el artículo:  {article.title}")

        article.save()


    except Exception as e:
        logging.error(f"Error during regeneration of pre-evaluation flow - evaluate.py-252:  {e}")
        # Actualizar el estado de procesamiento en caso de error
        article.update_properties(processing_state="Fail")



# Genera nueva pre evaluación o resumen usando llamus para un artículo
@evaluate_bp.route(API + '/evaluate/reevaluate/<reviewer>/<article_title>', methods=['PUT'])
@jwt_required()
def regenerate_pre_evaluation(reviewer, article_title):
    tasks = request.json 
    #Recoger el articulo en formato JSON
    article = fetch_article(article_title, reviewer)
    
    if article is None:
        return make_response(jsonify({"success":False,  "message": "No article found."}), 404)

    article.update_properties(processing_state="On Process")
    
    threading.Thread(target=regenerate_pre_evaluation_flow, args=(article, tasks)).start()
    return make_response(jsonify({"success":True,  "message": "Reevaluation started successfully."}), 200)

# asigna un nuevo revisor a un artículo
@evaluate_bp.route(API + '/evaluate/reassignate/<reviewer>/<article_title>', methods=['PUT'])
@jwt_required()
def reassignate_reviewer(reviewer, article_title):
    article = fetch_article(article_title, reviewer)
    if article is None:
        return make_response(jsonify({"success":False,  "message": "No article found."}), 404)
    
    if(len(article.sorted_backup_assignment)>0):
        new_reviewer = article.sorted_backup_assignment[0][1]
        DB.update_one(
            {"title": article_title},
            {"$set": {"reviewer": new_reviewer}}
        )
    else:
        return make_response(jsonify({"success":False,  "message": "There is no disponible reviewer.Please contact the adminastator!"}), 406)

    return make_response(jsonify({"success":True,  "message": f"Re-Assignement done successfully. The new assigned reviewer is {new_reviewer}."}), 200)

