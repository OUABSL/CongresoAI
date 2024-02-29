from mongoengine import Document, StringField, DateTimeField, ReferenceField, ListField, ObjectIdField
import bson
from datetime import datetime
import json
import gridfs
import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from src.app import mongo, mongo_engine
from src.models.user import User

class Articulo(Document):
    meta = {'db_alias': mongo_engine}
    user_id = StringField()  # Assuming a separate 'Usuario' model
    title = StringField(required=True)
    description = StringField(required=True)
    key_words = ListField(StringField(required=True))
    submission_date = DateTimeField(default=datetime.utcnow)
    content = StringField()
    summary = StringField()
    evaluation = StringField()
    reviewer = StringField()
    latex_project_id = ObjectIdField()
    submitted_pdf_id = ObjectIdField()

    def save_files(self, query, latex_project=None, submitted_pdf=None):
        fs = gridfs.GridFS(mongo.db)
        if latex_project:
            latex_project_id = fs.put(latex_project)
            self.update_article_db(query, value=('latex_project_url', latex_project_id))
            return latex_project_id
        if submitted_pdf:
            self.submitted_pdf_id = fs.put(submitted_pdf)
            self.reload()

    def update_article_db(self, query, value=None):
        article_id = bson.ObjectId(str(query))
        print("updated \n", mongo.db.articles.find_one(article_id))
        return mongo.db.articles.find_one_and_update({'_id': article_id}, {"$set": {value[0]: value[1]}})


    def set_latex_project_url(self, file_id):
        self.latex_project_url = file_id


    
    def get_file_url(self, file_id):
        if file_id:
            fs = gridfs.GridFS(mongo.db)
            try:
                filename = fs.find_one({'_id': bson.ObjectId(str(file_id))}).filename
            except:
                filename = None
            if filename:
                return f"/file/{str(file_id)}"
        return None

    def to_dict(self):
        return {
            'user_id': str(self.user_id) if self.user_id else None,
            'title': self.title,
            'content': self.content,
            'submission_date': self.submission_date.strftime('%Y-%m-%d %H:%M:%S'),
            'keywords': self.key_words,
            'summary': self.summary,
            'evaluation': self.evaluation,
            'reviewer': self.reviewer,
            'latex_project_url': self.get_file_url(self.latex_project_id),
            'submitted_pdf_url': self.get_file_url(self.submitted_pdf_id),
        }

    def to_json(self):
        return json.dumps(self.to_dict())