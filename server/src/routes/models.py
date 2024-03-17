from flask import Blueprint, jsonify, request
from app import mongo, API

models_bp = Blueprint('models', __name__)


@models_bp.route(API + "/models", methods=["GET"])
def get_models():
    models = mongo.db.models.find()
    

    return jsonify([model["name"] for model in models])

@models_bp.route(API + "/models", methods=["POST"])
def insert_model():
    mongo.db.models.insert_one({"name": request.json['name']})
    return {"msg": "Model added successfully"}, 201

@models_bp.route(API + "/models/<model_name>", methods=["DELETE"])
def delete_a_model(model_name):
    mongo.db.models.delete_one({"name": model_name})
    return {"msg": "Model deleted successfully"}, 204