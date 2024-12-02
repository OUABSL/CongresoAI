from flask import Blueprint, request, jsonify, abort
from flask import make_response, Response
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, create_access_token
from src.utils.func import generate_token, check_token
from src.app import mongo, API


admin_bp = Blueprint('admin', __name__)

db_articles = mongo.db.scientific_article
db_reviewers = mongo.db.reviewers
db_authors = mongo.db.authors
db_admin = mongo.db.admin

@admin_bp.route(API + '/generate-register-token/<orcid>')
def create_register_token(orcid):
    token = generate_token(orcid)
    url_root_with_port = request.url_root
    url_parts = url_root_with_port.split(':')
    base_url = url_parts[0] + '://' + url_parts[1].lstrip('/')
    url = f"{base_url}:3000/portal-reviewer/register/"

    if token:
        return jsonify({'success':True, 'url': url + token}), 200
    else:
        return jsonify({'success':False, 'message': "Invalid ORCID"}), 400


@admin_bp.route(API + '/verify-token/<token>', methods=['GET'])
def verify_token(token):
    if (check_token(token=token)):
        return jsonify({'success':True, 'message': "Valid token"}), 200
    else:
        return jsonify({'success':False, 'message': "Invalid token"}), 400


# Devolver todos los usuarios
@admin_bp.route(API + "/admin/users", methods=["GET"])
@jwt_required()
def get_all_users():
    claims = get_jwt()
    if claims["role"] != "admin":
        abort(403)
    reviewers = list(db_reviewers.find())
    authors = list(db_authors.find())

    for user in reviewers:
        user['_id'] = str(user['_id'])
    for user in authors:
        user['_id'] = str(user['_id'])
    users = list(reviewers, authors)
    return jsonify(users), 200

# Crear un usuario nuevo
@admin_bp.route(API + "/admin/users", methods=["POST"])
@jwt_required()
def create_user():
    claims = get_jwt()
    if claims["role"] != "admin":
        abort(403)
    data = request.get_json()
    if db_reviewers.find_one({'username': data['username']}):
        return make_response(jsonify({'success':False, 'message':'Username already exists!'}), 400)
    else:
        db_reviewers.insert_one(data)
        return jsonify({'success':True, 'message':'User registration successful!'}), 201

# Actualizar información de usuario
@admin_bp.route(API + "/admin/users/<username>", methods=["PUT"])
@jwt_required()
def update_user(username):
    claims = get_jwt()
    if claims["role"] != "admin":
        abort(403)
    data = request.get_json()
    db_reviewers.update_one({'username': username}, {'$set': data})
    return jsonify({'success':True, 'message':'User updated successfully'}), 200

# Eliminar usuario
@admin_bp.route(API + "/admin/users/<username>", methods=["DELETE"])
@jwt_required()
def delete_user(username):
    claims = get_jwt()
    if claims["role"] != "admin":
        abort(403)
    db_reviewers.delete_one({'username': username})
    return jsonify({'success':True, 'message':'User deleted successfully'}), 200