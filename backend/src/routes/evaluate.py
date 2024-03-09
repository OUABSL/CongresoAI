import json
from bson.objectid import ObjectId
from flask import Blueprint, request, jsonify
from flask import send_file, make_response, Response
from io import BytesIO
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.models.user import User, Author
from src.models.tabajo import ScientificArticle, get_file
from src.app import app, mongo, LLAMUS_KEY, API


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
                        "processing_state": article.get('processing_state')
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
    #article = db.find_one({"reviewer":str(reviewer), "title":title, "pending":True})
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
    article = db.find_one({"title":article_title})

    if article:
        new_review = { "review": review_data }
        db.update_one({"title":article_title}, {"$set": new_review})
        return make_response(jsonify({"msg": "Review successfully added!"}), 201)
    else:
        return make_response(jsonify({"msg": "No articles found for this reviewer."}), 404)
    
    
@evaluate_bp.route(API + '/evaluate/<reviewer>/<article_title>', methods = ['PUT'])
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

