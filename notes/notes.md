si el result_status es igual a Pending Improvement, se debe permitir al autor subir el articulo de nuevo en formato zip (latex project), pero va a haber un campo adicional en la entrega que es los comentarios del revisor, ese campo adicional va a aparecer en la vista submit como auto complementado de la siguiente forma "section_name : comment" y va a ser un elemento clave en desarrollo posterior de la logica backend flask.

en showSubmitedArticle va a estar un buton que redirecciona el autor a la vista submit pero con los datos ya autocomplementados solo el usuario tiene que subir el zip y añadir descripcion de las mejoras (un campo nuevo adicional ) y se debe realizar  un PUT no un POST al backend flask.

añade la funcionalidad nueva a los componentes showSubmitedArticle y Submit.