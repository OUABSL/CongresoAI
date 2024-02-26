from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from bson import json_util
from flask_cors import CORS
from src.config import MONGO_URI, LLAMUS_KEY

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['LLAMUS_KEY'] = LLAMUS_KEY
    app.config['MONGO_URI'] = MONGO_URI
    return app

def create_mongo(app):
    print(f"Created Database")
    return PyMongo(app)

def register_blueprints():
    from src.routes.users import users_bp
    app.register_blueprint(users_bp)
    print(f"Created Blueprint for {users_bp}")

def get_users_from_db(db):
    return list(db.users.find())

def create_response(users):
    if users:
        return jsonify(json_util.dumps(users))
    else:
        return jsonify({"error": "No users found"})

app = create_app()
mongo = create_mongo(app)

@app.route("/users", methods=["GET"])
def get_users():
    users = list(mongo.db.users.find())
    return jsonify(json_util.dumps(users)) if users else jsonify({"error": "No users found"})

@app.route("/", methods=["GET"])
def get_user():
    users = list(mongo.db.users.find())
    return jsonify(json_util.dumps(users)) if users else jsonify({"error": "No users found"})


def main():
    """Run the Flask application"""
    register_blueprints()
    app.run(host='localhost', port=5000, debug=True)

    
if __name__ == "__main__":
    main()
