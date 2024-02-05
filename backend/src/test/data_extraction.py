import os
import zipfile
import re
import tempfile
import sys
from pathlib import Path
sys.path.insert(0, os.path.abspath(os.pardir))
from src.app import mongo
#from src.models import trabajo, user

 
""" 
To do:
    - Configurar la relación user-article
    - Refenciar al usuario autor
    - 
"""

class DataHandler:
    def __init__(self, zip_path, dest_path):
        self.db = mongo.db.articles
        self.zip_path = zip_path
        self.dest_path = dest_path
        self.tex_path = Path(self.dest_path) / "PQG.tex"

    def insert_db(self, data):
        result = self.db.insert_one(data)
        return str(result.inserted_id)

    @staticmethod
    def extract_files(src, dst):
        with zipfile.ZipFile(src, 'r') as zip_ref:
            zip_ref.extractall(dst)

    @staticmethod
    def read_tex_data(path):
        with open(path, 'r', encoding='utf-8') as file:
            data = file.read()
        return data

    @staticmethod
    def parse_document_content(data):
        begin_pos = data.find(r'\begin{document}')
        end_pos = data.find(r'\end{document}')
        return data[begin_pos + len(r'\begin{document}'):end_pos] if begin_pos != -1 and end_pos != -1 else None

    @staticmethod
    def get_sections(document_content):
        return re.findall(r'\\section\{([^}]*)\}', document_content)

    @staticmethod
    def save_section_content(document_content, sections, dest_folder):
        Path(dest_folder).mkdir(parents=True, exist_ok=True)
        for i, section_name in enumerate(sections, start=1):
            section_start = document_content.find(r'\section{' + section_name)
            section_end = document_content.find(r'\section{', section_start + 1) if i < len(sections) else len(document_content)
            section_content = document_content[section_start:section_end].strip()
            section_filename = Path(dest_folder) / f"section_{i}_{section_name.replace('/', '_')}.txt"
            with open(section_filename, 'w', encoding='utf-8') as section_file:
                section_file.write(section_content)

    def main(self):
        self.extract_files(self.zip_path, self.dest_path)
        tex_data = self.read_tex_data(self.tex_path)
        document_content = self.parse_document_content(tex_data)
        sections = self.get_sections(document_content)
        self.save_section_content(document_content, sections, Path(self.dest_path) / "test" / "res")


if __name__ == "__main__":
    zip_path = os.path.join(os.getcwd(), "test", "article.zip")
    dest_path = tempfile.mkdtemp(dir=os.getcwd())

    data_handler = DataHandler(zip_path, dest_path)
    data_handler.main()