import React from 'react'


const LinkSection = () => (
    <div className="col-md-3 mb-md-0 mb-3">
        <h5 className="text-uppercase">Servicios</h5>
        <ul className="list-unstyled">
            <li><a href="#!">Link 1</a></li>
            <li><a href="#!">Link 2</a></li>
            <li><a href="#!">Link 3</a></li>
            <li><a href="#!">Link 4</a></li>
        </ul>
    </div>
)

const ContactSection = () => (
    <div className="col-md-3 mb-md-0 mb-3">
        <h5 className="text-uppercase">Contáctanos</h5>
        <ul className="list-unstyled">
            <li><a href="#!">Link 1</a></li>
            <li><a href="#!">Link 2</a></li>
            <li><a href="#!">Link 3</a></li>
            <li><a href="#!">Link 4</a></li>
        </ul>
    </div>
)


const AppFooter = () => (
    <footer className="page-footer font-small blue pt-4">
        <div className="container-fluid text-center text-md-left">
            <div className="row">
                <div className="col-md-6 mt-md-0 mt-3">
                    <h5 className="text-uppercase">Versión Beta</h5>
                    <p>La presente página es una versión inicial del frontend de la aplicación The Congress AI.</p>
                </div>
                <hr className="clearfix w-100 d-md-none pb-0"/>
                <LinkSection />
                <ContactSection />
            </div>
        </div>

        <div className="footer-copyright text-center py-3">© 2024 Copyright:
            <a href="https://www.cs.us.es/"> Departamento de Ciencias de la Computación e Inteligencia Artificial</a> | 
            <a href="https://www.us.es/"> Universidad de Sevilla</a>
        </div>
    </footer>
)

export default AppFooter