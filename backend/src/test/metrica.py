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
    ls = ['dolphin-2_2-yi-34b', 'cat-v1.0-13b', 'dolphin-2.2.1-mistral-7b', 'ggml-model-q4_0','mistral-7b-instruct-v0.1','alfred-40b-1023','MiquMaid-v1-70B.q5_k_m', 'Noromaid-13B-0.4-DPO.q6_k', 'Wizard-Vicuna-30B-Uncensored']
    ls.append('falcon-180b-chat')
    for model_name in ls:
        del model_names[model_name] 
        
    return model_names.values()

"""def print_model_names(model_names : dict):
    for name, id in model_names.items():
        print(f"NAME: {id}    ---> ID:   '{name}'")
"""
if __name__ == "__main__":
    model_names = fetch_model_names()
    print(model_names)