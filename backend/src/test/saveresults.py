import os
import subprocess
import sys
from bson.objectid import ObjectId
from pathlib import Path
from pylatex import Document, Package, Section, Subsection, NoEscape

sys.path.insert(0, os.path.join(os.getcwd(), "backend"))
from src.app import mongo, LLAMUS_KEY
from src.models.tabajo import ScientificArticle

from src.test.data_extraction import DataHandler
from src.test.test_summary import ArticleSummarizer
from src.test.test_summary import SYSTEM_PROMPT_BASE as prompt_summary
from src.test.test_evaluation import PreEvaluation
from src.test.test_evaluation import  SYSTEM_PROMPT_BASE as prompt_eval
from src.test.metrica import fetch_model_names

DESTINATION_FOLDER = Path.cwd() / "backend" / "test" / "resultlatex"
DOCUMENT_PATH = DESTINATION_FOLDER

# Package list for the LaTeX document
PACKAGES = [
    'fontenc', 'inputenc', 'calc', 'fancyhdr', 'graphicx', 'lastpage', 'ifthen',
    'amsmath', 'amssymb', 'lineno', 'enumitem', 'booktabs', 'titlesec', 'etoolbox',
    'xcolor', 'colortbl', 'multirow', 'microtype', 'tikz', 'totcount', 'changepage',
    'attrib', 'upgreek', 'array', 'tabularx', 'ragged2e', 'tocloft', 'marginnote',
    'marginfix', 'enotez', 'amsthm', 'natbib', 'hyperref', 'cleveref', 'scrextend',
    'url', 'geometry', 'newfloat', 'caption', 'seqsplit'
]

def create_document(model, packages):
    destination_folder = DESTINATION_FOLDER / f"{model}"
    destination_folder.mkdir(parents=True, exist_ok=True)

    doc = Document(destination_folder / "ScientificArticle")
    for package in packages:
        doc.packages.append(Package(package))
    return doc

def fetch_article(db, id_string):
    query = {"_id": ObjectId(id_string)}
    return db.find_one(query)

def handle_section(doc, name, content, summary, evaluation):
    if content and name != "Acknowledgements":
        doc.append(NoEscape(r'\clearpage'))  # Start each section on a new page
        with doc.create(Section(name)):
            #doc.append(NoEscape(content))
            doc.append(Subsection('Resumen:', data=summary))
            doc.append(Subsection('Evaluación:', data= evaluation))

def generate_pdf(model_name, doc):
    try:
        doc.generate_pdf(clean_tex=False)
        print("PDF generated successfully for model:", model_name)
    except subprocess.CalledProcessError as e:
        # Log the error for analysis
        with open(DESTINATION_FOLDER / 'latexmk.log', 'a') as f:  # Use 'a' for appending
            f.write(f"Error generating PDF for model {model_name}:\n")
            f.write(e.output.decode('utf-8', errors='ignore'))
            f.write("\n")
        print(f"Failed to generate PDF for model {model_name}. See log.")

def main():
    zip_filepath = Path.cwd() / "backend" / "data" / "input" / "article.zip"
    destination_folder = Path.cwd() / "backend" / "src" / "test" / "output"
    destination_folder.mkdir(parents=True, exist_ok=True)

    handler = DataHandler(zip_filepath, destination_folder)
    article_content, id = handler.run()
    myquery = {"_id": ObjectId(f"{id}")} #65d22d8d9a142a7b8be3d0e7
    model_names = fetch_model_names()
    for model in model_names:
        print(model)
        summary_instance = ArticleSummarizer(mongo, prompt_summary, myquery,  LLAMUS_KEY)
        evaluation_instance = PreEvaluation(mongo, myquery,  prompt_eval, LLAMUS_KEY)
        
        summary_instance.chat_model = model
        evaluation_instance.chat_model = model
        article_summary = summary_instance.run()
        article_evaluation = evaluation_instance.run()
        print(article_summary)
        print(article_evaluation)
        if article_summary['Introduction'] and article_summary['Related work'] and article_summary['Relational machine learning'] and article_summary['Conclusions and future work']:
            doc = create_document(model, PACKAGES)

            for section_name in article_content.keys():


                if section_name != "Graph query framework" and section_name != "Acknowledgements":
                    if article_summary[section_name] and article_evaluation[section_name]:
                        handle_section(doc, section_name, article_content[section_name], 
                                       article_summary[section_name], article_evaluation[section_name])
            # Handle the "Acknowledgements" section separately
            doc.append(NoEscape('\\newpage'))
            doc.append(NoEscape(article_content.get("Acknowledgements", "")))
            generate_pdf(model, doc)

if __name__ == "__main__":

    main()