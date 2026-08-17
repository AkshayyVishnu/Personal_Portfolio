import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

const links = [
  { to: '/home', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  const next = theme === 'light' ? 'dark' : 'light';

  return (
    <header className="site-header">
      <p className="brand">Akshay Vishnu</p>

      <nav id="primary-nav" aria-label="Primary">
        <ul className="nav-list">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setTheme(next)}
          aria-label={`Switch to ${next} theme`}
        >
          {next === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
