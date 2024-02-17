

const validateEmail = (email) => {
  // Simple email validation pattern
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateDeliveryAddress = (address) => {
  // Assuming a basic validation for non-empty string; adjust as necessary
  return address.trim() !== '';
};

const validateDeliveryDate = (date) => {
  // Check if date is in the future
  const today = new Date();
  const deliveryDate = new Date(date);
  return deliveryDate >= today;
};

const validateCreditCardNumber = (number) => {
  // Luhn Algorithm or simply check for 16 digits for simplicity
  return /^\d{16}$/.test(number);
};

const validateExpirationDate = (expiration) => {
  // MM/YY format
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiration);
};

const validateCVV = (cvv) => {
  // 3 or 4 digits
  return /^\d{3,4}$/.test(cvv);
};

const validateQuantity = (quantity) => {
  // Ensure quantity is a number greater than 0
  const num = Number(quantity);
  return !isNaN(num) && num > 0;
};
