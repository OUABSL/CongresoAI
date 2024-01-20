import os
from dotenv import load_dotenv
import secrets


load_dotenv()


class Config:
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://localhost:27017/congresoai'
    FLASK_SECRET_KEY = '4f6aec58700b0fb5ba96e7314f358a35da85e0b19b15032c'



if __name__ == "__main__":
    print(os.environ.get("MONGO_URI"))