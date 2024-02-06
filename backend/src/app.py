from flask import Flask
from flask_pymongo import PyMongo
import sys
#print(sys.path)
from config import MONGO_URI, LLAMUS_KEY



def create_app():
    # Create the Flask application
    app = Flask(__name__)
    
    # Set up additional configurations
    app.config['LLAMUS_KEY'] = LLAMUS_KEY
    app.config['MONGO_URI'] = MONGO_URI
    
    # Initialize PyMongo with the Flask application
    mongo = PyMongo(app)

    return app,mongo


app, mongo = create_app()


if __name__ == "__main__":
    app.run(debug=True)
