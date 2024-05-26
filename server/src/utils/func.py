import re
from cryptography.fernet import Fernet
from base64 import urlsafe_b64encode

# Function to encrypt ORCID
def generate_token(orcid):
    from src.app import jwt_key
    if bool(re.match(r"\d{4}-\d{4}-\d{4}-\d{4}", orcid)):
        secret_key = urlsafe_b64encode(bytes(jwt_key.ljust(32), encoding='utf-8'))
        cipher_suite = Fernet(secret_key)
        token_bytes = cipher_suite.encrypt(bytes(orcid, encoding='utf-8'))
        # Convertir el token a una cadena de texto antes de devolverlo
        token_str = token_bytes.decode('utf-8')
        return token_str
    else:
        return False

# Function to check if the token matches the ORCID
def check_token(token, orcid=None):
    from src.app import jwt_key
    secret_key = urlsafe_b64encode(bytes(jwt_key.ljust(32), encoding='utf-8'))
    cipher_suite = Fernet(secret_key)
    
    try:
        decrypted_token = cipher_suite.decrypt(token).decode()
        if orcid:
            return decrypted_token == orcid
        else:
            return bool(re.match(r"\d{4}-\d{4}-\d{4}-\d{4}", decrypted_token))
            
    except: 
        return False
    

#Extraer las palabras claves, lista de conocimientos para revisores o lista de intereses para autores
def to_list(form_element):
    if isinstance(form_element, list):
        return form_element
    else:
        return form_element.split(',')
