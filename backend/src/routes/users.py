from flask import Flask, request, Blueprint, jsonify, make_response
from flask_login import UserMixin, LoginManager, login_user
from werkzeug.security import generate_password_hash
import sys,os
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.models.user import User
from src.app import app, mongo
from werkzeug.security import check_password_hash
from flask_login import logout_user


users_bp = Blueprint('users', __name__)

mycol = mongo.db.users

login_manager = LoginManager()
login_manager.init_app(users_bp)

@login_manager.user_loader
def load_user(username):
    u = mycol.find_one({'username': username})
    if not u:
        return None
    return User(u['email'],u['username'],u['password'],u['fullname'],u['birthdate'],u['phonenumber'],u['interestarea'])

@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    user = mycol.find_one({'username': username})

    if user and check_password_hash(user['password'], password):
        return make_response(jsonify({'message': 'Login successful!'}), 200)
    else:
        return make_response(jsonify({'message': 'Wrong username or password!'}), 401)

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
        new_user = User(email, username, password, fullname, birthdate, phonenumber, interestarea)
        mycol.insert_one({'email': new_user.email, 'username': new_user.username, 'password': new_user.password,
                          'fullname': new_user.fullname, 'birthdate': new_user.birthdate, 'phonenumber': new_user.phonenumber,
                          'interestarea': new_user.interestarea})
        return make_response(jsonify({'message':'Registration successful!'}), 201)

@users_bp.route('/logout')
def logout():
    logout_user()
    return jsonify({'message':'Logged out!'})