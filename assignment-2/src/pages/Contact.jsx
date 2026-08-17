import ContactForm from '../components/ContactForm';

function Contact() {
  return (
    <section id="contact">
      <h1>Contact</h1>
      <p>
        Reach me at <a href="mailto:akshayrkr22@gmail.com">akshayrkr22@gmail.com</a>.
      </p>

      <ul className="social-list">
        <li><a href="https://github.com/AkshayyVishnu">GitHub</a></li>
        <li><a href="https://www.linkedin.com/in/akshay-vishnu-b2887b295/">LinkedIn</a></li>
      </ul>

      <h2>Send a message</h2>
      <ContactForm />
    </section>
  );
}

export default Contact;
