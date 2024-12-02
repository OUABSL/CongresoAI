from flask import Flask, Response, jsonify
from flask_pymongo import PyMongo
from pymongo import MongoClient
import mongoengine as me
import os, sys
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv


# Cargar el archivo .env
load_dotenv()

print(sys.path[0])
# Acceder a las variables de entorno
mongo_uri = os.environ['MONGO_URI']
llamus_key = os.environ['LLAMUS_KEY']
jwt_key = os.environ['JWT_KEY']
hf_email = os.environ['EMAIL_HF']
hf_pass = os.environ['PASS_HF']
gpt_key = os.environ['GPT_KEY']


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['LLAMUS_KEY'] = llamus_key
    app.config['MONGO_URI'] = mongo_uri
    app.config["JWT_SECRET_KEY"] = jwt_key
    app.config['GPT_KEY'] = gpt_key

    return app

def create_mongo(app):
    mongo_uri = app.config['MONGO_URI']
    mongo = PyMongo(app, uri=mongo_uri)
    mongoengine = me.connect('congresodb', host='mongodb', port=27017)
    return mongo, mongoengine

def register_blueprints(app):
    from src.routes.users import users_bp
    from src.routes.submit import submit_bp
    from src.routes.evaluate import evaluate_bp
    from src.routes.models import models_bp
    from src.routes.admin import admin_bp
    from src.utils.tags import tags_bp
    from src.tests.testGptIntegration import test_gpt_bp

    app.register_blueprint(users_bp)
    app.register_blueprint(submit_bp)
    app.register_blueprint(evaluate_bp)
    app.register_blueprint(models_bp)
    app.register_blueprint(tags_bp)
    app.register_blueprint(test_gpt_bp)

    print(f"Created Blueprint for {users_bp}")
    print(f"Created Blueprint for {submit_bp}")
    print(f"Created Blueprint for {evaluate_bp}")
    print(f"Created Blueprint for {models_bp}")



def get_users_from_db(db):
    return list(db.users.find())


API = '/api/v1'
app = create_app()
mongo, mongo_engine = create_mongo(app)
jwt = JWTManager(app)
register_blueprints(app)

@app.route("/", methods=["GET"])
def index():
    return "Bienvenido en el servidor de The AI Congress!"


@app.route(API + "/", methods=["GET"])
def api_index():
    return "Bienvenido en el servidor de The AI Congress!"

@app.route(API + "/users", methods=["GET"])
def users():
    ls = mongo.db.authors.find()
    print("ls:" , ls)
    return f"The system users are mega:\n {(e.username for e in ls)}"

def main():
    """Run the Flask application"""
    #app.run(host='localhost', port=5000, debug=True)
    app.run()

    
# if __name__ == "__main__":
#     main()
