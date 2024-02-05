from mongoengine import Document, StringField, ReferenceField
from user import User
import json


class ScientificWork(Document, User):
    user_id = ReferenceField(User)
    title = StringField()
    content = StringField()
    submission_date = StringField()
    knowledge_field = StringField()
    summary = StringField()
    evaluation = StringField()
    reviewer = StringField()  # Can be None if a reviewer has not yet been assigned.

    def to_dict(self):
        return {
            'user': str(self.user_id.id),
            'title': self.title,
            'content': self.content,
            'submission_date': self.submission_date,
            'knowledge_field': self.knowledge_field,
            'summary': self.summary,
            'evaluation': self.evaluation,
            'reviewer': self.reviewer,
        }

    def to_json(self):
        return json.dumps(self.to_dict())