from pylatex import Document, Section, Subsection, Command
from pylatex.utils import italic, NoEscape
import os, sys, re
from bson.objectid import ObjectId
sys.path[0] = os.path.join(os.getcwd(), "backend")
from src.app import mongo, LLAMUS_KEY
from src.models.tabajo import ScientificArticle
import subprocess
import locale



doc = Document("./test/ScientificArticle")

db = mongo.db.articles
query = {"_id": ObjectId("65d22d8d9a142a7b8be3d0e7")}
article = db.find_one(query)

sections = dict(article['content'])
sections_summary = dict(article['summary'])
sections_evaluation = dict(article['evaluation'])

for section_name in sections.keys():
    section_content = str(sections[section_name])
    section_summary = str(sections_summary[section_name])
    section_evaluation = str(sections_evaluation[section_name])

    #if section_content and section_summary and section_evaluation:
    if section_content:
        doc.append(NoEscape(r'\clearpage'))    # Ensure that each section starts on a new page
        with doc.create(Section(section_name)):
            with doc.create(Subsection('Contenido:')):
                doc.append(section_content)

            with doc.create(Subsection('Resumen:')):
                doc.append(section_summary)

            with doc.create(Subsection('Evaluación:')):
                doc.append(section_evaluation)


try:
      doc.generate_pdf(clean_tex=False)
except subprocess.CalledProcessError as e:
    with open('latexmk.log', 'w') as f:
        f.write(e.output.decode(errors='ignore'))
    print("Failed to generate PDF. Please see 'latexmk.log' for more detailed information.")
else:
    print("PDF successfully generated.")