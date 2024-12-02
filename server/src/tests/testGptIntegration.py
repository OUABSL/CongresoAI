import logging
from flask import Blueprint, request, jsonify, abort, send_file, make_response
from src.app import mongo, API, llamus_key, gpt_key



test_gpt_bp = Blueprint('test-gpt', __name__)
DB = mongo.db.scientific_article
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@test_gpt_bp.route(API + '/test', methods=['GET', 'POST'])
def test_gpt():
    return True