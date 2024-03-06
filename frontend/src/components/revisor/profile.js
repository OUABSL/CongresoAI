import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";

// Use environment variable for API url

function RevisorProfile() {
  const { username, sessionToken } = useContext(AuthContext); // Accede a username y sessionToken desde el contexto
  const [profileData, setProfileData] = useState(null);

  
  
  useEffect(() => {
    const getProfile = async () => {
      const response = await fetch(
        `/api/v1/reviewers/profile/${username}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
          },
        }
      );

      const data = await response.json();
      setProfileData(data);
    };
    getProfile();
  }, [username, sessionToken]);


  if (!profileData) {
    return <div>Loading...</div>;
  }
  return (
    <Card style={{ width: '26rem' }} className="mt-3">
      <Card.Body>
        <Card.Title>{profileData.fullname}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{profileData.username}</Card.Subtitle>
        <Card.Text>{profileData.email}</Card.Text>
        <Button variant="success" size="sm" href={`/portal-reviewer/articles/${username}`}>
        My Articles
      </Button>
      </Card.Body>
      <ListGroup variant="flush">
        <ListGroup.Item>{profileData.birthdate}</ListGroup.Item>
        <ListGroup.Item>{profileData.phonenumber}</ListGroup.Item>
        <ListGroup.Item>{`Knowledges: ${profileData.knowledges}`}</ListGroup.Item>
        <ListGroup.Item>{`Registration date: ${profileData.registration_date}`}</ListGroup.Item>
      </ListGroup>
    </Card>
    );
  }
  
export default RevisorProfile;