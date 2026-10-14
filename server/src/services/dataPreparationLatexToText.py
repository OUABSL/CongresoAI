from pathlib import Path
from pylatexenc.latex2text import LatexNodes2Text
import sympy as sp
from sympy.parsing.latex import parse_latex
import zipfile
import re, io, os
from src.app import mongo
from src.models.manuscript import ScientificArticle
from bson.objectid import ObjectId
import logging


# Configurar el logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class DataHandler:

    def __init__(self, article: ScientificArticle, dest_path: str):
        self.article = article
        self.db = mongo.db.articulo
        self.dest_path = Path(dest_path)

    def _perform_extraction(self, dest_path: Path):
        """Extract files from the provided source ZIP to the destination folder"""
        with zipfile.ZipFile(io.BytesIO(self.article.get_latex_project()), 'r') as file:
            file.extractall(dest_path)

    def _clean_adjustwidth_tag(self, latex_text):
        latex_text = re.sub(r'\\begin{adjustwidth}(\[.*?\])?{.*?}', '', latex_text)
        latex_text = re.sub(r'\\end{adjustwidth}', '', latex_text)
        return latex_text

    def _read_file_data(self, file_path: Path):
        """Read and return the contents of the provided file."""
        with open(file_path, 'r', encoding='utf-8') as file:
            latex_text = file.read()
            return self._clean_adjustwidth_tag(latex_text)

    def _get_tex(self):
        print(os.listdir(self.dest_path))  # DEBUG PRINT STATEMENT
        tex_file = ''
        for archivo in os.listdir(self.dest_path):
            if re.search(r'\.tex$', archivo):
                tex_file = archivo
        return tex_file

    def _get_pdf(self):
        """Return the name of the first .pdf file in the destination directory."""
        for archivo in os.listdir(self.dest_path):
            if re.search(r'\.pdf$', archivo):
                return archivo
        return ''

    @staticmethod
    def _parse_document_content(data):
        begin_pos = data.find(r'\begin{document}') + len(r'\begin{document}')
        end_pos = data.find(r'\end{document}')
        return data[begin_pos:end_pos] if begin_pos != -1 and end_pos != -1 else None

    @staticmethod
    def _remove_commented_lines(content):
        """Remove commented lines from content."""
        return "\n".join([line for line in content.split("\n") if not line.strip().startswith("%")])

    @staticmethod
    def _get_section_data(document_content):
        """Extract and return section data from document content."""
        section_matcher = re.compile(r'\\section\*?\{([^}]*)\}')
        sections = section_matcher.findall(document_content)
        positions = [m.start() for m in section_matcher.finditer(document_content)]
        positions.append(len(document_content))
        section_contents = {}
        sections_orden = [section_name for section_name in sections if section_name != "Acknowledgements"]
        for idx, section_name in enumerate(sections):
            if section_name != "Acknowledgements":
                if idx + 1 >= len(positions):
                    continue
                section_content = document_content[positions[idx]:positions[idx + 1]].strip()
                section_contents[section_name] = section_content
        return section_contents, sections_orden


    def _extract_just_text(self, section_content):
        """
        Extract plain text, process equations and graphics.

        Parameters:
            section_content (str): The LaTeX content for the section.

        Returns:
            str: Processed plain text with equations and graphics handled.
        """
        try:
            # Step 1: Remove commented lines
            cleaned_content = self._remove_commented_lines(section_content)

            # Step 2: Process equations into text
            content_with_equations = self._convert_equations_to_text(cleaned_content)

            # Step 3: Convert LaTeX to plain text
            plain_text = LatexNodes2Text().latex_to_text(content_with_equations)

            # Step 4: Process graphics and replace with captions
            processed_text = self._process_graphics(content_with_equations, plain_text)

        except Exception as e:
            logging.error(f"Failed to process section content: {section_content}\nError: {e}")
            raise

        return processed_text

    def _process_graphics(self, latex_text, processed_text):
        """Extract captions of graphics and replace them in the processed text."""
        graphic_pattern = re.compile(r'\\includegraphics(?:\[.*?\])?\{.*?\}')
        caption_pattern = re.compile(r'\\caption\{([^}]*)\}')
        
        def replace_graphic_with_caption(match):
            graphic = match.group(0)
            caption_match = caption_pattern.search(latex_text, match.end())
            if caption_match:
                caption = caption_match.group(1).strip()
                return f"[Gráfica: {caption}]"
            return "[Gráfica sin descripción]"
        
        processed_text = graphic_pattern.sub(replace_graphic_with_caption, processed_text)
        return processed_text

    def _convert_equations_to_text(self, latex_content):
        """
        Processes and cleans all the mathematical expressions of LaTeX content, turning them into plain text readable.

        Parameters:
            latex_content (str): The LaTeX content as a string.

        Returns:
            str: The modified LaTeX content with mathematical expressions replaced by text representations.
        """

        def replace_equation(match):
            equation = match.group(1)
            try:
                parsed_expr = parse_latex(equation)
                readable_expr = str(parsed_expr)
                return f"[EM: {readable_expr}]"
            except Exception as e:
                return f"[EM without formatting: {equation}]"

        # Patrones para ecuaciones en línea y de bloque
        inline_pattern = re.compile(r'\$(.+?)\$')
        block_pattern = re.compile(r'\$\$(.+?)\$\$')

        # Reemplazar ecuaciones en línea
        latex_content = inline_pattern.sub(replace_equation, latex_content)

        # Reemplazar ecuaciones de bloque
        latex_content = block_pattern.sub(replace_equation, latex_content)

        return latex_content



    @staticmethod
    def _save_sections(sections: dict, destination: Path, esResFinal=False):
        """Save the provided sections dictionary as individual files."""
        destination.mkdir(parents=True, exist_ok=True)
        for idx, (section_name, section_content) in enumerate(sections.items(), start=1):
            content_buffer = f"\n\n{section_content}\n---------------------------fin chunk----------------\n" if esResFinal else section_content
            (destination / f"section_{idx}_{section_name.replace('/', '_')}.txt").write_text(content_buffer, encoding='utf-8')

    def run(self):
        self._perform_extraction(self.dest_path)
        latex_file_name = self._get_tex()
        if not latex_file_name:
            logging.error("No .tex file found in the directory")
            return

        latex_file_path = self.dest_path / latex_file_name
        latex_file_text = self._read_file_data(latex_file_path)
        pdf_file_name = self._get_pdf()
        if not pdf_file_name:
            logging.error("No .pdf file found in the directory")
            return

        pdf_file_path = self.dest_path / pdf_file_name
        with open(pdf_file_path, "rb") as pdf_file:
            self.article.save_files(submitted_pdf=pdf_file)

        document_content = self._parse_document_content(latex_file_text)
        if document_content is None:
            logging.error("Failed to parse document content")
            return

        document_sections, sections_orden = self._get_section_data(document_content)
        document_sections_processed = {section: self._extract_just_text(text) for section, text in document_sections.items() if section != "Acknowledgements"}

        evaluation_init = {key: "" for key in document_sections_processed.keys()}
        summary_init = {key: "" for key in document_sections_processed.keys()}

        self.article.update_properties(content=document_sections_processed, sections_orden=sections_orden, 
                                       evaluation=evaluation_init, summary=summary_init)

        return document_sections_processed
