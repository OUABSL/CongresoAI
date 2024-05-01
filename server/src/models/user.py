from datetime import datetime
""" MongoEngine's syntax for querying objects, similar to Django's ORM (Object-Relational Mapper)."""
from mongoengine import Document, StringField, DateTimeField, EmailField, ListField, MapField, ReferenceField, IntField, DictField, DateField, BooleanField
import json
from src.app import mongo #db = PyMongo(app).users


class User(Document):
    email = EmailField(required=True, unique=True)
    username = StringField(required=True, max_length=50, unique=True)
    password = StringField(required=True, max_length=200) # Hashed password
    fullname = StringField(required=True, max_length=100)
    registration_date = DateTimeField(default=datetime.now())
    phonenumber = StringField(max_length=20)
    is_bi = BooleanField()

    def to_json(self):
        user_dict = self.to_mongo()
        if user_dict['id']: user_dict['id'] = str(self.pk)
        user_dict.pop('password')
        user_dict.pop('_id', None)       

        return json.dumps(user_dict)
    
    meta = {'allow_inheritance': True,
            'abstract': True}




class Reviewer(User):
    ORCID_ID = StringField(required=True, unique=True, max_length=19)
    knowledges = ListField(StringField(), default=list)

    @property
    def id_revisor(self):
        return self.ORCID_ID
    
    meta = {
        'collection': 'reviewers' 
    }

class Author(User):
    ID_Author = StringField(required=True, unique=True, max_length=36)
    interests = ListField(StringField(), default=list)

    @property
    def id_author(self):
        return self.ID_Author
    
    meta = {
        'collection': 'authors'  
    }