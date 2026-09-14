import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <p>Akshay Vishnu</p>
      <p><Link to="/home">Back to Home</Link></p>
    </footer>
  );
}

export default Footer;
