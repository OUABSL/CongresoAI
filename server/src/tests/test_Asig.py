from typing import List, Tuple
from collections import defaultdict
import spacy
#from src.models.user import Reviewer
import os, sys
sys.path[0] = os.getcwd()
#from src.models.tabajo import ScientificArticle

reviewers = [{"pending_work":2,"username":"ouaquin","knowledges":["Artificial Intelligence", "Computer Science", "Information Technology", "Data Science", "Machine Learning" ]},
{"pending_work":3,"username":"ronaldo","knowledges":['Cybersecurity', 'Computer Networks', 'Database Management System', 'Operating Systems', 'Software Engineering', 'Web Development']},
{"pending_work":4,"username":"said","knowledges":["Computer Aided Design","Operating Systems","Web Development","Cybersecurity"]},
{"pending_work":2,"username":"amin","knowledges":["Computer Networks","Web Development","Software Engineering", "Data Science", "Artificial Intelligence", "Logic"]}]

key_words = [
    "Computer Networks",
    "Web Development",
    "Software Engineering",
    "Data Science",
    "Artificial Intelligence",
    "Logic"
]
class ReviewerAssignment:
    def __init__(self):
        self.nlp = spacy.load('en_core_web_lg')
        #Memoria para el algoritmo
        self.similarity_cache = {} 

    def coseno_similitud(self, palabra1: str, palabra2: str) -> float:
        palabras = tuple(sorted([palabra1.lower(), palabra2.lower()]))
        if palabras not in self.similarity_cache:
            token1, token2 = self.nlp(palabras[0]), self.nlp(palabras[1])
            self.similarity_cache[palabras] = token1.similarity(token2) if token1.has_vector and token2.has_vector else 0
        return self.similarity_cache[palabras]

    def calcular_similitud(self, reviewer_knowledges: List[str], key_words_article: List[str]) -> float:
        return sum(self.coseno_similitud(palabra_articulo, palabra_reviewer) for palabra_articulo in key_words_article for palabra_reviewer in reviewer_knowledges)

    def asignar_revisor(self) -> List[Tuple[str, float]]:
        #reviewers = Reviewer.objects
        key_words_article = [
                                "Computer Networks",
                                "Web Development",
                                "Software Engineering",
                                "Data Science",
                                "Artificial Intelligence",
                                "Logic"
                            ]
        reviewer_scores = defaultdict(float)
        for reviewer in reviewers:
            pending_works = reviewer["pending_work"]
            if pending_works < 5:
                similitud = self.calcular_similitud(reviewer["knowledges"], key_words_article)
                penalizacion = 0.9 ** pending_works
                reviewer_scores[reviewer["username"]] += similitud * penalizacion
        scores_ordendos = sorted(((score, user) for user, score in reviewer_scores.items()), reverse=True)
        return scores_ordendos

    def run(self):
        sorted_assignment = self.asignar_revisor()
        selected_reviewer = sorted_assignment[0]
        #sorted_assignment.remove(selected_reviewer)
        #self.article.update_properties(reviewer=selected_reviewer[1], sorted_backup_assignment=sorted_assignment)
        print(f"Reviewer Assignment Done: \n{selected_reviewer}\n")
        return sorted_assignment


lol = ReviewerAssignment()
print(lol.run())



