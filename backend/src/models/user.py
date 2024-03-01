from datetime import datetime
from mongoengine import Document, StringField, DateTimeField, EmailField, ListField, MapField, ReferenceField, IntField, DictField
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
    birthdate = DateTimeField(default=None)
    fullname = StringField(required=True, max_length=100)
    regDate = DateTimeField(default=datetime.utcnow())
    phonenumber = StringField(max_length=20)

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
    
    meta = {'allow_inheritance': True}




class Reviewer(User):
    ID_Reviewer = IntField()
    Knowledges = ListField(StringField(), default=list)
    PendingWorks = MapField(DictField(), default=dict)
    RatedWorks = MapField(DictField(), default=dict)
    @property
    def id_revisor(self):
        return self.ID_Reviewer

class Author(User):
    ID_Author = IntField()
    Interests = ListField(StringField(), default=list)
    Publications = MapField(field=DateTimeField(), default=dict)
    PendingPublications = MapField(DictField(), default=dict)

    @property
    def id_author(self):
        return self.ID_Author