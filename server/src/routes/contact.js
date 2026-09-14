const express = require('express');
const validateContact = require('../utils/validateContact');
const { readContacts, addContact } = require('../utils/contactsStore');

const router = express.Router();

router.post('/', (req, res) => {
  const { name = '', email = '', message = '' } = req.body || {};
  const errors = validateContact({ name, email, message });

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const submission = addContact({ name, email, message });
  res.status(201).json({
    message: 'Thanks - your message has been recorded.',
    submission,
  });
});

router.get('/', (req, res) => {
  res.status(200).json(readContacts());
});

module.exports = router;
