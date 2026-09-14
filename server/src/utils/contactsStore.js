const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SERVER_ROOT = path.join(__dirname, '..', '..');
const CONTACTS_FILE = path.resolve(SERVER_ROOT, process.env.CONTACTS_FILE || 'data/contacts.json');

function readContacts() {
  if (!fs.existsSync(CONTACTS_FILE)) return [];
  const raw = fs.readFileSync(CONTACTS_FILE, 'utf-8');
  if (!raw.trim()) return [];
  return JSON.parse(raw);
}

function writeContacts(contacts) {
  fs.mkdirSync(path.dirname(CONTACTS_FILE), { recursive: true });
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
}

function addContact({ name, email, message }) {
  const contacts = readContacts();
  const submission = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    submittedAt: new Date().toISOString(),
  };
  contacts.push(submission);
  writeContacts(contacts);
  return submission;
}

module.exports = { readContacts, writeContacts, addContact, CONTACTS_FILE };
