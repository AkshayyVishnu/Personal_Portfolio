import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import heroPhoto from '../assets/header_photo.avif';

function Home() {
  const [loading, setLoading] = useState(true);

  // runs once on mount; cleanup cancels the timer if the user navigates away first
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <p className="loading" role="status">Loading portfolio…</p>;
  }

  return (
    <section id="intro">
      <figure className="hero">
        <img className="hero-img" src={heroPhoto} alt="Akshay Vishnu" />
        <figcaption className="hero-quote">He who has a why can bear any how</figcaption>
      </figure>

      <div className="intro-text">
        <h1>Akshay Vishnu</h1>
        <p className="tagline">
          Computer Science undergraduate at NIT Warangal, working on retrieval systems and applied
          machine learning.
        </p>
        <ul className="cta-row">
          <li><Link className="btn" to="/projects">View Projects</Link></li>
          <li><Link className="btn" to="/contact">Get in Touch</Link></li>
        </ul>
      </div>
    </section>
  );
}

export default Home;
