export const isValidEmail = (email) => {
  // Expressão regular (Regex) padrão para validar e-mails
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};