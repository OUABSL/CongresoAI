from flask import Flask, request, Blueprint, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, unset_jwt_cookies
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from models.user import User, Reviewer, Author
from app import app, mongo, jwt, API


ACCESS_TOKEN = ''
reviewers_col = mongo.db.reviewers
authors_col = mongo.db.authors

users_bp = Blueprint('users', __name__)

def to_list(form_element : str):
    return form_element.split(',')

# Route for reviewer or author login
@users_bp.route(API + "/login", methods=["POST"])
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
@users_bp.route(API + '/signup', methods=['POST'])
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
    
@users_bp.route(API + '/logout', methods=['POST'])
def logout():
    global ACCESS_TOKEN
    ACCESS_TOKEN = ''
    response = make_response(jsonify({'message': 'Logged out successfully!'}), 200)
    unset_jwt_cookies(response) 
    return response


@users_bp.route(API + "/authors/profile/<username>", methods=["GET"])
@jwt_required()
def profile_author(username):
    user = authors_col.find_one({'username': username})
    if user:
        user.pop('password', None)
        user.pop('_id', None)       
        return jsonify(user), 200
    else:
        return jsonify({'error': 'User not found'}), 404
    

    
@users_bp.route(API + "/reviewers/profile/<username>", methods=["GET"])
@jwt_required()
def profile_reviewer(username):
    user = reviewers_col.find_one({'username': username})
    print(user)
    if user:
        #user  =Reviewer(user)
        user.pop('password', None)
        user.pop('_id', None)       
        return jsonify(user), 200
    else:
        return jsonify({'error': 'User not found'}), 404

@users_bp.route(API + "/authors/profile/<username>", methods=["PUT"])
@jwt_required()
def update_profile_author(username):
    if get_jwt_identity() == username:
        data = request.get_json()
        authors_col.update_one({'username': username}, {'$set': data})
        return jsonify({'message': 'Profile updated successfully'}), 200
    else:
        return jsonify({'error': 'Unauthorized'}), 403

@users_bp.route(API + "/reviewers/profile/<username>", methods=["PUT"])
@jwt_required()
def update_profile_reviewer(username):
    if get_jwt_identity() == username:
        data = request.get_json()
        reviewers_col.update_one({'username': username}, {'$set': data})
        return jsonify({'message': 'Profile updated successfully'}), 200
    else:
        return jsonify({'error': 'Unauthorized'}), 403