import datetime
from mongoengine import Document, StringField, DateTimeField, EmailField, ListField
import json
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.app import mongo #db = PyMongo(app).users
from werkzeug.security import generate_password_hash, check_password_hash


class User(Document):
    meta = {'alias': 'default'}
    email = EmailField(required=True, unique=True)
    username = StringField(required=True, max_length=50, unique=True)
    _password = StringField(required=True, max_length=200) # Hashed password
    fullname = StringField(required=True, max_length=100)
    birthdate = DateTimeField(default=None)
    phonenumber = StringField(max_length=20)
    interestarea = ListField(StringField(max_length=200))

    @property
    def password(self):
        raise AttributeError('Password is not a readable field.')

    @password.setter
    def password(self, password):
        self._password = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self._password, password)

    def to_json(self):
        user_dict = self.to_mongo()
        user_dict['id'] = str(self.pk)
        del user_dict['_password']
        return json.dumps(user_dict)