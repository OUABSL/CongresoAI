import os
import sys
from flask import Flask, request
from flask_pymongo import PyMongo


app = Flask(__name__)
app.config['MONGO_URI'] = MONGO_URI
mongo = PyMongo(app)

# Define references to all collections you will be using
base = mongo.db


if __name__ == "__main__":
    app.run(debug=True)