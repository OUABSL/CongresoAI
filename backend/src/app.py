from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import os, sys
from bson import json_util
from flask_cors import CORS


sys.path[0] = os.path.join(os.getcwd(), "backend")
from src.config import MONGO_URI, LLAMUS_KEY

def create_app():
    # Create the Flask application
    app = Flask(__name__)
    CORS(app)

    # Set up additional configurations
    app.config['LLAMUS_KEY'] = LLAMUS_KEY
    app.config['MONGO_URI'] = MONGO_URI

    # Initialize PyMongo with the Flask application
    mongo = PyMongo(app)

    return app, mongo

app, mongo = create_app()

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
    app.run(host='localhost', port=5000, debug=True)

if __name__ == "__main__":
    main()
