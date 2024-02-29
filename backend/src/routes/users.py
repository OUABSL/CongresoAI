from flask import Flask, request, Blueprint, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
#from flask_jwt_extended import JWTManagerfrom 
import sys,os
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.models.user import User
from src.app import app, mongo, jwt



users_bp = Blueprint('users', __name__)

mycol = mongo.db.users


"""@login_manager.user_loader
def load_user(username):
    u = mycol.find_one({'username': username})
    if not u:
        return None
    return User(u['email'],u['username'],u['password'],u['fullname'],u['birthdate'],u['phonenumber'],u['interestarea'])

"""
# Create a route to authenticate your users and return JWTs. The
# create_access_token() function is used to actually generate the JWT.
@users_bp.route("/login", methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    user = mycol.find_one({'username': username})
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=username)
        make_response(jsonify({'message': 'Login successful!'}), 200)
        return jsonify(access_token=access_token)

    else:
        return make_response(jsonify({"message": "Bad username or password"}), 401)


@users_bp.route('/signup', methods=['POST'])
def SignUp():
    data = request.get_json()

    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    fullname = data.get('fullname')
    birthdate = data.get('birthdate')
    phonenumber = data.get('phonenumber')
    interestarea = data.get('interestarea')

    user = mycol.find_one({'username': username})

    if user:
        return make_response(jsonify({'message':'Username already exists!'}), 400)
    else:
        new_user = User(email, username, generate_password_hash(password, method='pbkdf2:sha256'), fullname, birthdate, phonenumber, interestarea)
        mycol.insert_one({'email': new_user.email, 'username': new_user.username, 'password': new_user.password,
                          'fullname': new_user.fullname, 'birthdate': new_user.birthdate, 'phonenumber': new_user.phonenumber,
                          'interestarea': new_user.interestarea})
        return make_response(jsonify({'message':'Registration successful!'}), 201)


# Protect a route with jwt_required, which will kick out requests
# without a valid JWT present.
@users_bp.route("/profile", methods=["GET"])
@jwt_required()
def protected():
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()
    user = mycol.find_one({'username': current_user})
    print("usuario: ", user)

    if user is not None:
        return jsonify({
            'username': user['username'],
            'email': user['email'],
            'fullname': user['fullname']
        }), 200
    else:
        return jsonify({'error': 'User not logged in'}), 401
     