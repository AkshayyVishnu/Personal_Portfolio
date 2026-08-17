import { NavLink } from 'react-router-dom';

const links = [
  { to: '/home', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

function Navbar() {
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

      <div className="header-actions" />
    </header>
  );
}

export default Navbar;
