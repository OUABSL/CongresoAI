from datetime import datetime
""" MongoEngine's syntax for querying objects, similar to Django's ORM (Object-Relational Mapper)."""
from mongoengine import Document, StringField, DateTimeField, EmailField, ListField, MapField, ReferenceField, IntField, DictField, DateField
import json
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.app import mongo #db = PyMongo(app).users


class User(Document):
    email = EmailField(required=True, unique=True)
    username = StringField(required=True, max_length=50, unique=True)
    password = StringField(required=True, max_length=200) # Hashed password
    birthdate = DateField(default=None)
    fullname = StringField(required=True, max_length=100)
    registration_date = DateTimeField(default=datetime.utcnow())
    phonenumber = StringField(max_length=20)

    def to_json(self):
        user_dict = self.to_mongo()
        user_dict['birthdate'] = self.birthdate.strftime('%Y-%m-%d')  # Convert the date to a string in 'YYYY-MM-DD' format.
        if user_dict['id']: user_dict['id'] = str(self.pk)
        user_dict.pop('password')
        user_dict.pop('_id', None)       

        return json.dumps(user_dict)
    
    meta = {'allow_inheritance': True,
            'abstract': True}




class Reviewer(User):
    ID_Reviewer = IntField()
    knowledges = ListField(StringField(), default=list)
    pending_works = MapField(DictField(), default=dict)
    rated_works = MapField(DictField(), default=dict)
    @property
    def id_revisor(self):
        return self.ID_Reviewer
    
    meta = {
        'collection': 'reviewers' 
    }

class Author(User):
    ID_Author = IntField()
    interests = ListField(StringField(), default=list)
    publications = MapField(field=DateTimeField(), default=dict)
    pending_publications = MapField(DictField(), default=dict)

    @property
    def id_author(self):
        return self.ID_Author
    
    meta = {
        'collection': 'authors'  
    }