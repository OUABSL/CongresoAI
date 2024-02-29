from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.datastructures import CombinedMultiDict
from werkzeug.utils import secure_filename
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.models.user import User
from src.models.tabajo import Articulo  
from src.app import app, mongo

submit_bp = Blueprint('submit', __name__)

@submit_bp.route('/submit', methods=['POST'])
#@jwt_required()
def submit_article():

    current_user = User.objects.get(username=get_jwt_identity())
    print("mega mega   ",current_user)

    # Since the request contains both JSON and File data, we need to use CombinedMultiDict
    data = CombinedMultiDict([request.files, request.form])
    print("lol mega ",current_user)
 
    
    required_fields = ['title', 'description', 'key_words', 'latex_project']

    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    """article = Articulo(
        user_id = current_user,  
        title = data["title"],
        description = data["description"],
        key_words = data.getlist('key_words'), 
        content = "",
        summary = "",
        evaluation = "",
        reviewer = ""
    )
"""
    if 'latex_project' in request.files:
        file = request.files['latex_project']

        if file.filename != '':
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename)) + ".zip")

        # should be file instead of la
        #article.save_files(file)
    
    #article.save()

    # return the newly created article in the response
    #return jsonify({'article': article.to_json()}), 201
    return jsonify({'lol': 'b'}), 201
