import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section id="not-found">
      <h1>404 - Page not found</h1>
      <p>That page does not exist on this site.</p>
      <p><Link className="btn" to="/home">Back to Home</Link></p>
    </section>
  );
}

export default NotFound;
