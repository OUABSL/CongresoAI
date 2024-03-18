from typing import List, Tuple
from collections import defaultdict
import spacy
from models.user import Reviewer
from models.tabajo import ScientificArticle

class ReviewerAssignment:
    def __init__(self, article: ScientificArticle, mongo):
        self.nlp = spacy.load('en_core_web_lg')
        self.article = article
        self.DB = mongo.db.scientific_article

    def coseno_similitud(self, palabra1: str, palabra2: str) -> float:
        palabra1 = palabra1.lower()
        palabra2 = palabra2.lower()
        token1 = self.nlp(palabra1)
        token2 = self.nlp(palabra2)

        return token1.similarity(token2)

    def calcular_similitud(self, reviewer: dict) -> float:
        key_words_article = self.article["key_words"]
        knowledges_reviewer = reviewer["knowledges"]
        total_similitud = 0
        for palabra_articulo in key_words_article:
            for palabra_reviewer in knowledges_reviewer:
                total_similitud += self.coseno_similitud(palabra_articulo, palabra_reviewer)
        return total_similitud

    def asignar_revisor(self) -> List[Tuple[str, float]]:
        reviewers = Reviewer.objects
        reviewer_scores = defaultdict(float)
        for reviewer in reviewers:
            if len(reviewer.pending_works) >= 4:
                continue
            similitud = self.calcular_similitud(reviewer)
            penalizacion = 0.9 ** len(reviewer.pending_works) 
            reviewer_scores[reviewer.username] += similitud * penalizacion
        scores_ordendos = sorted(((score, user) for user, score in reviewer_scores.items()), reverse=True)
        return scores_ordendos
    
    def run(self):
        sorted_assignment = self.asignar_revisor()
        selected_reviewer = sorted_assignment[0]
        sorted_assignment.remove(selected_reviewer)
        self.article.update_properties(reviewer=selected_reviewer[1], sorted_backup_assignment=sorted_assignment)
        print(f"Reviewer Assignment Done: \n{selected_reviewer}\n")
