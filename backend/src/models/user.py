import json
import datetime

class User:
    def __init__(self, nombre, apellido, DNI , fecha_nacimiento, tipo_usuario, fecha_alta=None, area_conocimiento=None, matricula=None):
        self.nombre = nombre
        self.apellido = apellido        
        self.DNI = DNI
        self.fecha_nacimiento = fecha_nacimiento
        self.fecha_alta =  datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") if fecha_alta == None else  fecha_alta
        self.tipo_usuario = tipo_usuario
        self.area_conocimiento = area_conocimiento  # Solo para el tipo de usuario "Revisor"
        self.matricula = matricula  # Solo para el tipo de usuario "Alumno" o "Enviador"

    def to_dict(self):
        return {
            'nombre': self.nombre,
            'usuario_id': self.usuario_id,
            'fecha_nacimiento': self.fecha_nacimiento,
            'fecha_alta': self.fecha_alta,
            'tipo_usuario': self.tipo_usuario,
            'area_conocimiento': self.area_conocimiento,
            'matricula': self.matricula
        }

    def to_json(self):
        return json.dumps(self.to_dict())