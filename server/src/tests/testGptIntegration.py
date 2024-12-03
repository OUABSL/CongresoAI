import json
import logging
from numbers import Number
import os
import shutil
import tempfile
from uuid import uuid4
from flask import Blueprint, request, jsonify, abort, send_file, make_response
from src.models.manuscript import ScientificArticle
from src.services.dataPreparation import DataHandler
from src.services.preEvaluation import PreEvaluation
from src.services.reviewerAssignment import ReviewerAssignment
from src.services.summary import ArticleSummarizer
from src.app import mongo, API, llamus_key, gpt_key
from src.services.summary import SYSTEM_PROMPT_BASE as prompt_summary
from src.services.preEvaluation import SYSTEM_PROMPT_BASE as prompt_eval

test_gpt_bp = Blueprint('test-gpt', __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data")
DB = mongo.db.scientific_article
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Función para crear carpeta temporal para la extracción de datos desde el proyecto latex.
def create_temp_dir(parent_dir):
    return tempfile.mkdtemp(dir=parent_dir)

# Función para eliminar la carpeta temporal creada, se ejecuta al terminar la extracción de datos desde el proyecto latex.
def delete_temp_dir(dest_path):
    # Eliminar la carpeta temporal usada en el proceso
    if os.path.isdir(dest_path):
        shutil.rmtree(dest_path)
        if os.path.isdir(dest_path):  # verifica si la carpeta todavía existe después de usar shutil.rmtree()
            os.rmdir(dest_path)  # se utiliza os.rmdir() para eliminar la carpeta vacía
            print(f"Eliminada la carpeta temporal {dest_path}")

@test_gpt_bp.route(API + '/test', methods=['POST'])
def test_gpt():
    print("Entrando en process_submit")

    file_obj = request.files.get('latex_project', None)
    title = request.form.get("title", None)
    description = request.form.get("description", None)
    key_words = json.loads(request.form.get('key_words', None))
    username = "ouabou"

    # Comprobar la existencia de todos los campos requiridos
    if not all([file_obj, title, description, key_words]):
        message = "Missing required fields, {}{}".format("File is missing; " if not file_obj else "",
                                                         "Form fields are missing; " if not all([title, description, key_words]) else "")
        return jsonify({'success': False, 'message': message}), 422

    # Comprobar la existencia del título del artículo
    existing_article = mongo.db.scientific_article.find_one({'title': title, 'author': username})

    if existing_article:
        # Devolver con un mensaje de error si el artículo ya existe
        return jsonify({'success': False, 'message': 'An article with this title already exists'}), 400

    key_words = key_words
    submission_id = str(uuid4())
    article = ScientificArticle(author=username, submission_id=submission_id, title=title, description=description, key_words=key_words, submit_number=1)
    article.save_files(latex_project=file_obj)
    article.save()

    # PROCESS SUBMIT

    try:
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        temp_dir = create_temp_dir(UPLOAD_FOLDER)

        data_handler = DataHandler(article, dest_path=temp_dir)
        data_handler.run()

        summary_instance = ArticleSummarizer(mongo, prompt_summary, gpt_key, article)
        pre_evaluation_instance = PreEvaluation(mongo, prompt_eval, gpt_key, article)
        assignment_agent = ReviewerAssignment(mongo=mongo, article=article)
        assignment_agent.run()

        summary = summary_instance.run()
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
        # Eliminar la carpeta temporal usada en el proceso
        delete_temp_dir(temp_dir)

    return jsonify(article.to_dict())
