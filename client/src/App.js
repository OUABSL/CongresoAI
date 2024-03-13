import React, { useState, useEffect} from 'react';
import MyNavbar from './components/navBar';
import AppFooter from './components/footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/home';
import AppProvider from './context/appProvider'



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
import ContactUs from './components/contactus';



function App() {
  const [data, setData] = useState([]);
 
  return (
    <BrowserRouter>
      <AppProvider>
      <MyNavbar />
      <div className="container p-4">
        <Routes>
        <Route path="" element={ <Home/>}/>
        <Route path="/contactus" element={<ContactUs />} />


        <Route path={"/portal-author/login"}element={<Login />} />
        <Route path="/portal-author/profile/:username" element={<AuthorProfile />} />
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
      </AppProvider>
    </BrowserRouter>
  );
}



export default App;