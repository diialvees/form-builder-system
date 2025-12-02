const cleanDigits = (value) => {
  return value.replace(/\D/g, "");
};

export const maskPhone = (value) => {
  let numbers = cleanDigits(value);
  
  // Limita a 11 dígitos
  if (numbers.length > 11) numbers = numbers.slice(0, 11);

  // Aplica a máscara progressivamente
  numbers = numbers.replace(/^(\d{2})/, "($1) ");
  
  // (99) 99999-9999 (Celular)
  if (numbers.length > 14) { // Contando com os caracteres da máscara
     numbers = numbers.replace(/(\d{5})(\d)/, "$1-$2");
  } else {

     numbers = numbers.replace(/(\d{4})(\d)/, "$1-$2");
  }
  
  return numbers;
};

export const maskCPF = (value) => {
  let numbers = cleanDigits(value);
  
  // Limita a 11 dígitos
  if (numbers.length > 11) numbers = numbers.slice(0, 11);

  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2") // 111.222
    .replace(/(\d{3})(\d)/, "$1.$2") // 111.222.333
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // 111.222.333-44
};

// pode adicionar outras aqui (CEP, CNPJ, Moeda...)