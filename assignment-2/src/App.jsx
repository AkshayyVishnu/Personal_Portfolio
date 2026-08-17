import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';

function App() {
  // read back on initial load — runs once, before the first render
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // re-runs whenever theme changes: paints the document and persists the choice
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </ThemeContext.Provider>
  );
}

export default App;
