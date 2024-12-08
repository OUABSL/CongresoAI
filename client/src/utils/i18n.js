// src/utils/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
// don't want to use this?
// have a look at the Quick start guide 
// for passing in lng and translations on init

// import enLang from './locales/en/en.json';
// import esLang from './locales/es/es.json';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
        "navbar": {
            "home": "Home",
            "contact": "Contact Us",
            "articles": "Articles",
            "submit": "Submit Article",
            "welcome": "Welcome",
            "profile": "Profile",
            "logout": "Logout",
            "portal": "Portal"
        },
        "home": {
            "title": "The AI Congress",
            "description": "A revolutionary system for scientific article review using generative AI.",
            "requestDemo": "Request Your Demo!",
            "downloadAuthorManual": "Download Author Manual",
            "downloadReviewerManual": "Download Reviewer Manual",
            "benefitsTitle": "How Can The AI Congress Help You?",
            "benefitsDescription": "Our system uses generative AI to simplify article reviews:",
            "benefit1": "Initial article assessment by generative AI.",
            "benefit2": "Automatic article summary.",
            "benefit3": "Reviewer assignment based on article keywords.",
            "benefit4": "Efficient tools for review and feedback.",
            "benefit5": "Flexibility throughout the process.",
            "howItWorksTitle": "How Does The AI Congress Work?",
            "howItWorksStep1": "You submit your article in LaTeX project format (ZIP).",
            "howItWorksStep2": "Our system processes the content for further steps.",
            "howItWorksStep3": "We generate an automatic summary of your article with generative AI.",
            "howItWorksStep4": "We perform an initial assessment using generative AI.",
            "howItWorksStep5": "The article is assigned to an expert reviewer.",
            "howItWorksStep6": "The reviewer receives the article and AI insights for evaluation.",
            "howItWorksStep7": "The reviewer approves, rejects, or requests improvements.",
            "howItWorksStep8": "The author tracks review progress.",
            "howItWorksStep9": "The review result is communicated."
        },
        "footer": {
            "services": "Services",
            "uploadArticle": "Submit an Article",
            "reviewArticles": "Evaluate Articles",
            "accessProfile": "Access My Profile",
            "contactUs": "Contact Us",
            "link1": "Link 1",
            "link2": "Link 2",
            "link3": "Link 3",
            "link4": "Link 4",
            "contactUs": "Contáctanos",
            "alphaVersion": "Versión Alfa",
            "initialVersion": "Initial version of The Congress AI application.",
            "description": "Initial version of The Congress AI application.",
            "university": "University of Seville",
            "departement":"Department of Computer Science and Artificial Intelligence"
        },
        "portal": {
            "authorPortal": "Author Portal",
            "reviewerPortal": "Reviewer Portal",
            "goToPortal": "Go to the portal"
        },
        "contactUs": {
            "title": "Contact Us",
            "description": "If you have any questions or comments, don't hesitate to reach out to us. We're here to help.",
            "fields": {
                "name": "Name",
                "email": "Email",
                "subject": "Subject",
                "message": "Message"
            },
            "placeholder": {
                "name": "Your Name",
                "email": "Your Email",
                "subject": "Your Subject",
                "message": "Your Message"
            },
            "submit": "Send Message",
            "address": {
                "title": "Address",
                "text": "123 Main Street, City"
            },
            "email": {
                "title": "Email",
                "text": "info@example.com"
            },
            "phone": {
                "title": "Phone",
                "text": "+123 456 7890"
            },
            "successMessage": "Message sent successfully!",
            "alertMessage": "Functionality under development"
        },
        "loginAuthor": {
            "title": "Author Login",
            "username": "Username",
            "password": "Password",
            "rememberMe": "Remember Me",
            "loginButton": "Login",
            "loggingIn": "Logging In...",
            "forgotPassword": "Forgot your password?",
            "noAccount": "Don't have an account yet? Register!",
            "success": "Login Successful",
            "userNotFound": "User does not exist",
            "invalidCredentials": "Invalid username or password",
            "timeout": "The request timed out. Please try again."
            },
        "registerAuthor": {
            "title": "Author Registration",
            "fullName": "Full Name",
            "username": "Username",
            "email": "Email",
            "phone": "Phone Number",
            "password": "Password",
            "confirmPassword": "Confirm Password",
            "interests": "Areas of Interest",
            "registerButton": "Register",
            "registering": "Registering...",
            "alreadyRegistered": "Already registered? Log in!",
            "requiredFields": "All fields are required! Please complete the {{field}} field.",
            "validationErrors": "Validation errors occurred:",
            "usernameExists": "Username already exists!",
            "unauthorized": "Unauthorized registration!",
            "registrationSuccess": "Registration successful! Please log in.",
            "registrationError": "An error occurred during registration. Please try again later."
        },
        "authorProfile": {
            "title": "Author Profile - {{username}}",
            "name": "Name:",
            "username": "Username:",
            "email": "Email:",
            "phone": "Phone:",
            "interests": "Interests:",
            "registrationDate": "Registration Date:",
            "editProfile": "Edit Profile",
            "save": "Save",
            "cancel": "Cancel",
            "changeToReviewer": "Change to Reviewer",
            "updatingProfileSuccess": "Profile updated successfully",
            "updatingProfileError": "Could not update the profile. Please try again later.",
            "changingRoleError": "Could not change the role. Please try again later."
        },
        "submit_article": {
            "form_title": "Fill out the form",
            "article_title_label": "Article Title",
            "article_title_placeholder": "Enter the manuscript title",
            "description_label": "Brief Description of Content",
            "description_placeholder": "Enter a summary description for the manuscript",
            "keywords_label": "Keywords",
            "keywords_placeholder": "Manuscript keywords",
            "review_comments_label": "Reviewer Comments",
            "improvements_label": "Description of Improvements",
            "improvements_placeholder": "Describe the improvements made",
            "latex_label": "Latex Project",
            "submit_button": "Submit",
            "is_resubmit_title": "Resubmit Article",
            "is_submit_title": "Submit Article"
        },
        "submitSummary": {
            "confirmation": "Submission Confirmation",
            "title": "Title",
            "author": "Author",
            "submissionID": "Submission ID",
            "submissionNumber": "Submission Number",
            "description": "Article Description",
            "keywords": "Keywords",
            "submissionDate": "Submission Date",
            "downloadLatex": "Download LaTeX Project",
            "noLatexURL": "No LaTeX project URL available."
          },
        "showSubmittedArticles": {
            "revisionResult": "Review Result",
            "noArticles": "No articles assigned",
            "columns": {
                "number": "#",
                "title": "Title",
                "submissionID": "Submission ID",
                "reviewStatus": "Review Status",
                "submissionDate": "Submission Date",
                "submissionNumber": "Submission Number",
                "viewArticle": "View Article"
            },
            "pendingReview": "Pending Review"
        },
        "showSubmittedArticle": {
            "backButton": "Volver Atrás",
            "resubmitButton": "Realizar nueva entrega",
            "reviewer": "Revisor",
            "reviewResult": "Resultado de revisión",
            "description": "Descripción",
            "commentTitle": "Comentario",
            "submitNumber": "Número de entrega"
        },
        "navigateToSubmitButton": {
            "label": "Resubmit Article"
        },
        "downloadArticle": {
            "label": "Download",
            "pdf": "Download PDF",
            "zip": "Download ZIP"
        },
        "displaySectionReview": {
            "commentTitle": "Comment"
        },
        "loginReviewer": {
            "title": "Reviewer Access",
            "username": "Username",
            "password": "Password",
            "rememberMe": "Remember me",
            "loginButton": "Log In",
            "loggingIn": "Logging In...",
            "forgotPassword": "Forgot your password?",
            "contactAdmin": "Don't have an account? Contact the administrator!",
            "modalTitle": "Contact Administrator",
            "modalBody": "Please provide the investigator's ORCID to receive a personalized link. You can contact the administrator in the following ways:",
            "copyEmail": "Copy Email",
            "sendEmail": "Send Email",
            "success": "Login Successful",
        },
        "signUpReviewer": {
            "registerReviewer": "Reviewer Registration",
            "orcidId": "ORCID ID",
            "createAuthorPortal": "Create Author Portal?",
            "yes": "Yes",
            "no": "No",
            "fullName": "Full Name",
            "username": "Username",
            "email": "Email",
            "phoneNumber": "Phone Number",
            "password": "Password",
            "repeatPassword": "Repeat Password",
            "knowledgeArea": "Knowledge Area",
            "alreadyRegistered": "Already registered?",
            "signIn": "Sign In",
            "notAuthorized": "Registration not authorized!",
            "contactAdmin": "Please contact the administrator."
        },
        "reviewerProfile": {
            "profileTitle": "Reviewer Profile",
            "name": "Name",
            "orcid": "ORCID",
            "email": "Email",
            "phone": "Phone",
            "knowledgeAreas": "Knowledge Areas",
            "registrationDate": "Registration Date",
            "editProfile": "Edit Profile",
            "save": "Save",
            "cancel": "Cancel",
            "switchToAuthor": "Switch to Author",
            "updateSuccess": "Profile updated",
            "updateError": "Profile could not be updated. Try again later!"
        },
        "reassignReviewer": {
            "buttonLabel": "Reassign Reviewer",
            "sessionExpired": "Session expired. Please log in again.",
            "noReviewerFound": "No compatible reviewer found. Please contact the administrator!",
            "reassignmentSuccess": "Reviewer reassigned successfully.",
            "errorOccurred": "An error occurred. Please contact the administrator!"
        },
        "regenerationModal": {
            "buttonLabel": "Start New Processing",
            "title": "Select an item to regenerate",
            "selectTask": "Please select at least one task to regenerate.",
            "defaultModel": "Default model will be used: {model}",
            "cancelButton": "Cancel",
            "confirmButton": "Confirm",
            "successMessage": "Reevaluation started successfully. Check the result in 5 minutes.",
            "error500": "Error during reevaluation. Please contact the administrator.",
            "generalError": "An error occurred during the process. Please try again later.",
            "datapreparation": "Manuscript content processing",
            "summary": "Manuscript summary",
            "initialevaluation": "Initial manuscript evaluation"
        },
        "showAssignedArticle": {
            "reviewerComment": "Reviewer Comment",
            "saveSectionReview": "Save Section Review",
            "previousReviewSummary": "Previous Review Summary",
            "editReview": "Edit Review",
            "summary": "Summary",
            "initialEvaluation": "Initial Evaluation",
            "review": "Review",
            "backButton": "Go Back",
            "saveReview": "Save Review",
            "previousReviewResult": "Previous Review Result",
            "reviewStatus": "Review Status",
            "description": "Description",
            "submissionNumber": "Submission Number",
            "chooseReviewStatus": "Choose a review status",
            "close": "Close",
            "confirmChoice": "Confirm Choice",
            "errorFetchingArticle": "Could not load the manuscript! Please try again later.",
            "reviewSavedSuccess": "Review saved successfully.",
            "reviewSaveError": "Failed to save review. Please try again."
        },
        "showAssignedArticles": {
            "assignedArticles": "Assigned Articles",
            "noArticlesAssigned": "No assigned articles found",
            "accessArticle": "Access Article",
            "failed": "Failed",
            "processing": "Processing",
            "evaluate": "Evaluate",
            "submissionDate": "Submission Date",
            "lastModified": "Last Modified",
            "submissionNumber": "Submission Number",
            "reviewStatus": "Review Status",
            "articleTitle": "Title",
            "articleDescription": "Description"
        }
    }, 
  },
  es: {
    translation: {
        "navbar": {
            "home": "Inicio",
            "contact": "Contáctenos",
            "articles": "Manuscritos",
            "submit": "Subir Manuscrito",
            "welcome": "Bienvenido",
            "profile": "Perfil",
            "logout": "Cerrar sesión",
            "portal": "Portal"
        },
        "home": {
            "title": "The AI Congress",
            "description": "Un sistema revolucionario de revisión de artículos científicos con inteligencia artificial generativa.",
            "requestDemo": "¡Solicita su demo!",
            "downloadAuthorManual": "Descargar el manual de autor",
            "downloadReviewerManual": "Descargar el manual de revisor",
            "benefitsTitle": "¿Cómo puede ayudarte The AI Congress?",
            "benefitsDescription": "Nuestro sistema utiliza IA generativa para facilitar la tarea de revisión:",
            "benefit1": "Evaluación inicial del artículo por la IA generativa.",
            "benefit2": "Resumen automático del artículo.",
            "benefit3": "Asignación al revisor según palabras clave.",
            "benefit4": "Herramientas eficientes para revisión y feedback.",
            "benefit5": "Flexibilidad en el proceso.",
            "howItWorksTitle": "¿Cómo funciona The AI Congress?",
            "howItWorksStep1": "Envías tu artículo en formato proyecto LaTeX (ZIP).",
            "howItWorksStep2": "Procesamos el contenido para pasos posteriores.",
            "howItWorksStep3": "Generamos un resumen automático con IA generativa.",
            "howItWorksStep4": "Realizamos una evaluación inicial con IA generativa.",
            "howItWorksStep5": "Asignamos el artículo a un revisor experto.",
            "howItWorksStep6": "El revisor evalúa el artículo con la ayuda de IA.",
            "howItWorksStep7": "El revisor aprueba, rechaza o solicita mejoras.",
            "howItWorksStep8": "El autor monitorea el progreso.",
            "howItWorksStep9": "Se comunica el resultado de la revisión."
        },
        "footer": {
            "services": "Servicios",
            "uploadArticle": "Subir un Artículo",
            "reviewArticles": "Evaluar Artículos",
            "accessProfile": "Acceder a mi perfil",
            "contactUs": "Contáctanos",
            "link1": "Enlace 1",
            "link2": "Enlace 2",
            "link3": "Enlace 3",
            "link4": "Enlace 4",
            "alphaVersion": "Versión Alfa",
            "description": "Versión inicial de la aplicación The Congress AI.",
            "university": "Universidad de Sevilla",
            "departement":"Department of Computer Science and Artificial Intelligence",
            "initialVersion": "Versión inicial de la aplicación The Congress AI.",
        },
        "portal": {
            "authorPortal": "Portal de Autor",
            "reviewerPortal": "Portal de Revisor",
            "goToPortal": "Ir al portal"
        },
        "contactUs": {
            "title": "Contáctanos",
            "description": "Si tienes alguna pregunta o comentario, no dudes en contactarnos. Estamos aquí para ayudarte.",
            "fields": {
                "name": "Nombre",
                "email": "Correo Electrónico",
                "subject": "Asunto",
                "message": "Mensaje"
            },
            "placeholder": {
                "name": "Tu Nombre",
                "email": "Tu Correo Electrónico",
                "subject": "Tu Asunto",
                "message": "Tu Mensaje"
            },
            "submit": "Enviar mensaje",
            "address": {
                "title": "Dirección",
                "text": "Calle Mayor, 123, Ciudad"
            },
            "email": {
                "title": "Correo Electrónico",
                "text": "info@ejemplo.com"
            },
            "phone": {
                "title": "Teléfono",
                "text": "+123 456 7890"
            },
            "successMessage": "¡Mensaje enviado con éxito!",
            "alertMessage": "Funcionalidad en desarrollo"
        },
        "loginAuthor": {
            "title": "Inicio de sesión - Autor",
            "username": "Nombre de usuario",
            "password": "Contraseña",
            "rememberMe": "Recuérdame",
            "loginButton": "Iniciar Sesión",
            "loggingIn": "Iniciando Sesión...",
            "forgotPassword": "¿Olvidaste tu contraseña?",
            "noAccount": "¿No tienes una cuenta aún? ¡Regístrate!",
            "success": "Inicio de sesión exitoso",
            "userNotFound": "No existe el usuario",
            "invalidCredentials": "Usuario o contraseña incorrectos",
            "timeout": "La solicitud ha tardado demasiado. Por favor, intentelo de nuevo."
        },
        "registerAuthor": {
            "title": "Registro de Autor",
            "fullName": "Nombre completo",
            "username": "Nombre de usuario",
            "email": "Correo electrónico",
            "phone": "Número de teléfono",
            "password": "Contraseña",
            "confirmPassword": "Repita su Contraseña",
            "interests": "Áreas de Interés",
            "registerButton": "Registrarse",
            "registering": "Registrándose...",
            "alreadyRegistered": "¿Ya está registrado? ¡Iniciar sesión!",
            "requiredFields": "¡Todos los campos son obligatorios! Completa el campo {{field}}.",
            "validationErrors": "Se produjeron errores de validación:",
            "usernameExists": "¡Nombre de usuario ya existe!",
            "unauthorized": "¡Registro no autorizado!",
            "registrationSuccess": "¡Registro correcto! Por favor, inicia sesión.",
            "registrationError": "¡Ha ocurrido un error durante el registro! Por favor, intentálo de nuevo más tarde."
        },
        "authorProfile": {
            "title": "Perfil de autor - {{username}}",
            "name": "Nombre:",
            "username": "Usuario:",
            "email": "Email:",
            "phone": "Teléfono:",
            "interests": "Intereses:",
            "registrationDate": "Fecha de registro:",
            "editProfile": "Editar perfil",
            "save": "Guardar",
            "cancel": "Cancelar",
            "changeToReviewer": "Pasar a revisor",
            "updatingProfileSuccess": "Perfil actualizado correctamente",
            "updatingProfileError": "No se pudo actualizar el perfil. Intenta en otro momento.",
            "changingRoleError": "No se pudo cambiar el rol. Inténtelo de nuevo más tarde."
        },
        "submit_article": {
            "form_title": "Rellene el formulario",
            "article_title_label": "Titulo del artículo",
            "article_title_placeholder": "Ingresa el título del manuscrito",
            "description_label": "Descripción breve de su contenido",
            "description_placeholder": "Introduzca una descripción resumida para el manuscrito",
            "keywords_label": "Palabras clave",
            "keywords_placeholder": "Palabras claves del manuscrito",
            "review_comments_label": "Comentarios del Revisor",
            "improvements_label": "Descripción de realizadas mejoras",
            "improvements_placeholder": "Describe las mejoras realizadas",
            "latex_label": "Proyecto Latex",
            "submit_button": "Confirmar entrega",
            "is_resubmit_title": "Mejorar Entrega",
            "is_submit_title": "Subir artículo"
        },
        "submitSummary": {
            "confirmation": "Confirmación de Entrega",
            "title": "Título",
            "author": "Autor",
            "submissionID": "ID de entrega",
            "submissionNumber": "Número de entrega",
            "description": "Descripción del artículo",
            "keywords": "Palabras clave",
            "submissionDate": "Fecha de Entrega",
            "downloadLatex": "Descargar Proyecto LaTeX",
            "noLatexURL": "No hay URL para el proyecto LaTeX disponible."
          },
        "showSubmittedArticles": {
            "revisionResult": "Resultado de Revisión",
            "noArticles": "No existe ningún artículo asignado",
            "columns": {
                "number": "#",
                "title": "Título",
                "submissionID": "ID de entrega",
                "reviewStatus": "Estado de revisión",
                "submissionDate": "Fecha de presentación",
                "submissionNumber": "Número de entrega",
                "viewArticle": "Ver artículo"
            },
            "pendingReview": "Pendiente de Revisión"
        },
        "showSubmittedArticle": {
            "backButton": "Volver Atrás",
            "resubmitButton": "Realizar nueva entrega",
            "reviewer": "Revisor",
            "reviewResult": "Resultado de revisión",
            "description": "Descripción",
            "commentTitle": "Comentario",
            "submitNumber": "Número de entrega"
        },
        "navigateToSubmitButton": {
            "label": "Realizar nueva entrega"
        },
        "downloadArticle": {
            "label": "Descargar",
            "pdf": "Descargar PDF",
            "zip": "Descargar ZIP"
        },
        "displaySectionReview": {
            "commentTitle": "Comentario"
        },
        "loginReviewer": {
            "title": "Acceso de revisor",
            "username": "Nombre de usuario",
            "password": "Contraseña",
            "rememberMe": "Recuérdame",
            "loginButton": "Iniciar Sesión",
            "loggingIn": "Iniciando Sesión...",
            "forgotPassword": "¿Olvidaste tu contraseña?",
            "contactAdmin": "¿No tienes una cuenta? ¡Contacte con el administrador!",
            "modalTitle": "Contactar al Administrador",
            "modalBody": "Se ruega indicar el ORCID del investigador para recibir el enlace personalizado. Puede contactar al administrador de la siguiente manera:",
            "copyEmail": "Copiar Correo",
            "sendEmail": "Enviar Correo",
            "success": "Inicio de sesión exitoso",
        },
        "signUpReviewer": {
            "registerReviewer": "Registro de revisor",
            "orcidId": "ORCID ID",
            "createAuthorPortal": "¿Crear portal de autor?",
            "yes": "Sí",
            "no": "No",
            "fullName": "Nombre completo",
            "username": "Nombre de usuario",
            "email": "Correo electrónico",
            "phoneNumber": "Número de teléfono",
            "password": "Contraseña",
            "repeatPassword": "Repita su Contraseña",
            "knowledgeArea": "Área de Conocimiento",
            "alreadyRegistered": "¿Ya está registrado?",
            "signIn": "Iniciar sesión",
            "notAuthorized": "¡Registro no autorizado!",
            "contactAdmin": "Por favor, contacte con el administrador."
        },
        "reviewerProfile": {
            "title": "Perfil de revisor",
            "name": "Nombre",
            "orcid": "ORCID",
            "email": "Correo electrónico",
            "phone": "Teléfono",
            "knowledgeAreas": "Conocimientos",
            "registrationDate": "Fecha de registro",
            "editProfile": "Editar perfil",
            "save": "Guardar",
            "cancel": "Cancelar",
            "switchToAuthor": "Pasar a autor",
            "updateSuccess": "Perfil actualizado",
            "updateError": "No se pudo actualizar el perfil. Intenta en otro momento!"
        },
        "reassignReviewer": {
            "buttonLabel": "Asignar nuevo revisor",
            "sessionExpired": "Sesión abortada. Por favor inicia sesión de nuevo.",
            "noReviewerFound": "No se encontró un revisor compatible. ¡Por favor contacta al administrador!",
            "reassignmentSuccess": "Nuevo revisor asignado correctamente.",
            "errorOccurred": "Ha sucedido un error. ¡Por favor contacta al administrador!"
        },
        "regenerationModal": {
            "buttonLabel": "Generar nuevo procesamiento",
            "title": "Selecciona el elemento a regenerar",
            "selectTask": "Seleccione al menos una tarea para regenerar.",
            "defaultModel": "Se usará el modelo por defecto: {model}",
            "cancelButton": "Cancelar",
            "confirmButton": "Confirmar",
            "successMessage": "Reevaluación iniciada con éxito. Vuelve a comprobar el resultado en 5 minutos.",
            "error500": "Error en la reevaluación. Avise al administrador.",
            "generalError": "Ha sucedido un error en el proceso. Por favor, inténtalo más tarde.",
            "datapreparation": "Procesamiento del contenido del manuscrito",
            "summary":"Resúmen del manuscrito",
            "initialevaluation":"Evaluación inicial del manuscrito"
        },
        "showAssignedArticle": {
            "reviewerComment": "Comentario del Revisor",
            "saveSectionReview": "Guardar Revisión de Sección",
            "previousReviewSummary": "Resumen de la revisión anterior",
            "editReview": "Editar Revisión",
            "summary": "Resumen",
            "initialEvaluation": "Evaluación inicial",
            "review": "Revisión",
            "backButton": "Volver Atrás",
            "saveReview": "Guardar Revisión",
            "previousReviewResult": "Resultado de revisión anterior",
            "reviewStatus": "Estado de revisión",
            "description": "Descripción",
            "submissionNumber": "Número de entrega",
            "chooseReviewStatus": "Elige un estado para la revisión",
            "close": "Cerrar",
            "confirmChoice": "Confirmar Elección",
            "errorFetchingArticle": "No se pudo cargar el manuscrito! Inténtalo más tarde.",
            "reviewSavedSuccess": "Revisión guardada con éxito.",
            "reviewSaveError": "No se pudo guardar la revisión. Inténtalo de nuevo."
        },
        "showAssignedArticles": {
            "assignedArticles": "Artículos Asignados",
            "noArticlesAssigned": "No existe ningún artículo asignado",
            "accessArticle": "Acceder al Artículo",
            "failed": "Fallido",
            "processing": "Procesando",
            "evaluate": "Evaluar",
            "submissionDate": "Fecha de Entrega",
            "lastModified": "Última Modificación",
            "submissionNumber": "Número de Entrega",
            "reviewStatus": "Estado de Revisión",
            "articleTitle": "Título",
            "articleDescription": "Descripción"
        }
    },
  },
};

  
  i18n
    // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
    // learn more: https://github.com/i18next/i18next-http-backend
    // want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
    .use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    debug:true,
    lng: localStorage.getItem('idi') || 'es', // Detectar idioma desde localStorage
    fallbackLng: 'es', // Idioma de respaldo
    returnObjects: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;