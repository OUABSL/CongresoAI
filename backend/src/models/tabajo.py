import json

class TrabajoCientifico:
    def __init__(self, userId, titulo, contenido, fecha_entrega, area_conocimiento, revisor=None):
        self.userId = userId
        self.titulo = titulo
        self.contenido = contenido
        self.fecha_entrega = fecha_entrega
        self.area_conocimiento = area_conocimiento
        self.revisor = revisor  # Puede ser None si no se ha asignado un revisor

    def to_dict(self):
        return {
            'usuario': self.userId,
            'titulo': self.titulo,
            'contenido': self.contenido,
            'fecha_entrega': self.fecha_entrega,
            'area_conocimiento': self.area_conocimiento,
            'revisor': self.revisor.to_dict() if self.revisor else None
        }

    def to_json(self):
        return json.dumps(self.to_dict())