from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.datastructures import CombinedMultiDict
from werkzeug.utils import secure_filename
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.models.user import User
from src.models.tabajo import ScientificArticle  
from src.app import app, mongo
from src.test.data_extraction import DataHandler


submit_bp = Blueprint('submit', __name__)
UPLOAD_FOLDER = sys.path[0] + "/data" 

@submit_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_article():
    target =os.path.join(UPLOAD_FOLDER,'test_docs')
    if not os.path.isdir(target):
        os.mkdir(target)


    current_user = mongo.db.users.find_one({'username':(get_jwt_identity())})
    print("mega mega   ",get_jwt_identity())

    data_file = request.files
    data_form = request.form
    print("hola ",data_form)
 
    
    required_fields = ['title', 'description', 'key_words']

    if not all(field in data_form for field in required_fields) or not data_file:
        return jsonify({'error': 'Missing required fields'}), 400

    user = mongo.db.users.find_one({'username':'ouael'})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    print(user)


    file=''
    filename = ''
    for file in data_file.values():
        file = file
        filename = secure_filename(file.filename) # obtener el nombre seguro del archivo
        print(filename) # este es el nombre de tu archivo zip

        # if file.filename != '':
        #     file.save(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename)) + ".zip")
    
    # query = mongo.db.articles.insert_one(article.to_dict())
    # print(query)
    # article.save_files(query = query.inserted_id, latex_project=file)
    title = request.form.get("title")
    description = request.form.get("description")
    key_words = request.form.get('key_words').split(',')
    
    content = {}
    evaluation = {}
    summary = {}
    # Create ScientificArticle instance and save to MongoDB
    saved_article = ScientificArticle(
        user_id=current_user['username'], 
        title=title, 
        description=description,
        key_words=key_words,
        content=content,
        evaluation=evaluation, 
        summary=summary
    ).save()

    saved_article.save_files(latex_project=file)

    article_id = saved_article.id

    # Data processing
    data_handler = DataHandler(saved_article, dest_path=UPLOAD_FOLDER)
    data_handler.run()

    return jsonify({'status': 'success', 'msg': 'File uploaded successfully'}), 200