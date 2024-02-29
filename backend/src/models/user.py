import datetime
from mongoengine import Document, StringField, IntField, DateTimeField, DateField
import json
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.app import mongo #db = PyMongo(app).user
from werkzeug.security import generate_password_hash




class User(Document):
    def __init__(self, email, username, password, fullname, birthdate, phonenumber, interestarea):
        self.email = email
        self.username = username
        self.password = password
        self.fullname = fullname
        self.birthdate = birthdate
        self.phonenumber = phonenumber
        self.interestarea = interestarea



    def to_json(self):
        user_dict = self.to_mongo()
        user_dict['id'] = str(self.pk)
        return json.dumps(user_dict)