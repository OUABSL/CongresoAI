import React, { useEffect, useState } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';


function AuthorProfile() {
  const [profileData, setProfileData] = useState(null);
  const { username } = useParams();


  useEffect(() => {
    const getProfile = async () => {
      const response = await fetch(
        `http://localhost:5000/authors/profile/${username}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      const data = await response.json();
      setProfileData(data);
    };
    getProfile();
  }, [username]);

  if (!profileData) {
    return <div>Loading...</div>;
  }
  return (
    <Card style={{ width: '18rem' }} className="mt-5">
      <Card.Body>
        <Card.Title>{profileData.fullname}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{profileData.username}</Card.Subtitle>
        <Card.Text>{profileData.email}</Card.Text>
      </Card.Body>
      <ListGroup variant="flush">
        <ListGroup.Item>{profileData.birthdate}</ListGroup.Item>
        <ListGroup.Item>{profileData.phonenumber}</ListGroup.Item>
        <ListGroup.Item>{`Interests: ${profileData.interests}`}</ListGroup.Item>
        <ListGroup.Item>{`Registration date: ${profileData.registration_date}`}</ListGroup.Item>
      </ListGroup>
    </Card>
  );
}

export default AuthorProfile;