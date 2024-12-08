import React, { useEffect, useState, useContext } from "react";
import { Card, Form, Button } from 'react-bootstrap';
import "../estilos/submit.css";
import "../estilos/input-tags.css";
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider';
import TagsInput from "../tagsInput";
import { useTranslation } from 'react-i18next';

const SubmitArticle = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keyWords, setTags] = useState([]);
  const [file, setFile] = useState(null);
  const { setAlert } = useContext(AlertContext);
  const { username, sessionToken, logout } = useContext(AuthContext);
  const { state } = useLocation();
  const [reviewComments, setReviewComments] = useState([]);
  const [improvements, setImprovements] = useState("");
  const [isResubmit, setIsResubmit] = useState(false);
  const [article, setArticle] = useState({});
  const [submitSummary, setSubmitSummary] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (state && state.isResubmit) {
      setIsResubmit(true);
      setArticle(state.article);
      if (state.comments) {
        const commentsList = Object.entries(state.comments).reduce((acc, [sectionName, sectionComments]) => {
          return acc.concat(`${sectionName}: \n- ${sectionComments}\n`);
        }, []);
        if (article && article.title && article.key_words && article.description && commentsList) {
          setTitle(article.title);
          setTags(article.key_words);
          setDescription(article.description);
          setReviewComments(commentsList);
        }
      }
    }
  }, [state, article]);

  useEffect(() => {
    document.title = isResubmit ? t('submit_article.is_resubmit_title') : t('submit_article.is_submit_title');
  }, [isResubmit, t]);

  const submitForm = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('key_words', JSON.stringify(keyWords));
    if (isResubmit) {
      formData.append('improvements', improvements);
      formData.append('review_comments', reviewComments);
      formData.append('resubmit', true);
    }

    if (file) {
      formData.append('latex_project', file);
    }

    const requestOptions = {
      method: state && isResubmit ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: formData
    };

    const api = state && isResubmit ? `/api/v1/submit/${username}/${title}` : `/api/v1/submit`;
    try {
      const response = await fetch(api, requestOptions);

      const data = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          logout();
          setAlert({ show: true, message: t('auth.session_expired'), variant: 'info' });
          return;
        }
        if (response.status === 422) {
          setAlert({ show: true, message: t('error.invalid_data'), variant: 'danger' });
          return;
        }
        if (response.status === 400) {
          setAlert({ show: true, message: t('error.duplicate_title'), variant: 'info' });
          return;
        } else {
          throw new Error(data.message);
        }
      } else if (response.status === 201 || response.status === 200) {
        setAlert({ show: true, message: t('success.article_submitted'), variant: 'success' });
        const url = URL.createObjectURL(file);
        setSubmitSummary(data.submit_summary);
        const fileName = file ? file.name : "";
        navigate('/portal-author/submit-summary', {
          state: {
            submitSummary: data.submit_summary,
            latex_project_url: url,
            fileName: fileName
          }
        });

        setTitle("");
        setDescription("");
        setTags([]);
        setFile(null);
      }
    } catch (error) {
      console.error(error);
      setAlert({ show: true, message: t('error.submission_failed'), variant: 'danger' });
    }
  };

  return (
    <Card className="submit-card mt-4 p-4 mx-auto">
      <Form onSubmit={submitForm} className="form-class">
        <h2>{t('submit_article.form_title')}</h2>
        <Form.Group>
          <Form.Label className="label-class">{t('submit_article.article_title_label')}</Form.Label>
          <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('submit_article.article_title_placeholder')} required className="input-submit" />
        </Form.Group>

        <Form.Group>
          <Form.Label className="label-class">{t('submit_article.description_label')}</Form.Label>
          <Form.Control as="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('submit_article.description_placeholder')} required className="input-submit" />
        </Form.Group>

        <Form.Group>
          <Form.Label className="label-class">{t('submit_article.keywords_label')}</Form.Label>
          <TagsInput tags={keyWords} setTags={setTags} persPlaceholder={t('submit_article.keywords_placeholder')} />
        </Form.Group>

        {isResubmit && (
          <>
            <Form.Group>
              <Form.Label>{t('submit_article.review_comments_label')}</Form.Label>
              <Form.Control
                as="textarea"
                style={{ height: "100%" }}
                readOnly
                value={reviewComments.join('\n')}
                rows={reviewComments.length}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="label-class">{t('submit_article.improvements_label')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder={t('submit_article.improvements_placeholder')}
                required
                className="input-submit"
              />
            </Form.Group>
          </>
        )}

        <Form.Group>
          <Form.Label className="label-class">{t('submit_article.latex_label')}</Form.Label>
          <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} required className="input-submit" />
        </Form.Group>

        <Button variant="primary" type="submit" className="button-class mt-2">
          {t('submit_article.submit_button')}
        </Button>
      </Form>
    </Card>
  );
};

export default SubmitArticle;