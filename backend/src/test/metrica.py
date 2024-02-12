import requests
import json


def fetch_model_names():
    url = 'https://llamus.cs.us.es/api/models'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-8c5be95827ad677b1c760ea7e2b21c774f67b50473444576'
    }

    response = requests.get(url, headers=headers)
    response_data = response.json()

    model_names = {model['name']: model['id'] for model in response_data}
    
    return model_names

def print_model_names(model_names):
    for id in model_names:
        print(id)

if __name__ == "__main__":
    model_names = fetch_model_names()
    print_model_names(model_names)