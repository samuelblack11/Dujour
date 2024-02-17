

export const validateEmail = (email) => {
  // Simple email validation pattern
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateDeliveryAddress = (address) => {
  // This is a very basic format check that looks for patterns common in addresses:
  // "123 Main St, City, ST 12345" or "123 Main St, City Name, ST"
  // It checks for a number (street number) followed by text (street name),
  // then a comma, then more text (city), another comma, and then state abbreviation and optional zip code.
  // This is a simplistic and US-centric pattern and should be adjusted according to your specific needs.
  const regex = /^\d+\s[A-z]+\s[A-z]+,\s[A-z]+,\s[A-Z]{2}\s*\d*$/;
  return regex.test(address.trim());
};


export const validateDeliveryDate = (dateString) => {
  // Parse the input date string to a Date object
  const deliveryDate = new Date(dateString);

  // Check if the parsed date is valid
  if (isNaN(deliveryDate.getTime())) {
    console.log("Invalid date format.");
    return false; // Invalid date format
  }

  // Ensure the delivery date is not in the past
  const today = new Date();
  if (deliveryDate < today) {
    console.log("Delivery date cannot be in the past.");
    return false; // Delivery date is in the past
  }

  // Check if the year is within a realistic range (e.g., 1900 to 2100)
  const year = deliveryDate.getFullYear();
  if (year < 1900 || year > 2100) {
    console.log("Year out of realistic range.");
    return false; // Year is out of range
  }

  // If all checks pass, the delivery date is considered valid
  return true;
};

export const validateCreditCardNumber = (number) => {
  // Allow spaces or dashes between number groups, accept 13 to 19 digits
  const sanitizedNumber = number.replace(/[\s-]/g, ''); // Remove spaces and dashes
  return /^\d{13,19}$/.test(sanitizedNumber);
};

export const validateCreditCardExpiration = (expiration) => {
  // Allow "MMYY" or "MM/YY" format
  return /^(0[1-9]|1[0-2])(\/)?\d{2}$/.test(expiration);
};

export const validateCVV = (cvv) => {
  // 3 or 4 digits
  return /^\d{3,4}$/.test(cvv);
};

export const validateItemQuantities = (cartItems) => {
  // Check if every item in the cart has a valid quantity (positive integer)
  return cartItems.every(item => Number.isInteger(item.quantity) && item.quantity > 0);
};

