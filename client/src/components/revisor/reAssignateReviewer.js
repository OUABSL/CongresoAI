import React from 'react';
import { Button } from 'react-bootstrap';
import { useContext } from 'react';
import AuthContext from '../../context/context';
import { useNavigate } from 'react-router-dom';
import { AlertContext } from '../../context/alertProvider';
import { useTranslation } from 'react-i18next';

const ReassignateReviewButton = ({ username, articleTitle }) => {
  const { t } = useTranslation();
  const { sessionToken, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);

  const reassignReviewerClickHandler = async () => {
    try {
      const response = await fetch(`/api/v1/evaluate/reassignate/${username}/${articleTitle}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (response.status === 401) {
        logout();
        setAlert({ show: true, variant: 'danger', message: t('reassignReviewer.sessionExpired') });
        return;
      }

      if (response.status === 406) {
        setAlert({ show: true, variant: 'danger', message: t('reassignReviewer.noReviewerFound') });
        return;
      }

      if (response.status === 200) {
        setAlert({ show: true, variant: 'success', message: t('reassignReviewer.reassignmentSuccess') });
        navigate(-1);
      } else {
        setAlert({ show: true, variant: 'danger', message: t('reassignReviewer.errorOccurred') });
      }
    } catch (error) {
      console.error(error);
      setAlert({ show: true, variant: 'danger', message: t('reassignReviewer.errorOccurred') });
    }
  };

  return (
    <Button variant="primary" onClick={reassignReviewerClickHandler}>
      {t('reassignReviewer.buttonLabel')}
    </Button>
  );
};

export default ReassignateReviewButton;