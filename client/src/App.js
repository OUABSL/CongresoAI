import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap';
import { Alert } from 'react-bootstrap';


import MyNavbar from './components/navBar';
import AppFooter from './components/footer';
import Home from './components/home';
import ContactUs from './components/contactus';
import AppProvider from './context/appProvider'
import { AlertProvider, AlertContext } from './context/alertProvider';



import LoginAuthor from './components/author/login';
import SignUpAuthor from './components/author/register';
import AuthorProfile from './components/author/authorProfile';
import SubmitArticle from './components/author/submit';
import SubmitSummary from './components/author/submitSummary';
import ShowSubmittedArticles from './components/author/showSubmitedArticles';
import ShowSubmittedArticle from './components/author/showSubmitedArticle';


import LoginRevisor from './components/revisor/login';
import SignUpRevisor from './components/revisor/register';
import RevisorProfile from './components/revisor/profile';
import ShowAssignedArticles from './components/revisor/showAssignedArticles'
import ShowArticle from './components/revisor/showAssignedArticle'

import Portal from './components/portal';




function App() {

 
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
      <Route path={"/contactus"} element={<ContactUs />} />
      <Route path={"/portal"} element={<Portal />} />


        <Route path={"/portal-author/login"}element={<LoginAuthor />} />
        <Route path="/portal-author/profile/:username" element={<AuthorProfile />} />
        <Route path="/portal-author/register" element={<SignUpAuthor />} />
        <Route path="/portal-author/profile/:username" element={<AuthorProfile />} />
        <Route path="/portal-author/submit" element={<SubmitArticle />} />
        <Route path="/portal-author/submit-summary" element={<SubmitSummary />} />
        <Route path={"/portal-author/articles/:username"} element={<ShowSubmittedArticles />} />
        <Route path={"/portal-author/articles/:username/:article_title"} element={<ShowSubmittedArticle />} />

        

        <Route path={"/portal-reviewer/login"}element={<LoginRevisor />} />
        <Route path={"/portal-reviewer/register"} element={<SignUpRevisor />} />
        <Route path={`/portal-reviewer/profile/:username`} element={<RevisorProfile />} />
        <Route path={"/portal-reviewer/articles/:username"} element={<ShowAssignedArticles />} />
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