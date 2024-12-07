// src/utils/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
// don't want to use this?
// have a look at the Quick start guide 
// for passing in lng and translations on init

// import translationEn from './locales/en/translation.json';
// import translationEs from './locales/es/translation.json';

  const translationEn = {
    navbar: {
      home: "Home",
      contact: "Contact Us",
      articles: "Articles",
      submit: "Submit Article",
      welcome: "Welcome",
      profile: "Profile",
      logout: "Logout",
      portal: "Portal"
    },
    home: {
      title: "The AI Congress",
      description: "A revolutionary system for scientific article review using generative AI.",
      requestDemo: "Request Your Demo!",
      downloadAuthorManual: "Download Author Manual",
      downloadReviewerManual: "Download Reviewer Manual",
      benefitsTitle: "How Can The AI Congress Help You?",
      benefitsDescription: "Our system uses generative AI to simplify article reviews:",
      benefit1: "Initial article assessment by generative AI.",
      benefit2: "Automatic article summary.",
      benefit3: "Reviewer assignment based on article keywords.",
      benefit4: "Efficient tools for review and feedback.",
      benefit5: "Flexibility throughout the process.",
      howItWorksTitle: "How Does The AI Congress Work?",
      howItWorksStep1: "You submit your article in LaTeX project format (ZIP).",
      howItWorksStep2: "Our system processes the content for further steps.",
      howItWorksStep3: "We generate an automatic summary of your article with generative AI.",
      howItWorksStep4: "We perform an initial assessment using generative AI.",
      howItWorksStep5: "The article is assigned to an expert reviewer.",
      howItWorksStep6: "The reviewer receives the article and AI insights for evaluation.",
      howItWorksStep7: "The reviewer approves, rejects, or requests improvements.",
      howItWorksStep8: "The author tracks review progress.",
      howItWorksStep9: "The review result is communicated."
    },
    footer: {
      services: "Services",
      uploadArticle: "Submit an Article",
      reviewArticles: "Evaluate Articles",
      accessProfile: "Access My Profile",
      contactUs: "Contact Us",
      link1: "Link 1",
      link2: "Link 2",
      link3: "Link 3",
      link4: "Link 4",
      alphaVersion: "Alpha Version",
      description: "Initial version of The Congress AI application."
    },
    portal: {
      authorPortal: "Author Portal",
      reviewerPortal: "Reviewer Portal",
      goToPortal: "Go to the portal"
    },
    contactUs: {
      title: "Contact Us",
      description: "If you have any questions or comments, don't hesitate to reach out to us. We're here to help.",
      fields: {
        name: "Name",
        email: "Email",
        subject: "Subject",
        message: "Message"
      },
      placeholder: {
        name: "Your Name",
        email: "Your Email",
        subject: "Your Subject",
        message: "Your Message"
      },
      submit: "Send Message",
      address: {
        title: "Address",
        text: "123 Main Street, City"
      },
      email: {
        title: "Email",
        text: "info@example.com"
      },
      phone: {
        title: "Phone",
        text: "+123 456 7890"
      },
      successMessage: "Message sent successfully!",
      alertMessage: "Functionality under development"
    }
  };
  
  const translationEs = {
    navbar: {
      home: "Inicio",
      contact: "Contáctenos",
      articles: "Manuscritos",
      submit: "Subir Manuscrito",
      welcome: "Bienvenido",
      profile: "Perfil",
      logout: "Cerrar sesión",
      portal: "Portal"
    },
    home: {
      title: "The AI Congress",
      description: "Un sistema revolucionario de revisión de artículos científicos con inteligencia artificial generativa.",
      requestDemo: "¡Solicita su demo!",
      downloadAuthorManual: "Descargar el manual de autor",
      downloadReviewerManual: "Descargar el manual de revisor",
      benefitsTitle: "¿Cómo puede ayudarte The AI Congress?",
      benefitsDescription: "Nuestro sistema utiliza IA generativa para facilitar la tarea de revisión:",
      benefit1: "Evaluación inicial del artículo por la IA generativa.",
      benefit2: "Resumen automático del artículo.",
      benefit3: "Asignación al revisor según palabras clave.",
      benefit4: "Herramientas eficientes para revisión y feedback.",
      benefit5: "Flexibilidad en el proceso.",
      howItWorksTitle: "¿Cómo funciona The AI Congress?",
      howItWorksStep1: "Envías tu artículo en formato proyecto LaTeX (ZIP).",
      howItWorksStep2: "Procesamos el contenido para pasos posteriores.",
      howItWorksStep3: "Generamos un resumen automático con IA generativa.",
      howItWorksStep4: "Realizamos una evaluación inicial con IA generativa.",
      howItWorksStep5: "Asignamos el artículo a un revisor experto.",
      howItWorksStep6: "El revisor evalúa el artículo con la ayuda de IA.",
      howItWorksStep7: "El revisor aprueba, rechaza o solicita mejoras.",
      howItWorksStep8: "El autor monitorea el progreso.",
      howItWorksStep9: "Se comunica el resultado de la revisión."
    },
    footer: {
      services: "Servicios",
      uploadArticle: "Subir un Artículo",
      reviewArticles: "Evaluar Artículos",
      accessProfile: "Acceder a mi perfil",
      contactUs: "Contáctanos",
      link1: "Enlace 1",
      link2: "Enlace 2",
      link3: "Enlace 3",
      link4: "Enlace 4",
      alphaVersion: "Versión Alfa",
      description: "Versión inicial de la aplicación The Congress AI."
    },
    portal: {
      authorPortal: "Portal de Autor",
      reviewerPortal: "Portal de Revisor",
      goToPortal: "Ir al portal"
    },
    contactUs: {
      title: "Contáctanos",
      description: "Si tienes alguna pregunta o comentario, no dudes en contactarnos. Estamos aquí para ayudarte.",
      fields: {
        name: "Nombre",
        email: "Correo Electrónico",
        subject: "Asunto",
        message: "Mensaje"
      },
      placeholder: {
        name: "Tu Nombre",
        email: "Tu Correo Electrónico",
        subject: "Tu Asunto",
        message: "Tu Mensaje"
      },
      submit: "Enviar mensaje",
      address: {
        title: "Dirección",
        text: "Calle Mayor, 123, Ciudad"
      },
      email: {
        title: "Correo Electrónico",
        text: "info@ejemplo.com"
      },
      phone: {
        title: "Teléfono",
        text: "+123 456 7890"
      },
      successMessage: "¡Mensaje enviado con éxito!",
      alertMessage: "Funcionalidad en desarrollo"
    }
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
    resources: {
      en: { translation: translationEn },
      es: { translation: translationEs },
    },
    lng: 'es', // Idioma por defecto
    fallbackLng: 'es', // Idioma de respaldo
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;