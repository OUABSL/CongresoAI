import os
import sys
sys.path.append('..')
from config.config import Config
from flask import Flask, request
from flask_pymongo import PyMongo


app = Flask(__name__)
app.config['MONGO_URI'] = Config.MONGO_URI
mongo = PyMongo(app)

# Define references to all collections you will be using
base = mongo.db


if __name__ == "__main__":
    app.run(debug=True)