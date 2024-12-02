import logging
from flask import Blueprint, request, jsonify, abort, send_file, make_response
from src.app import mongo, API, llamus_key, gpt_key



submit_bp = Blueprint('submit', __name__)
DB = mongo.db.scientific_article
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@submit_bp.route(API + '/test', methods=['GET', 'POST'])
def test_gpt():
    return True