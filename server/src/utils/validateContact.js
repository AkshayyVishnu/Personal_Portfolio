function validateContact({ name, email, message }) {
  const errors = {};

  if (!name || !name.trim()) errors.name = 'Name is required.';
  if (!email || !email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!message || !message.trim()) errors.message = 'Message is required.';

  return errors;
}

module.exports = validateContact;
