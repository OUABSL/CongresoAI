import sys
sys.path.append('.')
from app import app, base

db = base.users
@app.route('/users', methods=['POST'])
def createUser():
    data = {
        'name': request.json.get('name'),
        'email': request.json.get('email'),
        'rol': request.json.get('rol'),
    }

    result = db.insert_one(data)
    inserted_id = str(result.inserted_id)
    
    return f"User created with id: {inserted_id} db : {db}"

@app.route('/users', methods=['GET'])
def getUsers():
    return 'Received'

@app.route('/users/<id>', methods=['GET'])
def getUser(id):
    return f"Received user with id: {id}"

@app.route('/users/<id>', methods=['DELETE'])
def deleteUser(id):
    return f"Received request to delete user with id: {id}"

@app.route('/users/<id>', methods=['PUT'])
def updateUser(id):
    return f"Received request to update user with id: {id}"