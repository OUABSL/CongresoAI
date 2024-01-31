from flask_login import LoginManager, UserMixin, login_user, current_user, logout_user, login_required
from flask import Flask, render_template, request
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import os
import sys
sys.path.append('..')
from app import base
from config.config import Config

app = Flask(__name__)
app.config['SECRET_KEY'] = Config.FLASK_SECRET_KEY

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)

# Define the User class
class User(UserMixin):
    def __init__(self, username, password):
        self.username = username
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

# Define a user loader function
@login_manager.user_loader
def load_user(user_id):
    user_data = mongo.db.users.find_one({'_id': user_id})
    if user_data:
        return User(user_data['username'], user_data['password'])
    return None

# Define a route that requires login
@app.route("/secret")
@login_required
def secret():
    return f"Welcome, {current_user.username}!"

# Define a route that handles login
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user_data = mongo.db.users.find_one({'username': username})
        if user_data and User(username, '').check_password(password):
            user = User(username, '')
            login_user(user)
            return "Logged in successfully!"
        else:
            return "Invalid username or password."

    return render_template("login.html")

# Define a route that handles logout
@app.route("/logout")
@login_required
def logout():
    logout_user()
    return "Logged out successfully!"

# Define a route that handles user registration
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        existing_user = mongo.db.users.find_one({'username': username})
        if existing_user:
            return "Username already exists. Please choose a different one."

        user = User(username, password)
        mongo.db.users.insert_one({'username': user.username, 'password': user.password})
        login_user(user)
        return "Registered and logged in successfully!"

    return render_template("register.html")