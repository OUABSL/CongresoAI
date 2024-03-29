# Import required libraries
from pathlib import Path
from pylatexenc.latex2text import LatexNodes2Text
import zipfile
import re, io, os, sys 
from app import mongo
from models.tabajo import ScientificArticle
from bson.objectid import ObjectId

class DataHandler:
    """This class assists with file and directory management tasks."""
    
    def __init__(self, article: ScientificArticle, dest_path: str):
        self.article = article
        self.db = mongo.db.articulo
        self.dest_path = Path(dest_path)

    def _perform_extraction(self, dest_path: Path):
        """Extract files from the provided source ZIP to the destination folder"""
        with zipfile.ZipFile(io.BytesIO(self.article.get_latex_project()), 'r') as file:
            file.extractall(dest_path)
    
    @staticmethod
    def _read_file_data(file_path: Path):
        """Read and return the contents of the provided file."""
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
        
    def _get_tex(self):
        print(os.listdir(self.dest_path))  # DEBUG PRINT STATEMENT
        tex_file = ''
        for archivo in os.listdir(self.dest_path):
            if re.search(r'\.tex$', archivo):
                tex_file = archivo
        return tex_file

    def _get_pdf(self):
        pdf_file = ''
        for archivo in os.listdir(self.dest_path):
            if re.search(r'\.pdf$', archivo):
                pdf_file = archivo
        return pdf_file            

    @staticmethod
    def _parse_document_content(data):
        begin_pos = data.find(r'\begin{document}') + len(r'\begin{document}')
        end_pos = data.find(r'\end{document}')
        return data[begin_pos:end_pos] if begin_pos != -1 and end_pos != -1 else None
    @staticmethod
    def _remove_commented_lines(content):
         return "\n".join([line for line in content.split("\n") if not line.strip().startswith("%")])


    
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
    
    """def _get_section_data(self, file_text: str):
        #Split the text into sections and return a dictionary of the section contents.
        section_dict = {}
        sections = [m.start() for m in re.finditer('\\\\section', file_text)]
        for i in range(len(sections)):
            if i == len(sections) - 1:  # this is the last section
                section_text = file_text[sections[i]:]
            else:
                section_text = file_text[sections[i]:sections[i+1]]
            section_title = section_text[9:].split('\n')[0].strip()  # the section title follows '\\section'
            section_dict[section_title] = section_text
        return section_dict"""
    
    def _extract_just_text(self, section_content):
        try:
            res = LatexNodes2Text().latex_to_text(section_content)
        except IndexError as e:
            print(f"Failed to process section content: {section_content}") 
            raise 

        return res

    @staticmethod
    def _save_sections(sections: dict, destination: Path, esResFinal = False):
        """Save the provided sections dictionary as individual files in the provided destination."""
        destination.mkdir(parents=True, exist_ok=True)
        for idx, (section_name, section_content) in enumerate(sections.items(), start=1):
            content_buffer = f"\n\n{section_content}\n---------------------------fin chunk----------------\n" if esResFinal else section_content
            (destination / f"section_{idx}_{section_name.replace('/', '_')}.txt").write_text(content_buffer, encoding='utf-8')
    
    def run(self):
        """#Execute the main actions of the class
        self._perform_extraction(self.dest_path)
        self.article.save_files(submitted_pdf=self._get_pdf())
        content = self._parse_document_content(self._read_file_data())
        #print(content)
        sections = {}
        if content is not None:
            content = self._remove_commented_lines(content)
            sections = self._get_section_data(content)
            #self._save_sections(sections, self.dest_path / "res")

            sections_text = sections.copy()
            for section_name, section_content in sections.items():
                res = self._extract_just_text(section_content)
                sections_text[section_name]= res"""
        
        self._perform_extraction(self.dest_path)


        latex_file_name = self._get_tex()
        latex_file_path = self.dest_path / latex_file_name # get the full file path here
        latex_file_text = self._read_file_data(latex_file_path)

        # Get pdf file path
        pdf_file_name = self._get_pdf()
        pdf_file_path = self.dest_path / pdf_file_name
        # Open PDF in binary mode and save
        with open(pdf_file_path, "rb") as pdf_file:
            self.article.save_files(submitted_pdf=pdf_file)


            # Process LaTeX file text
        document_content = self._parse_document_content(latex_file_text)
        document_sections = self._get_section_data(document_content)

        # Process LaTeX sections into plain text
        document_sections_processed = {section: self._extract_just_text(text) for section, text in document_sections.items() if section!= "Acknowledgements"}


            #print(result)


        #self._save_sections(document_sections_processed, self.dest_path / "res/jst", True)
        # Update the ScientificArticle document in the database with the processed sections

        evaluation_init = {key : "" for key in document_sections_processed.keys()}
        summary_init = {key : "" for key in document_sections_processed.keys()}

        self.article.update_properties(content=document_sections_processed, evaluation=evaluation_init, summary=summary_init)

        return document_sections_processed, id


if __name__ == "__main__":
    destination_folder = Path.cwd() / "backend" / "src" / "test" / "output"
    destination_folder.mkdir(parents=True, exist_ok=True)
    article = ScientificArticle.objects().get(title="Logic")
    print(article)
    myquery = {"_id": ObjectId("65d22d8d9a142a7b8be3d0e7")}


    handler = DataHandler(article, destination_folder)
    handler.run()