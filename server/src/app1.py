from flask import Flask, Response, abort, jsonify, send_from_directory
from flask_pymongo import PyMongo
import mongoengine as me
import os, sys
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

    app.register_blueprint(admin_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(submit_bp)
    app.register_blueprint(evaluate_bp)
    app.register_blueprint(models_bp)
    app.register_blueprint(tags_bp)

    print(f"Created Blueprint for {admin_bp}")
    print(f"Created Blueprint for {users_bp}")
    print(f"Created Blueprint for {submit_bp}")
    print(f"Created Blueprint for {evaluate_bp}")
    print(f"Created Blueprint for {models_bp}")


API = '/api/v1'
app = create_app()
mongo, mongo_engine = create_mongo(app)
jwt = JWTManager(app)
register_blueprints(app)


# Define la carpeta de archivos estáticos
app.static_folder = 'data'

# Si necesitas acceder a los archivos dentro de la carpeta 'manuales', entonces la ruta base sería '/manuales'
#app.static_url_path = '/manuales'
#print(f"La ruta est es {app.static_folder} y {os.getcwd()}")


MANUALS_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data/manuales")
# Ruta para servir el manual del revisor
@app.route("/api/v1/manuales/manual-reviewer", methods=["GET"])
def send_manual_reviewer():
    try:
        # Ruta absoluta del archivo manual-revisor-theaicongress.pdf
        return send_from_directory(MANUALS_FOLDER, "manual-revisor-theaicongress.pdf", as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except IsADirectoryError:
        return jsonify({"error": "Not a file"}), 400

# Ruta para servir el manual del autor
@app.route("/api/v1/manuales/manual-author", methods=["GET"])
def send_manual_author():
    try:
        # Ruta absoluta del archivo manual-autor-theaicongress.pdf
        return send_from_directory(MANUALS_FOLDER, "manual-autor-theaicongress.pdf", as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except IsADirectoryError:
        return jsonify({"error": "Not a file"}), 400

# En el caso de ejecución en local sin el uso de docker 
"""
Nota: Para la ejecución en local se debe considerar la definición de carpeta server como carpeta raíz de la ejecución  
"""
def main():
    """Ejecutar la aplicación Flask"""
    #app.run(host='localhost', port=5000, debug=True)
    app.run()
