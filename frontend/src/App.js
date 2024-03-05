import React, { useState, useEffect} from 'react';
import MyNavbar from './components/navBar';
import AppFooter from './components/footer';
import 'bootstrap/dist/css/bootstrap.min.css';



import Login from './components/author/login';
import SignUpAuthor from './components/author/register';
import AuthorProfile from './components/author/authorProfile';
import SubmitArticle from './components/author/submit';


import LoginRevisor from './components/revisor/login';
import SignUpRevisor from './components/revisor/register';
import RevisorProfile from './components/revisor/profile';
import ShowArticles from './components/revisor/show_articles'
import ShowArticle from './components/revisor/show_article'

import 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";



const userContext = React.createContext(null);
const setUserContext = React.createContext(null);

const APIContext = React.createContext();
const setAPIContext = React.createContext(null);

function App() {
  const [data, setData] = useState([]);

 
  return (
    <BrowserRouter>
      <MyNavbar />
      <div className="container p-4">
        <Routes>
          <Route path="" element={
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
        <Route path="/portal-author/register" element={<SignUpAuthor />} />
        <Route path="/portal-author/profile/:username" element={<AuthorProfile />} />
        <Route path="/portal-author/submit" element={<SubmitArticle />} />
        


        <Route path={"/portal-reviewer/login"}element={<LoginRevisor />} />
        <Route path={"/portal-reviewer/register"} element={<SignUpRevisor />} />
        <Route path={`/portal-reviewer/profile/:username`} element={<RevisorProfile />} />
        <Route path={"/portal-reviewer/articles/:username"} element={<ShowArticles />} />
        <Route path={"/portal-reviewer/articles/:username/:article_title"} element={<ShowArticle />} />


        
        </Routes>
      </div>
      <AppFooter/>
    </BrowserRouter>
  );
}



export default App;