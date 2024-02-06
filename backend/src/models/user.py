import datetime
from mongoengine import Document, StringField, IntField, DateTimeField, DateField
import json
import sys
from app import db #db = PyMongo(app).user



class User(Document):
    nombre = StringField(required=True)
    apellido = StringField(required=True)
    DNI = IntField(required=True, unique=True)
    fecha_nacimiento = DateField(required=True)
    fecha_alta = DateTimeField(default=datetime.datetime.now)
    tipo_usuario = StringField(required=True)
    area_conocimiento = StringField()
    matricula = StringField()

    meta = {
        'indexes': [
            'DNI',
            'tipo_usuario'
        ]
    }

    def to_json(self):
        user_dict = self.to_mongo()
        user_dict['id'] = str(self.pk)
        return json.dumps(user_dict)