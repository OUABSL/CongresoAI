from transformers import *
from collections import defaultdict
import torch
import numpy as np
import os, sys
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

sys.path[0] = os.path.join(os.getcwd(), "server\src")
print(sys.path[0])
from models.user import Reviewer
from app import mongo, hf_email, hf_pass


tokenizer = AutoTokenizer.from_pretrained('allenai/scibert_scivocab_uncased')
model = AutoModel.from_pretrained('allenai/scibert_scivocab_uncased')
def preprocesar_texto(texto):
    return tokenizer(texto, max_length=512, truncation=True, return_tensors="pt")

# Obtener embedding
def obtener_embedding(texto):
    inputs = preprocesar_texto(texto)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].numpy()

def calcular_similitud(articulo, reviewer):
    articulo_embedding = obtener_embedding(" ".join(articulo["key_words"])).flatten()
    reviewer_embedding = obtener_embedding(" ".join(reviewer["knowledges"])).flatten()
    similitud = np.dot(articulo_embedding, reviewer_embedding) / (
        np.linalg.norm(articulo_embedding) * np.linalg.norm(reviewer_embedding)
    )
    return similitud

def asignar_revisor(articulo: dict) -> str:
    # Obtener todos los revisores de la base de datos
    reviewers = Reviewer.objects
    # Crear un diccionario para almacenar las puntuaciones de los revisores
    reviewer_scores = defaultdict(float)
    # Iterar por cada revisor
    for reviewer in reviewers:
        # Chequear la disponibilidad del revisor
        if len(reviewer.pending_works) >= 4:
            continue  # Saltar revisores con 3 o más artículos pendientes
        # Calcular la puntuación basada en la similitud de las embeddings
        similitud = calcular_similitud(articulo, reviewer)
        penalizacion = 0.9 ** len(reviewer.pending_works)
        reviewer_scores[reviewer.username] += similitud * penalizacion
    # Encontrar el revisor con la puntuación más alta
    best_reviewer = max(reviewer_scores, key=reviewer_scores.get, default="")
    return best_reviewer

db = mongo.db.scientific_article
article = db.find_one({'title':"Logic"})
rev = asignar_revisor(article)

print(rev)
