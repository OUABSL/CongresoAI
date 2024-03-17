from flask import Flask, Response, jsonify
from flask_pymongo import PyMongo
import mongoengine as me
import os
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Cargar el archivo .env
load_dotenv()

# Acceder a las variables de entorno
mongo_uri = os.environ['MONGO_URI']
llamus_key = os.environ['LLAMUS_KEY']
jwt_key = os.environ['JWT_KEY']
hf_email = os.environ['EMAIL_HF']
hf_pass = os.environ['PASS_HF']



def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['LLAMUS_KEY'] = llamus_key
    app.config['MONGO_URI'] = mongo_uri
    app.config["JWT_SECRET_KEY"] = jwt_key
    return app

def create_mongo(app):
    print(f"Created Database")
    mongo = PyMongo(app)
    mongoengine = me.connect('congresodb', host='localhost', port=27017)

    return mongo, mongoengine

def register_blueprints():
    from routes.users import users_bp
    from routes.submit import submit_bp
    from routes.evaluate import evaluate_bp
    from routes.models import models_bp

    app.register_blueprint(users_bp)
    app.register_blueprint(submit_bp)
    app.register_blueprint(evaluate_bp)
    app.register_blueprint(models_bp)

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


@app.route(API + "/", methods=["GET"])
def index():
    return app.send_static_file('index.html')

def main():
    """Run the Flask application"""
    register_blueprints()
    app.run(host='localhost', port=5000, debug=True)

    
if __name__ == "__main__":
    main()
