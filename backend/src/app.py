import bson
from flask import Flask, Response, request, jsonify
from flask_pymongo import PyMongo
import gridfs
import mongoengine as me

import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from bson import json_util
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from src.config import MONGO_URI, LLAMUS_KEY, JWT_KEY



def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['LLAMUS_KEY'] = LLAMUS_KEY
    app.config['MONGO_URI'] = MONGO_URI
    app.config["JWT_SECRET_KEY"] = JWT_KEY
    return app

def create_mongo(app):
    print(f"Created Database")
    mongo = PyMongo(app)
    mongoengine = me.connect('congresodb', host='localhost', port=27017)

    return mongo, mongoengine

def register_blueprints():
    from src.routes.users import users_bp
    from src.routes.submit import submit_bp
    from src.routes.evaluate import evaluate_bp

    app.register_blueprint(users_bp)
    app.register_blueprint(submit_bp)
    app.register_blueprint(evaluate_bp)



    print(f"Created Blueprint for {users_bp}")
    print(f"Created Blueprint for {submit_bp}")
    print(f"Created Blueprint for {evaluate_bp}")


def get_users_from_db(db):
    return list(db.users.find())

def create_response(users):
    if users:
        return jsonify(json_util.dumps(users))
    else:
        return jsonify({"error": "No users found"})

API = '/api/v1'
app = create_app()
mongo, mongo_engine = create_mongo(app)
jwt = JWTManager(app)


@app.route(API + "/users", methods=["GET"])
def get_users():
    users = list(mongo.db.users.find())
    return jsonify(json_util.dumps(users)) if users else jsonify({"error": "No users found"})

@app.route(API + "/", methods=["GET"])
def get_user():
    users = list(mongo.db.users.find())
    return jsonify(json_util.dumps(users)) if users else jsonify({"error": "No users found"})

@app.route(API + "/file/<file_id>")
def get_file(file_id):
    try:
        file = gridfs.GridFSBucket(mongo.db).open_download_stream(bson.ObjectId(str(file_id)))
    except:
        return jsonify({'error': 'file not found'}), 404
    return Response(file, mimetype='application/octet-stream')

def main():
    """Run the Flask application"""
    register_blueprints()
    app.run(host='localhost', port=5000, debug=True)

    
if __name__ == "__main__":
    main()
