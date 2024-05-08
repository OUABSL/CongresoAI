export const validateForm = (email, orcid , phone, password, confirmPassword) => {
  let errors = [];

  console.log("Validar: ", email, orcid, phone, password, confirmPassword);


  if (email && !validateEmail(email)) {
    errors.push("El correo electrónico no es válido");
  }

  if (orcid && !validateORCID(orcid)) {
    errors.push("El ORCID ID no es válido");
  }

  if (phone && !validatePhone(phone)) {
    errors.push("El número de teléfono no es válido");
  }


  if (password && password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }

  if (confirmPassword && password !== confirmPassword) {
    errors.push("Las contraseñas no coinciden");
  }

  return errors;
};

const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const validateORCID = (orcid) => {
  const orcidPattern = /^.{4}-.{4}-.{4}-.{4}$/;
  return orcidPattern.test(orcid);
};


const validatePhone = (phone) => {
  const phonePattern = /^[0-9]{9,}$/;
  if (phone) {
    let digitsOnly = phone.replace(/\D/g, '');
    return phonePattern.test(digitsOnly);
  } else {
    return false;
  }
};
