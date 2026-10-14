import React, { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const SubmitSummary = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { submitSummary, latex_project_url, fileName } = location.state || {};
  const { title, author, description, keywords = [], submission_date, submission_id, submit_number } = submitSummary;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = latex_project_url;
    const alternFileName = title ? `${title.replace(" ", "_")}.zip` : 'submission.zip';
    a.download = fileName || alternFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    document.title = t('submitSummary.confirmation');
  }, [t]);

  return (
    <Card className="mt-4 p-4 mx-auto" style={{ maxWidth: '600px' }}>
      <Card.Header as="h3">{t('submitSummary.confirmation')}</Card.Header>
      <Card.Body>
        <Card.Title>{t('submitSummary.title')}: {title || t('submitSummary.noAvailable')}</Card.Title>
        <Card.Text>{t('submitSummary.author')}: {author || t('submitSummary.noAvailable')}</Card.Text>
        <Card.Text>{t('submitSummary.submissionID')}: {submission_id || t('submitSummary.noAvailable')}</Card.Text>
        <Card.Text>{t('submitSummary.submissionNumber')}: {submit_number || t('submitSummary.noAvailable')}</Card.Text>
        <Card.Text>{t('submitSummary.description')}: {description || t('submitSummary.noAvailable')}</Card.Text>
        <Card.Text>{t('submitSummary.keywords')}: {keywords.length > 0 ? keywords.join(', ') : t('submitSummary.noAvailable')}</Card.Text>
        <Card.Text>{t('submitSummary.submissionDate')}: {submission_date || t('submitSummary.noAvailable')}</Card.Text>
        {latex_project_url ? (
          <Button variant="primary" onClick={handleDownload} className="mt-2">
            {t('submitSummary.downloadLatex')}
          </Button>
        ) : (
          <Card.Text>{t('submitSummary.noLatexURL')}</Card.Text>
        )}
      </Card.Body>
    </Card>
  );
};

export default SubmitSummary;
