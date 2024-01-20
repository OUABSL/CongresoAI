from flask import Flask
from flask_pymongo import PyMongo
from config.config import Config

app = Flask(__name__)
app.config.from_object(Config)

mongo = PyMongo(app)