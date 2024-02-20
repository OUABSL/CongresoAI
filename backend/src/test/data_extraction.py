# Import required libraries
from pathlib import Path
import pydetex.pipelines as pip
import zipfile
import re, json, requests
import os, sys
sys.path[0] = os.path.join(os.getcwd(), "backend")
from src.app import mongo
from src.models.tabajo import ScientificArticle
from typing import Type, List, Dict
from langchain.text_splitter import LatexTextSplitter




#from models.user import User

class DataHandler:
    """This class assists with file and directory management tasks."""
    
    def __init__(self, zip_path: str, dest_path: str):
        self.title = "Logical-Mathematical Foundations of a Graph Query Framework for Relational Learning"
        self.db = mongo.db.articles
        self.zip_path = Path(zip_path)
        self.dest_path = Path(dest_path)
        self.tex_path = self.dest_path / "PQG.tex"


    
    def insert_into_db(self, data: dict):
        """Insert provided data into the database and return the inserted ID"""
        result = self.db.insert_one(data)
        return str(result.inserted_id)
    

    
    @staticmethod
    def _perform_extraction(zip_path: Path, dest_path: Path):
        """Extract files from the provided source ZIP to the destination folder"""
        with zipfile.ZipFile(zip_path, 'r') as file:
            file.extractall(dest_path)
    
    @staticmethod
    def _read_file_data(file_path: Path):
        """Read and return the contents of the provided file."""
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()

    @staticmethod
    def _parse_document_content(data):
        begin_pos = data.find(r'\begin{document}') + len(r'\begin{document}')
        end_pos = data.find(r'\end{document}')
        return data[begin_pos:end_pos] if begin_pos != -1 and end_pos != -1 else None
    @staticmethod
    def _remove_commented_lines(content):
         return "\n".join([line for line in content.split("\n") if not line.strip().startswith("%")])

    @staticmethod
    def split_latex(content):
        latex_splitter = LatexTextSplitter(chunk_size = 1500, chunk_overlap = 10)
        docs = latex_splitter.create_documents([content])
        print(docs)
        return docs

    
    @staticmethod
    def _get_section_data(document_content):
        section_matcher = re.compile(r'\\section\*?\{([^}]*)\}')
        sections = section_matcher.findall(document_content)
        positions = [m.start() for m in section_matcher.finditer(document_content)]
        positions.append(len(document_content))  # end position of the last section
        section_contents = {}
        for idx, section_name in enumerate(sections):
            section_content = document_content[positions[idx]:positions[idx + 1]].strip()
            #section_content = section_content[section_content.find('}') + 1:]
            section_contents[section_name] = section_content
        return section_contents
    
    def _extract_just_text(self, section_content):
        #print(section_content)
        res = pip.simple(section_content)
        #print(f"res: {section_content}")
        return res



    @staticmethod
    def _save_sections(sections: dict, destination: Path, esResFinal = False):
        """Save the provided sections dictionary as individual files in the provided destination."""
        destination.mkdir(parents=True, exist_ok=True)
        tmp = ''
        for idx, (section_name, section_content) in enumerate(sections.items(), start=1):
            if esResFinal:
                for chunk in section_content:
                    tmp = tmp + "\n\n" + chunk.page_content + "\n---------------------------fin chunk----------------\n"
                section_content = tmp
            (destination / f"section_{idx}_{section_name.replace('/', '_')}.txt").write_text(section_content, encoding='utf-8')

    def run(self):
        """Execute the main actions of the class"""
        self._perform_extraction(self.zip_path, self.dest_path)
        content = self._parse_document_content(self._read_file_data(self.tex_path))
        sections = {}
        if content is not None:
            content = self._remove_commented_lines(content)
            sections = self._get_section_data(content)
            self._save_sections(sections, self.dest_path / "res")

            sections_text = sections.copy()
            result = {sm: [] for sm in sections.keys()}
            for section_name, section_content in sections.items():
                res = self._extract_just_text(section_content)
                #sections_text[section_name]= res
                res_split = self.split_latex(section_content)
                if(res_split):
                    result[section_name].extend(res_split)

            #print(result)


            self._save_sections(result, self.dest_path / "res/jst", True)




          
        else:
            print("Contenido Nulo!")

        user = "beta user" #user connected
        evaluation_init = {key : "" for key in sections_text.keys()}
        summary_init = {key : "" for key in sections_text.keys()}

        article = ScientificArticle(
            user_id=user,
            title= self.title,
            content=sections_text,
            evaluation =  evaluation_init,
            summary = summary_init
        )
        #self.insert_into_db(article.to_dict())

if __name__ == "__main__":
    zip_filepath = Path.cwd() / "backend" / "data" / "input" / "article.zip"
    destination_folder = Path.cwd() / "backend" / "src" / "test" / "output"
    destination_folder.mkdir(parents=True, exist_ok=True)

    handler = DataHandler(zip_filepath, destination_folder)
    handler.run()