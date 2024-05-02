from flask import request, Blueprint, jsonify, make_response, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt, unset_jwt_cookies, get_jwt_identity, verify_jwt_in_request, jwt_required
from src.models.user import User, Reviewer, Author
from src.app import app, mongo, jwt, API
from uuid import uuid4



ACCESS_TOKEN = ''
reviewers_col = mongo.db.reviewers
authors_col = mongo.db.authors


users_bp = Blueprint('users', __name__)

#Extraer las palabras claves, lista de conocimientos para revisores o lista de intereses para autores
def to_list(form_element : str):
    return form_element.split(',')


"""
Funciones comúnes para autores y revisores
"""
# Iniciar Sesión para un usuario (Autores y Revisores)
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
        access_token = create_access_token(identity=username, additional_claims={"role":role})
        ACCESS_TOKEN = access_token
        return make_response(jsonify({'success':True, 'access_token': access_token, 'message': 'Login successful!'}), 200)
    else:
        return make_response(jsonify({"success":False, "message": "Bad username or password"}), 401)

# Registrar los usuarios (Autores y Revisores)
@users_bp.route(API + '/signup', methods=['POST'])
def SignUp():
    data = request.get_json()
    role = data.get('role')
    username = data.get('username')
    is_bi = data.get('is_bi', None)

    if role == 'reviewer':
        user = Reviewer.objects(username=username).first()
        if user:
            return make_response(jsonify({'success':False,'message':'Username already exists!'}), 400)
        else:
            email = data.get('email')
            password = generate_password_hash(data.get('password'), method='pbkdf2:sha256')
            fullname = data.get('fullname')
            phonenumber = data.get('phonenumber')
            ORCID_ID = data.get('ORCID_ID')
            knowledges = to_list(str(data.get('knowledges')))
            reviewer = Reviewer(email=email, username=username, password=password, fullname=fullname,
                                phonenumber=phonenumber, ORCID_ID=ORCID_ID, knowledges=knowledges)
            if is_bi:
                reviewer.is_bi = is_bi
            reviewer.save()
    if role == 'author'or is_bi:
        user = authors_col.find_one({'username': username})
        if user:
            return make_response(jsonify({'success':False,'message':'Username already exists!'}), 400)
        else:
            id_author = str(uuid4())
            email = data.get('email')
            password = generate_password_hash(data.get('password'), method='pbkdf2:sha256')
            fullname = data.get('fullname')
            phonenumber = data.get('phonenumber')
            interestareas = to_list(str(data.get('interests')))
            author = Author(ID_Author=id_author, email=email, username=username, password=password, fullname=fullname,
                            phonenumber=phonenumber,interests=interestareas)
            if is_bi:
                author.is_bi = is_bi
            author.save() 

    else:
        return make_response(jsonify({'success':False,'message':'Unauthorized!'}), 401)
    return make_response(jsonify({'success':True,'message':'Registration successful!'}), 201)

# Cambiar rol del usuario (Autores y Revisores)
@users_bp.route('/api/v1/change-role', methods=['POST'])
@jwt_required()
def change_role():
    current_user = get_jwt_identity()
    new_role = request.json.get("new_role", None)

    user = None
    if new_role.lower() == "reviewer":
        user = reviewers_col.find_one({'username': current_user})
    elif new_role.lower() == "author":
        user = authors_col.find_one({'username': current_user})
    else:
        return make_response(jsonify({'success':False,"message": "New role is invalid"}), 400)
    
    if user is None:
        return make_response(jsonify({'success':False,"message": "User not found"}), 404)
    
    # Devueve una token de acceso actualizada para nuevo rol del usuario
    access_token = create_access_token(identity=current_user, additional_claims={"role": new_role})
    return make_response(jsonify({'success':True,'access_token': access_token, 'message': f'Role changed to {new_role}!'}), 200)

#Comprobar si la sesión sigue siendo válida
@users_bp.route(API + "/check-session/<username>", methods=["GET"])
@jwt_required()
def check_session(username):
    try:
        if get_jwt_identity() == username:
            user = None
            claims = get_jwt()
            role = claims["role"]
            if role == "reviewer":
                user = reviewers_col.find_one({'username': username})
            elif role == "author":
                user = authors_col.find_one({'username': username})

        if user:
            return jsonify({'valid': True}), 200
        else:
            return jsonify({'valid': False, 'message': 'User not found.'}), 404   
    except Exception as e:  
        return jsonify({'valid': False, 'message': 'Invalid token.'}), 401 


#Cerrar Sesión
@users_bp.route(API + '/logout', methods=['POST'])
def logout():
    global ACCESS_TOKEN
    ACCESS_TOKEN = ''
    response = make_response(jsonify({'success':True,'message': 'Logged out successfully!'}), 200)
    unset_jwt_cookies(response) 
    return response


"""
Portal de autor
"""
#Devolver los datos de perfil del autor logueado  
@users_bp.route(API + "/authors/profile/<username>", methods=["GET"])
@jwt_required()
def profile_author(username):
    user = authors_col.find_one({'username': username})
    if user:
        user.pop('password', None)
        user.pop('_id', None)       
        return jsonify(user), 200
    else:
        return jsonify({'success':False, 'message': 'User not found'}), 404
    

#Actualizar los datos del perfil de un autor
@users_bp.route(API + "/authors/profile/<username>", methods=["PUT"])
@jwt_required()
def update_profile_author(username):
    if get_jwt_identity() == username:
        data = request.get_json()
        authors_col.update_one({'username': username}, {'$set': data})
        return jsonify({'success':True , 'message': 'Profile updated successfully'}), 200
    else:
        return jsonify({'success':False, 'message': 'Unauthorized'}), 403




"""
Portal de revisor
"""
#Devolver los datos de perfil del revisor logueado  
@users_bp.route(API + "/reviewers/profile/<username>", methods=["GET"])
@jwt_required()
def profile_reviewer(username):
    user = reviewers_col.find_one({'username': username})
    if user:
        user.pop('password', None)
        user.pop('_id', None)       
        return jsonify(user), 200
    else:
        return jsonify({'success':False, 'message': 'User not found'}), 404



#Actualizar los datos del perfil de un revisor
@users_bp.route(API + "/reviewers/profile/<username>", methods=["PUT"])
@jwt_required()
def update_profile_reviewer(username):
    if get_jwt_identity() == username:
        data = request.get_json()
        reviewers_col.update_one({'username': username}, {'$set': data})
        return jsonify({'success':True, 'message': 'Profile updated successfully'}), 200
    else:
        return jsonify({'success':False, 'message': 'Unauthorized'}), 403