import React from 'react'


const LinkSection = () => (
    <div className="col-md-3 mb-md-0 mb-3">
        <h5 className="text-uppercase">Servicios</h5>
        <ul className="list-unstyled">
            <li><a href="#!">Subir un Artículo</a></li>
            <li><a href="#!">Evaluar Artículos</a></li>
            <li><a href="#!">Acceder a mi perfil</a></li>
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
    <footer className="page-footer font-small pt-4 bg-primary">
        <div className="text-center py-3 text-light">
                    <h5 className="text-uppercase text-light">Versión Beta</h5>
                    <p>La presente página es una versión inicial del frontend de la aplicación The Congress AI.</p>
        </div>
        <div className="footer-copyright text-center py-3 text-light">© 2024 Copyright:
            <a href="https://www.cs.us.es/" className="text-light"> Departamento de Ciencias de la Computación e Inteligencia Artificial</a> | 
            <a href="https://www.us.es/" className="text-light"> Universidad de Sevilla</a>
        </div>
    </footer>
)

export default AppFooter