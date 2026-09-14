import { useState } from 'react';
import { API_BASE_URL } from '../config';

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
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setSent(false);
    setServerErrors({});
    setSubmitError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setServerErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setServerErrors(data.errors || {});
        setSubmitError('Please fix the highlighted fields and try again.');
        return;
      }

      setForm(EMPTY);
      setSent(true);
    } catch {
      setSubmitError('Could not reach the server. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <p>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
        {serverErrors.name && <span className="error">{serverErrors.name}</span>}
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
        {serverErrors.email && <span className="error">{serverErrors.email}</span>}
      </p>

      <p>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="4" value={form.message} onChange={handleChange} />
        {serverErrors.message && <span className="error">{serverErrors.message}</span>}
      </p>

      <p>
        <button type="submit" className="btn" disabled={!isValid || submitting}>
          {submitting ? 'Sending…' : 'Send'}
        </button>
        {!isValid && <span className="form-hint">Fill in every field to enable Send.</span>}
        {submitError && <span className="error" role="alert">{submitError}</span>}
        {sent && <span className="sent" role="status">Thanks — your message has been recorded.</span>}
      </p>
    </form>
  );
}

export default ContactForm;
