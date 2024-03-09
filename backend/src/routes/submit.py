from bson.objectid import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.datastructures import CombinedMultiDict
from werkzeug.utils import secure_filename
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.models.user import User, Author
from src.models.tabajo import ScientificArticle  
from src.app import app, mongo, LLAMUS_KEY, API
from src.test.data_extraction import DataHandler
from src.routes.PreEvaluation import PreEvaluation
from src.routes.Summary import ArticleSummarizer
from src.test.test_summary import SYSTEM_PROMPT_BASE as prompt_summary
from src.test.test_evaluation import  SYSTEM_PROMPT_BASE as prompt_eval
import tempfile, shutil
import threading



submit_bp = Blueprint('submit', __name__)
UPLOAD_FOLDER = os.path.join(sys.path[0], "data")

def create_temp_dir(parent_dir):
    return tempfile.mkdtemp(dir=parent_dir)


def process_submit(article, dest_path):
    # Data processing
    data_handler = DataHandler(article, dest_path=dest_path)
    data_handler.run()

    summary_instance = ArticleSummarizer(mongo, prompt_summary,  LLAMUS_KEY, article)
    evaluation_instance = PreEvaluation(mongo,  prompt_eval, LLAMUS_KEY, article)
    
    evaluation_instance.chat_model = 'TheBloke.llama-2-70b-chat.Q5_K_M.gguf'
    summary_instance.run()
    evaluation_instance.run()
    if os.path.isdir(dest_path):
        shutil.rmtree(dest_path)

    return None

@submit_bp.route(API + '/submit', methods=['POST'])
@jwt_required()
def submit_article():
    claims = get_jwt()
    role = claims["rol"]
    if role != "author":
        return jsonify({"msg": "You do not have access to this resource"}), 403
    
    temp_dir = create_temp_dir(UPLOAD_FOLDER)

    current_user = mongo.db.authors.find_one({'username':(get_jwt_identity())})
    print("username:   ",get_jwt_identity())
    
    data_file = request.files
    data_form = request.form
    #print("data form:  ",data_form)
    print(f"current: \n {current_user}")

    
    required_fields = ['title', 'description', 'key_words']

    if not all(field in data_form for field in required_fields) or not data_file:
        return jsonify({'error': 'Missing required fields'}), 400

    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    #print(current_user)
    file=''
    filename = ''
    for file in data_file.values():
        file = file
        filename = secure_filename(file.filename) # obtener el nombre seguro del archivo
        print(filename) # este es el nombre de tu archivo zip

        # if file.filename != '':
        #     file.save(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename)) + ".zip")
    
   
    title = request.form.get("title")
    description = request.form.get("description")
    key_words = request.form.get('key_words').split(',')

    # Create ScientificArticle instance and save to MongoDB
    saved_article = ScientificArticle(
        title=title, 
        description=description,
        key_words=key_words,
        content={},
        evaluation={}, 
        summary={},
        reviewer = 'joaquin'
    ).save()
    saved_article.save_files(latex_project=file)
    threading.Thread(target=process_submit, args=(saved_article, temp_dir)).start()
    return jsonify({'status': 'success', 'msg': 'File uploaded successfully'}), 201