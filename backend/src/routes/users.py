from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask import Flask, render_template, request, redirect, url_for
from app import base
from models.user import User 
from config.config import Config

app = Flask(__name__)
app.config['SECRET_KEY'] = Config.FLASK_SECRET_KEY

db = base.users
login_manager = LoginManager()
login_manager.init_app(app)

def get_user_from_db(username):
    user_data = db.find_one({'username': username})
    return User(user_data) if user_data else None

@login_manager.user_loader
def load_user(user_id):
    return get_user_from_db(user_id)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = get_user_from_db(username)
        if user and user.check_password(password):
            login_user(user)
            return "Logged in successfully!"
            
        return "Invalid username or password."
    return render_template("login.html")

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return "Logged out successfully!"

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        existing_user = get_user_from_db(username)

        if existing_user:
            return "Username already exists. Please choose a different one."
        
        new_user = User(username, password)
        db.insert_one({'username': new_user.username, 'password': new_user.password})
        login_user(new_user)
        return "Registered and logged in successfully!"
    
    return render_template("register.html")

@app.route("/secret")
@login_required
def secret():
    return f"Welcome, {current_user.user.nombre}!"

if __name__ == "__main__":
    app.run(debug=True)