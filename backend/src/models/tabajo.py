from mongoengine import Document, ReferenceField, StringField, DateTimeField
#from user import User
import json
from datetime import datetime


class ScientificArticle(Document):
    user_id = StringField() #ReferenceField(User)
    title = StringField(required=True)
    content = StringField(required=True)
    submission_date = DateTimeField(default=datetime.utcnow)
    knowledge_field = StringField(null=True)
    summary = StringField(null=True)
    evaluation = StringField(null=True)
    reviewer = StringField(null=True)
    
    def to_dict(self):
        return {
            'user': self.user_id,  #str(self.user_id.id) if self.user_id else None,
            'title': self.title,
            'content': self.content,
            'submission_date': self.submission_date.strftime('%Y-%m-%d %H:%M:%S'),
            'knowledge_field': self.knowledge_field,
            'summary': self.summary,
            'evaluation': self.evaluation,
            'reviewer': self.reviewer
        } 

    def to_json(self):
        return json.loads(self.to_dict())