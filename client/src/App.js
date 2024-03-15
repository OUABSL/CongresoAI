import React, { useState, useEffect, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap';
import { Alert } from 'react-bootstrap';


import MyNavbar from './components/navBar';
import AppFooter from './components/footer';
import Home from './components/home';
import ContactUs from './components/contactus';
import AppProvider from './context/appProvider'
import { AlertProvider, AlertContext } from './context/alertProvider';



import Login from './components/author/login';
import SignUpAuthor from './components/author/register';
import AuthorProfile from './components/author/authorProfile';
import SubmitArticle from './components/author/submit';


import LoginRevisor from './components/revisor/login';
import SignUpRevisor from './components/revisor/register';
import RevisorProfile from './components/revisor/profile';
import ShowArticles from './components/revisor/show_articles'
import ShowArticle from './components/revisor/show_article'





function App() {
  const [data, setData] = useState([]);

 
  return (
    <BrowserRouter>
      <AppProvider>
      <AlertProvider>
      <MyNavbar />
      <div className="container p-4">
      <AlertContext.Consumer>
              {context => {
                const {alert, setAlert} = context;
                return alert.show && 
                <Alert
                  className="mb-2 mx-auto"
                  variant={alert.variant}
                  onClose={() => setAlert({ ...alert, show: false })}
                  dismissible
                >
                  {alert.message}
                </Alert>
              }}
      </AlertContext.Consumer>
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
      </AlertProvider>
      </AppProvider>
    </BrowserRouter>
  );
}



export default App;