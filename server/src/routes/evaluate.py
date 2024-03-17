from datetime import datetime
import threading
from bson.objectid import ObjectId
from flask import Blueprint, request, jsonify
from flask import send_file, make_response, Response
from io import BytesIO
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
from models.user import User, Author
from models.tabajo import ScientificArticle, get_file
from app import mongo, API, llamus_key
from services.PreEvaluation import PreEvaluation
from services.summary import ArticleSummarizer
from services.dataPreparation import DataHandler
from bson import ObjectId 
from services.summary import SYSTEM_PROMPT_BASE as prompt_summary
from services.PreEvaluation import  SYSTEM_PROMPT_BASE as prompt_eval


evaluate_bp = Blueprint('evaluate', __name__)
db = mongo.db.scientific_article
@evaluate_bp.route(API + '/evaluate/<reviewer>', methods = ['GET'])
@jwt_required()
def show_articles(reviewer):
    articles = list(db.find({"reviewer":str(reviewer)}))
    if articles:
        result = []
        for article in articles:
            if article and 'submitted_pdf_id' in article.keys() and article.get('summary'):
                article["_id"] = str(article["_id"])
                submitted_pdf_id = article.get('submitted_pdf_id')
                if isinstance(submitted_pdf_id, ObjectId):
                    result.append({
                        "title": article.get("title"),
                        "description": article.get("description"),
                        "pdf": "/file/" + str(submitted_pdf_id),
                        "zip": "/zip/" + str(article.get("latex_project_id")),
                        "processing_state": article.get('processing_state'),
                        "submission_date":article.get("submission_date"),
                        "last_modified":article.get("last_modified")
                    })
        return make_response(jsonify(result), 200)
    else:
        return make_response(jsonify({"msg": "No articles found for this reviewer."}), 404)


@evaluate_bp.route(API + '/file/<file_id>', methods=['GET'])
def serve_pdf(file_id):
    pdf_file = get_file(file_id)
    return send_file(BytesIO(pdf_file), mimetype='application/pdf', as_attachment=False, download_name='pdf_file.pdf')
    

@evaluate_bp.route(API + '/zip/<file_id>', methods=['GET'])
def serve_zip(file_id):
    zip_file = get_file(file_id)
    return send_file(BytesIO(zip_file), mimetype='application/zip', as_attachment=False, download_name='latex_project.zip')




@evaluate_bp.route(API + '/evaluate/<reviewer>/<article_title>', methods = ['GET'])
#@jwt_required()
def show_article(reviewer, article_title):
    article = db.find_one({"reviewer":str(reviewer), "title":article_title})
    print("Hola")
    article = db.find_one({"title":article_title})
    print(article)
    if article:
        article.pop("_id")
        article.pop("content")
        article['latex_project_id'] = str(article.get('latex_project_id'))
        article['submitted_pdf_id'] = str(article.get('submitted_pdf_id'))
        return make_response(jsonify(article), 200)
    else:
        return make_response(jsonify({"msg": "No articles found for this reviewer."}), 404)
    

@evaluate_bp.route(API + '/evaluate/<reviewer>/<article_title>', methods = ['POST'])
def add_review(reviewer, article_title):
    #article = db.find_one({"reviewer":str(reviewer), "title":title, "pending":True})
    review_data = request.get_json()
    print(f"Review data:  ${review_data['review']}")
    article = db.find_one({"title":article_title})

    if article:
        new_review = { "review": review_data['review'] }
        db.update_one({"title":article_title}, {"$set": new_review})
        return make_response(jsonify({"msg": "Review successfully added!"}), 201)
    else:
        return make_response(jsonify({"msg": "No articles found for this reviewer."}), 404)
    
    
@evaluate_bp.route(API + '/evaluate/<reviewer>/<article_title>', methods = ['PUT'])
#@jwt_required()
def update_status(reviewer, article_title):
    article = db.find_one({"reviewer":str(reviewer), "title":article_title, "pending":True})
    status = request.get_json()
    #article = db.find_one({"title":article_title})
    if article:
        update_status = { "pending": status }
        db.update_one({"title":article_title}, {"$set": update_status})
        return make_response(jsonify({"msg": "Status successfully updated!"}), 201)
    else:
        return make_response(jsonify({"msg": "No articles found for this reviewer."}), 404)


def fetch_article(title:str, reviewer:str):
    article_data = db.find_one({"title": title, "reviewer": reviewer})
    print(article_data, "\nDat: ", title, reviewer)
    if not article_data:  # If no article was found
        return None
    article_data.pop("_id")  
    article_object = ScientificArticle(**article_data)

    return article_object

def regenerate_pre_evaluation_flow(article:ScientificArticle, tasks:dict):
    try:
        update_data = {}  # Datos para actualizar

        if "summary" in tasks:
            summary_instance = ArticleSummarizer(mongo, prompt_summary, llamus_key, article)
            summary_instance.chat_model = tasks["summary"]
            summary = summary_instance.run()
            update_data["summary"] = summary  # Actualizar el resumen en los datos de actualización        

        if "initialevaluation" in tasks:
            evaluation_instance = PreEvaluation(mongo, prompt_eval, llamus_key, article)
            evaluation_instance.chat_model = tasks["initialevaluation"]
            preevaluation = evaluation_instance.run()
            update_data["evaluation"] = preevaluation

        update_data["last_modified"] = datetime.now()
        update_data["processing_state"] = "Done"

        db.update_one(
            {"reviewer": article["reviewer"], "title": article.title},
            {"$set": update_data}
        )
    except Exception as e:
        print(e)  # Imprimir el error
        # Actualizar el estado de procesamiento en caso de error
        db.update_one(
            {"reviewer": article["reviewer"], "title": article.title},
            {"$set": {"processing_state": "Fail"}}
        )
    return None


@evaluate_bp.route(API + '/reevaluate/<reviewer>/<article_title>', methods=['PUT'])
@jwt_required()
def regenerate_pre_evaluation(reviewer, article_title):
    tasks = request.json  # get data from JSON in the request body
    article = fetch_article(article_title, reviewer)
    
    if article is None:
        return make_response(jsonify({"msg": "No article found."}), 404)

    db.update_one(
        {"reviewer": article["reviewer"], "title": article_title},
        {"$set": {"processing_state": "On Process"}}
    )
    threading.Thread(target=regenerate_pre_evaluation_flow, args=(article, tasks)).start()
    return make_response(jsonify({"msg": "Reevaluation started successfully."}), 200)