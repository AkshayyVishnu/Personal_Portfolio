import { useContext, useEffect, useState } from 'react';
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

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  // subscribes to window resize; the cleanup removes the listener on unmount
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showLinks = !isMobile || menuOpen;

  return (
    <header className="site-header">
      <p className="brand">Akshay Vishnu</p>

      <nav id="primary-nav" aria-label="Primary" hidden={!showLinks}>
        <ul className="nav-list">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header-actions">
        {isMobile && (
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        )}
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
