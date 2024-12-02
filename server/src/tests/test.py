import os,sys
from flask import Blueprint, jsonify, request
sys.path[0] = os.getcwd()
from src.tags_bp import mongo, API


tags_bp = Blueprint('tags', __name__)

tags = mongo.db.tags_suggestions

suggestions_ENG = [
    { "id": 1, "text": "Artificial Intelligence" },
    { "id": 2, "text": "Computer Science" },
    { "id": 3, "text": "Information Technology" },
    { "id": 4, "text": "Data Science" },
    { "id": 5, "text": "Machine Learning" },
    { "id": 6, "text": "Bioinformatics" },
    { "id": 7, "text": "Computer Aided Design" },
    { "id": 8, "text": "Cybersecurity" },
    { "id": 9, "text": "Computer Networks" },
    { "id": 10, "text": "Database Management System" },
    { "id": 11, "text": "Operating Systems" },
    { "id": 12, "text": "Software Engineering" },
    { "id": 13, "text": "Web Development" },
    { "id": 14, "text": "Mobile Development" },
    { "id": 15, "text": "Embedded Systems" },
    { "id": 16, "text": "Robotics" },
    { "id": 17, "text": "Game Development" },
    { "id": 18, "text": "Multimedia Technology" },
    { "id": 19, "text": "Blockchain Technology" },
    { "id": 20, "text": "Augmented Reality" },
    { "id": 21, "text": "Virtual Reality" },
    { "id": 22, "text": "Cloud Computing" },
    { "id": 23, "text": "Data Mining" },
    { "id": 24, "text": "Networking" },
    { "id": 25, "text": "Cryptography" },
    { "id": 26, "text": "Physics" },
    { "id": 27, "text": "Chemistry" },
    { "id": 28, "text": "Biology" },
    { "id": 29, "text": "Mathematics" },
    { "id": 30, "text": "Astrophysics" },
    { "id": 31, "text": "Geology" },
    { "id": 32, "text": "Environmental Science" },
    { "id": 33, "text": "Neuroscience" },
    { "id": 34, "text": "Psychology" },
    { "id": 35, "text": "Materials Science" },
    { "id": 36, "text": "Astronomy" },
    { "id": 37, "text": "Oceanography" },
    { "id": 38, "text": "Meteorology" },
    { "id": 39, "text": "Ecology" },
    { "id": 40, "text": "Genetics" },
    { "id": 41, "text": "Immunology" },
    { "id": 42, "text": "Pharmacology" },
    { "id": 43, "text": "Biochemistry" },
    { "id": 44, "text": "Biophysics" },
    { "id": 45, "text": "Quantum Physics" },
    { "id": 46, "text": "Nanotechnology" },
    { "id": 47, "text": "Cognitive Science" },
    { "id": 48, "text": "Forensic Science" },
    { "id": 49, "text": "Anthropology" },
    { "id": 50, "text": "Archaeology" },
    { "id": 51, "text": "Logic" },
    { "id": 52, "text": "Mathematical Logic" },
    { "id": 53, "text": "Modal Logic" },
    { "id": 54, "text": "Temporal Logic" },
    { "id": 55, "text": "Intuitionistic Logic" },
    { "id": 56, "text": "Fuzzy Logic" },
    { "id": 57, "text": "Philosophical Logic" },
    { "id": 58, "text": "Set Theory" },
    { "id": 59, "text": "Proof Theory" },
    { "id": 60, "text": "Model Theory" },
    { "id": 61, "text": "Recursion Theory" },
    { "id": 62, "text": "Type Theory" },
    { "id": 63, "text": "Category Theory" },
    { "id": 64, "text": "Formal Methods" },
    { "id": 65, "text": "Automata Theory" },
    { "id": 66, "text": "Complexity Theory" },
    { "id": 67, "text": "Information Theory" },
    { "id": 68, "text": "Game Theory" },
    { "id": 69, "text": "Decision Theory" },
    { "id": 70, "text": "Philosophy of Science" },
    { "id": 71, "text": "History of Science" }
]


suggestions_ESP = [
    { "id": 1, "text": "Inteligencia Artificial" },
    { "id": 2, "text": "Ciencias de la Computación" },
    { "id": 3, "text": "Tecnología de la Información" },
    { "id": 4, "text": "Ciencia de Datos" },
    { "id": 5, "text": "Aprendizaje Automático" },
    { "id": 6, "text": "Bioinformática" },
    { "id": 7, "text": "Diseño Asistido por Computadora" },
    { "id": 8, "text": "Ciberseguridad" },
    { "id": 9, "text": "Redes de Computadoras" },
    { "id": 10, "text": "Sistema de Gestión de Bases de Datos" },
    { "id": 11, "text": "Sistemas Operativos" },
    { "id": 12, "text": "Ingeniería de Software" },
    { "id": 13, "text": "Desarrollo Web" },
    { "id": 14, "text": "Desarrollo Móvil" },
    { "id": 15, "text": "Sistemas Embebidos" },
    { "id": 16, "text": "Robótica" },
    { "id": 17, "text": "Desarrollo de Juegos" },
    { "id": 18, "text": "Tecnología Multimedia" },
    { "id": 19, "text": "Tecnología de Cadena de Bloques" },
    { "id": 20, "text": "Realidad Aumentada" },
    { "id": 21, "text": "Realidad Virtual" },
    { "id": 22, "text": "Computación en la Nube" },
    { "id": 23, "text": "Minería de Datos" },
    { "id": 24, "text": "Redes" },
    { "id": 25, "text": "Criptografía" },
    { "id": 26, "text": "Física" },
    { "id": 27, "text": "Química" },
    { "id": 28, "text": "Biología" },
    { "id": 29, "text": "Matemáticas" },
    { "id": 30, "text": "Astrofísica" },
    { "id": 31, "text": "Geología" },
    { "id": 32, "text": "Ciencias Ambientales" },
    { "id": 33, "text": "Neurociencia" },
    { "id": 34, "text": "Psicología" },
    { "id": 35, "text": "Ciencia de Materiales" },
    { "id": 36, "text": "Astronomía" },
    { "id": 37, "text": "Oceanografía" },
    { "id": 38, "text": "Meteorología" },
    { "id": 39, "text": "Ecología" },
    { "id": 40, "text": "Genética" },
    { "id": 41, "text": "Inmunología" },
    { "id": 42, "text": "Farmacología" },
    { "id": 43, "text": "Bioquímica" },
    { "id": 44, "text": "Biofísica" },
    { "id": 45, "text": "Física Cuántica" },
    { "id": 46, "text": "Nanotecnología" },
    { "id": 47, "text": "Ciencia Cognitiva" },
    { "id": 48, "text": "Ciencia Forense" },
    { "id": 49, "text": "Antropología" },
    { "id": 50, "text": "Arqueología" },
    { "id": 51, "text": "Lógica" },
    { "id": 52, "text": "Lógica Matemática" },
    { "id": 53, "text": "Lógica Modal" },
    { "id": 54, "text": "Lógica Temporal" },
    { "id": 55, "text": "Lógica Intuicionista" },
    { "id": 56, "text": "Lógica Difusa" },
    { "id": 57, "text": "Lógica Filosófica" },
    { "id": 58, "text": "Teoría de Conjuntos" },
    { "id": 59, "text": "Teoría de la Prueba" },
    { "id": 60, "text": "Teoría de Modelos" },
    { "id": 61, "text": "Teoría de la Recursión" },
    { "id": 62, "text": "Teoría de Tipos" },
    { "id": 63, "text": "Teoría de Categorías" },
    { "id": 64, "text": "Métodos Formales" },
    { "id": 65, "text": "Teoría de Autómatas" },
    { "id": 66, "text": "Teoría de la Complejidad" },
    { "id": 67, "text": "Teoría de la Información" },
    { "id": 68, "text": "Teoría de Juegos" },
    { "id": 69, "text": "Teoría de la Decisión" },
    { "id": 70, "text": "Filosofía de la Ciencia" },
    { "id": 71, "text": "Historia de la Ciencia" }
]


#Load Suggestions
@tags_bp.route(API + "/load_suggestions", methods=["POST"])
def load_suggestions():

    is_empty_ENG = tags.find_one({'language': 'ENG'}) is None
    is_empty_ESP = tags.find_one({'language': 'ESP'}) is None

    if is_empty_ENG:
        tags.insert_one({"language": "ENG", 'suggestions': suggestions_ENG})

    if is_empty_ESP:
        tags.insert_one({"language": "ESP", 'suggestions': suggestions_ESP})

    return jsonify({'success': True, 'message': 'Suggestions loaded'}), 201

#Get Suggestions based on language
@tags_bp.route(API + "/get_suggestions/<lang>", methods=["GET"])
def get_suggestions(lang):
    lang = lang.upper() # Making sure the language abbreviation is in upper case.
    suggestions = tags.find_one({'language': lang})
    if suggestions:
        return jsonify(suggestions['suggestions']), 200  
    else:
        return jsonify({'success':False, 'message': 'Suggestions not found for the given language'}), 404
    
    # Add a tag to the stored suggestions
@tags_bp.route(API + "/add_tag/<lang>", methods=["POST"])
def add_tag(lang):
    lang = lang.upper() # Making sure the language abbreviation is in upper case.
    tag = request.get_json() # Get the tag from the request body (in JSON format)
    current_suggestions = tags.find_one({'language': lang})

    if current_suggestions:
        # Compute the new tag's id, as the next number after the current highest id
        new_id = max(tag["id"] for tag in current_suggestions['suggestions']) + 1
        new_tag = {"id": new_id, "text": tag["text"]}

        # Add the tag to the current suggestions
        tags.update_one({'language': lang}, {'$push': {'suggestions': new_tag}})

        # Return success response
        return jsonify({'success': True, 'message': 'Tag added successfully'}), 201
    else:
        return jsonify({'success':False, 'message': 'Suggestions not found for the given language'}), 404

    # Remove a tag from the stored suggestions
@tags_bp.route(API + "/remove_tag/<lang>", methods=["DELETE"])
def remove_tag(lang):
    lang = lang.upper() # Making sure the language abbreviation is in upper case.
    tag = request.get_json() # Get the tag from the request body (in JSON format)
    current_suggestions = tags.find_one({'language': lang})

    if current_suggestions:
        # Remove the tag from the current suggestions
        tags.update_one({'language': lang}, {'$pull': {'suggestions': {'id': tag["id"]}}})

        # Return success response
        return jsonify({'success': True, 'message': 'Tag removed'})