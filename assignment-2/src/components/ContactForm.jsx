import { useState } from 'react';

const EMPTY = { name: '', email: '', message: '' };

function validate({ name, email, message }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required.';
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!message.trim()) errors.message = 'Message is required.';
  return errors;
}

function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setSent(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setForm(EMPTY);
    setSent(true);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <p>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
      </p>

      <p>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          aria-invalid={Boolean(form.email && errors.email)}
          aria-describedby={form.email && errors.email ? 'email-error' : undefined}
        />
        {form.email && errors.email && (
          <span className="error" id="email-error">{errors.email}</span>
        )}
      </p>

      <p>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="4" value={form.message} onChange={handleChange} />
      </p>

      <p>
        <button type="submit" className="btn" disabled={!isValid}>Send</button>
        {!isValid && <span className="form-hint">Fill in every field to enable Send.</span>}
        {sent && <span className="sent" role="status">Thanks — your message has been recorded.</span>}
      </p>
    </form>
  );
}

export default ContactForm;
