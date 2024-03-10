from flask import Flask, Response, jsonify
from flask_pymongo import PyMongo
import mongoengine as me
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Cargar el archivo .env
load_dotenv()

# Acceder a las variables de entorno
mongo_uri = os.environ['MONGO_URI']
llamus_key = os.environ['LLAMUS_KEY']
jwt_key = os.environ['JWT_KEY']




def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['LLAMUS_KEY'] = llamus_key
    app.config['MONGO_URI'] = mongo
    app.config["JWT_SECRET_KEY"] = jwt_key
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
