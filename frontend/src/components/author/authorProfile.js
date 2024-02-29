import React, { useEffect, useState } from 'react';

function AuthorProfile() {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        const fetchProfile = async () => {
          try {
            const response = await fetch('http://localhost:5000/profile', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log(data)
            setProfileData(data);
          } catch (error) {
            setError(error);
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchProfile();
      }, []);

    return (
        <div className="container">
          {isLoading && <div className="text-center">Loading profile...</div>}
          {error && <div className="alert alert-danger">{error.message}</div>}
          {profileData && (
            <div className="card mb-3">
              <div className="card-header">
                <h3>{profileData.fullname}</h3>
              </div>
              <div className="card-body">
                <h5 className="card-title">Username: {profileData.username}</h5>
                <h6 className="card-subtitle mb-2 text-muted">Email: {profileData.email}</h6>
              </div>
            </div>
          )}
        </div>
      );
    }

export default AuthorProfile;