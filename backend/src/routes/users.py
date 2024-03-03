from flask import Flask, request, Blueprint, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
#from flask_jwt_extended import JWTManagerfrom 
import sys,os
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.models.user import User, Reviewer, Author
from src.app import app, mongo, jwt




ACCESS_TOKEN = ''
reviewers_col = mongo.db.reviewers
authors_col = mongo.db.authors

users_bp = Blueprint('users', __name__)

def to_list(form_element : str):
    return form_element.split(',')

# Route for reviewer or author login
@users_bp.route("/login", methods=["POST"])
def login():
    role = request.json.get("rol", None)
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    user = None
    if role == "reviewer":
        user = reviewers_col.find_one({'username': username})
    elif role == "author":
        user = authors_col.find_one({'username': username})

    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=username, additional_claims={"rol":role})
        ACCESS_TOKEN = access_token
        return make_response(jsonify({'access_token': access_token, 'message': 'Login successful!'}), 200)
    else:
        return make_response(jsonify({"message": "Bad username or password"}), 401)

# Route for reviewer or author sign up
@users_bp.route('/signup', methods=['POST'])
def SignUp():
    data = request.get_json()

    role = data.get('rol')
    username = data.get('username')
    
    user = None

    if role == 'reviewer':
        user = reviewers_col.find_one({'username': username})
        if user:
            return make_response(jsonify({'message':'Username already exists!'}), 400)
        else:
            email = data.get('email')
            password = generate_password_hash(data.get('password'), method='pbkdf2:sha256')
            fullname = data.get('fullname')
            birthdate = data.get('birthdate')
            phonenumber = data.get('phonenumber')
            knowledges = to_list(str(data.get('knowledges'))) #data.get('knowledges')
            reviewer = Reviewer(email=email, username=username, password=password, fullname=fullname, birthdate=birthdate,
                                phonenumber=phonenumber,knowledges=knowledges)
            reviewer.save()
    elif role == 'author':
        user = authors_col.find_one({'username': username})
        if user:
            return make_response(jsonify({'message':'Username already exists!'}), 400)
        else:
            email = data.get('email')
            password = generate_password_hash(data.get('password'), method='pbkdf2:sha256')
            fullname = data.get('fullname')
            birthdate = data.get('birthdate')
            phonenumber = data.get('phonenumber')
            interestareas = to_list(str(data.get('interests')))
            author = Author(email=email, username=username, password=password, fullname=fullname, birthdate=birthdate, 
                            phonenumber=phonenumber,interests=interestareas)
            author.save() 

    else:
        return make_response(jsonify({'message':'Unauthorized!'}), 401)
    return make_response(jsonify({'message':'Registration successful!'}), 201)

    



@users_bp.route("/authors/profile/<username>", methods=["GET"])
@jwt_required()
def profile_author(username):
    user = authors_col.find_one({'username': username})
    if user:
        user.pop('password', None)
        user.pop('_id', None)       
        return jsonify(user), 200
    else:
        return jsonify({'error': 'User not found'}), 404
    

    
@users_bp.route("/reviewers/profile/<username>", methods=["GET"])
@jwt_required()
def profile_reviewer(username):
    #user = reviewers_col.find_one({'username': username})
    user = Reviewer.objects(username=username).first()
    if Reviewer(user):
        user  =Reviewer(user)
        # user.pop('password', None)
        # user.pop('_id', None)       
        return user.to_json, 200
    else:
        return jsonify({'error': 'User not found'}), 404