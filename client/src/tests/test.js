const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };
  
  // Pruebas simples
  console.log(validateEmail("testn@mail.com")); // Debería imprimir true
  console.log(validateEmail("testn@gmail")); // Debería imprimir false
  console.log(validateEmail("testn@.com")); // Debería imprimir false