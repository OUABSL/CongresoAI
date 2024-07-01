from datetime import datetime
from mongoengine import Document, StringField, DateTimeField, EmailField, ListField, MapField, ReferenceField, IntField, DictField, DateField, BooleanField
import json

class User(Document):
    email = EmailField(required=True, unique=True)
    username = StringField(required=True, max_length=50, unique=True)
    password = StringField(required=True, max_length=200) # Hashed password
    fullname = StringField(required=True, max_length=100)
    registration_date = DateTimeField(default=datetime.now())
    phonenumber = StringField(max_length=20)
    is_bi = BooleanField()

    def to_json(self):
        # Método propio de MongoEngine que permite devolver un diccionario del documento almacenado en MongoDB
        user_dict = self.to_mongo()
        if user_dict.get('id'): 
            user_dict['id'] = str(self.pk)
        user_dict.pop('password')
        user_dict.pop('_id', None)     
        #Devolver el diccionario en formato JSON
        return json.dumps(user_dict)
    # Permitemos la herencia de la clase User, y indicamos que no tendrá ninguna colección propia
    meta = {'allow_inheritance': True,
            'abstract': True}

class Reviewer(User):
    ORCID = StringField(required=True, unique=True, max_length=20)
    knowledges = ListField(StringField(), default=list)

    @property
    def id_revisor(self):
        return self.ORCID
    # Definir la colección correspondiente en la base de datos
    meta = {
        'collection': 'reviewers' 
    }

class Author(User):
    ID_Author = StringField(required=True, unique=True, max_length=36)
    interests = ListField(StringField(), default=list)

    @property
    def id_author(self):
        return self.ID_Author
    # Definir la colección correspondiente en la base de datos
    meta = {
        'collection': 'authors'  
    }