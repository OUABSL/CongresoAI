import React, { useState, useEffect} from 'react';
import MyNavbar from './components/navBar';
import Footer from './components/footer';
import Login from './components/author/login';
import SignUp from './components/author/register';


import 'react-bootstrap';


import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then(response => response.json())  
      .then(data => {
        const parsedData = JSON.parse(data);
        setData(parsedData);      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <BrowserRouter>
      <MyNavbar />
      <div className="container p-4">
        <Routes>
          <Route path="/" element={
            <div>
              { data.length === 0 ? (
                  <p>Loading ...</p>
                ) : (
                  data.map((user, i) => (
                    <div key={i}>
                      <p>Name: {user.name}</p>
                      <p>Email: {user.email}</p>
                      <p>Role: {user.rol}</p>
                    </div>
                  ))
                )
              }
            </div>
          }/>
        <Route path="/portal-author/login" element={<Login />} />
        <Route path="/portal-author/register" element={<SignUp />} />

        </Routes>
      </div>
      <Footer/>
    </BrowserRouter>
  );
}



export default App;