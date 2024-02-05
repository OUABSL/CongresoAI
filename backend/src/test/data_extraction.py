from pathlib import Path

import os
import re
import sys
import zipfile
import tempfile
sys.path.append(os.path.abspath(os.pardir))

from src.app import mongo


class DataHandler:
    def __init__(self, zip_path, dest_path):
        self.db = mongo.db.articles
        self.zip_path = Path(zip_path)
        self.dest_path = Path(dest_path)
        self.tex_path = self.dest_path / "PQG.tex"

    def insert_into_db(self, data):
        result = self.db.insert_one(data)
        return str(result.inserted_id)

    @staticmethod
    def _extract_files(src, dst):
        with zipfile.ZipFile(src, 'r') as file:
            file.extractall(dst)

    @staticmethod
    def _read_tex_data(path):
        with open(path, 'r', encoding='utf-8') as file:
            return file.read()

    @staticmethod
    def _parse_document_content(data):
        begin_pos = data.find(r'\begin{document}')
        end_pos = data.find(r'\end{document}')
        if begin_pos != -1 and end_pos != -1:
            return data[begin_pos + len(r'\begin{document}'):end_pos]
        return None

    @staticmethod
    def _get_sections_content(document_content):
        sections = re.findall(r'\\section\*?\{([^}]*)\}', document_content)
        section_contents = {}
        for idx, section_name in enumerate(sections, start=1):
            section_start, section_end = document_content.find(r'\section*' + section_name), len(document_content)
            if idx < len(sections):
                section_end = document_content.find(r'\section*', section_start + 1)
            section_content = document_content[section_start:section_end].strip()
            section_contents[section_name] = section_content
        return section_contents

    @staticmethod
    def _store_sections(sections, destination):
        destination.mkdir(parents=True, exist_ok=True)
        for idx, (section_name, section_content) in enumerate(sections.items(), start=1):
            section_filename = destination / f"section_{idx}_{section_name.replace('/', '_')}.txt"
            with open(section_filename, 'w', encoding='utf-8') as section_file:
                section_file.write(section_content)
    
    def main(self):
        self._extract_files(self.zip_path, self.dest_path)
        tex_data = self._read_tex_data(self.tex_path)
        document_content = self._parse_document_content(tex_data)
        sections = self._get_sections_content(document_content)
        self._store_sections(sections, self.dest_path / "res")


if __name__ == "__main__":
    zip_path = os.path.join(os.getcwd(), "test", "article.zip")
    dest_path = tempfile.mkdtemp(dir=os.path.join(os.getcwd(), "test"))

    data_handler = DataHandler(zip_path, dest_path)
    data_handler.main()
