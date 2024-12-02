from typing import List, Tuple
from collections import defaultdict
import spacy, logging
from src.models.user import Reviewer
from src.models.manuscript import ScientificArticle

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class ReviewerAssignment:
    def __init__(self, article: ScientificArticle, mongo):
        self.nlp = spacy.load('en_core_web_lg')
        self.article = article
        self.DB = mongo.db.scientific_article
        #Memoria caché para el algoritmo
        self.similarity_cache = {} 

    """
    Calcular la similitud coseno entre dos palabras utilizando modelos de lenguaje de spaCy, almacenando los resultados en la memoria caché de la instancia.
    Entradas:
        palabra1: La primera palabra a comparar.
        palabra2: La segunda palabra a comparar.
    Salidas:
        Un valor float que representa la similitud coseno entre las dos palabras.
    """
    def coseno_similitud(self, palabra1: str, palabra2: str) -> float:
        palabras = tuple(sorted([palabra1.lower(), palabra2.lower()]))
        if palabras not in self.similarity_cache:
            token1, token2 = self.nlp(palabras[0]), self.nlp(palabras[1])
            self.similarity_cache[palabras] = token1.similarity(token2) if token1.has_vector and token2.has_vector else 0
        return self.similarity_cache[palabras]

    """
    Calcular la similitud total entre las palabras clave del artículo y los conocimientos del revisor.
    Entradas:
        reviewer_knowledges: Lista de áreas conocimientos del revisor.
        key_words_article: Lista de palabras clave del manuscrito.
    Salidas:
        Un valor float que representa la similitud total entre las palabras clave del manuscrito y los áreas de conocimiento del revisor.
    """
    def calcular_similitud(self, reviewer_knowledges: List[str], key_words_article: List[str]) -> float:
        return sum(self.coseno_similitud(palabra_articulo, palabra_reviewer) for palabra_articulo in key_words_article for palabra_reviewer in reviewer_knowledges)

    """
    Asignar revisores a un artículo basado en la similitud de palabras clave y la carga de trabajo actual de los revisores.
    Entradas:
        No tiene entradas directas, pero utiliza los atributos de la instancia self, específicamente los revisores y el artículo.
    Salidas:
        Una lista de tuplas, cada una conteniendo un nombre de usuario de revisor y su puntuación de similitud, ordenada de mayor a menor.
    """
    def asignar_revisor(self) -> List[Tuple[str, float]]:
        reviewers = Reviewer.objects
        key_words_article = self.article["key_words"]
        reviewer_scores = defaultdict(float)
        for reviewer in reviewers:
            pending_works = self.DB.count_documents({"reviewer": reviewer.username, "review_result":"Pending Review"})
            if pending_works < 4:
                similitud = self.calcular_similitud(reviewer["knowledges"], key_words_article)
                penalizacion = 0.9 ** pending_works
                reviewer_scores[reviewer.username] += similitud * penalizacion
        scores_ordendos = sorted(((score, user) for user, score in reviewer_scores.items()), reverse=True)
        return scores_ordendos

    """
    Asignar un revisor a un artículo científico utilizando un algoritmo basado en similitud de palabras clave y número de trabajos pendientes.
    """
    def run(self):
        # obtiene una lista ordenada de revisores compatibles basados en similitud y carga de trabajo
        sorted_assignment = self.asignar_revisor()
        # Selecciona el revisor con la mayor puntuación
        selected_reviewer = sorted_assignment[0]
        # Elimina el revisor seleccionado de la lista de asignaciones ordenadas
        sorted_assignment.remove(selected_reviewer)
        # Actualiza las propiedades del artículo, asignando el revisor seleccionado y guardando la lista de respaldo de asignaciones
        self.article.update_properties(reviewer=selected_reviewer[1], sorted_backup_assignment=sorted_assignment)

        logging.info(f"Asignación de revisor completada: Asignado {selected_reviewer} para {self.article['title']}")
