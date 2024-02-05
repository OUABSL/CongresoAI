import json
from mongoengine import Document, StringField, ReferenceField
import sys
from user import User
sys.path.append('..')
from app import db


class TrabajoCientifico(db.Document):
    userId = db.ReferenceField(User)
    titulo = db.StringField()
    contenido = db.StringField()
    fecha_entrega = db.StringField()
    area_conocimiento = db.StringField()
    summary = db.StringField()
    evaluation = db.StringField()
    revisor = db.StringField()  # Puede ser None si no se ha asignado un revisor

    def to_dict(self):
        return {
            'usuario': str(self.userId.id),
            'titulo': self.titulo,
            'contenido': self.contenido,
            'fecha_entrega': self.fecha_entrega,
            'area_conocimiento': self.area_conocimiento,
            'summary': self.summary,
            'evaluation': self.evaluation,
            'revisor': self.revisor
        }

    def to_json(self):
        return json.dumps(self.to_dict())