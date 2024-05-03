export const validateForm = (data) => {
  const { email = null, orcid = null, phone = null, password = null, confirmPassword = null } = data; // Destructuring for cleaner access
  let errors = [];

  if (!email) {
    errors.push("El correo electrónico es obligatorio");
  } else if (!validateEmail(email)) {
    errors.push("El correo electrónico no es válido");
  }

  if (orcid && !validateORCID(orcid)) {
    errors.push("El ORCID ID no es válido");
  }

  if (phone && !validatePhone(phone)) {
    errors.push("El número de teléfono no es válido");
  }

  if (password) {
    if (!password.length) {
      errors.push("La contraseña es obligatoria");
    } else if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres");
    }
  }

  if (confirmPassword && password !== confirmPassword) {
    errors.push("Las contraseñas no coinciden");
  }

  return errors;
};

const validateEmail = (email) => {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const validateORCID = (orcid) => {
  const orcidPattern = /\b\d{4}-\d{4}-\d{4}-\d{4}\b/;
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
