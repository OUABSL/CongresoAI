import React from 'react';
import "./estilos/footer.css";

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
    <footer className="page-footer font-small pt-2">
        <div className="text-center py-2 text-dark">
                    <h5 className="text-uppercase text-dark">Versión Beta</h5>
                    <p>La presente página es una versión inicial del frontend de la aplicación The Congress AI.</p>
        </div>
        <div className="footer-copyright text-center text-dark">© 2024 Copyright:
            <a href="https://www.cs.us.es/" className="text-secondary"> Departamento de Ciencias de la Computación e Inteligencia Artificial</a> | 
            <a href="https://www.us.es/" className="text-secondary"> Universidad de Sevilla</a>
        </div>
    </footer>
)

export default AppFooter