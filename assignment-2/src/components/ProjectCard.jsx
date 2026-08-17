import { useState } from 'react';
import { Link } from 'react-router-dom';
import TechStack from './TechStack';

function ProjectCard({ id, title, image, alt, duration, link, tech, description, details }) {
  // scoped per instance: each card owns its own copy of this state
  const [open, setOpen] = useState(false);

  return (
    <article className="project-card">
      <img className="card-icon" src={image} width="64" height="64" alt={alt} />
      <h3>{title}</h3>

      <TechStack items={tech} />
      <p><strong>Duration:</strong> {duration}</p>
      <p>{description}</p>

      <button
        type="button"
        className="btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? 'Hide details' : 'View details'}
      </button>

      {open && details.map((point) => <p key={point}>{point}</p>)}

      <p className="card-links">
        <Link to={`/projects/${id}`}>Full page</Link>
        <a href={link}>GitHub</a>
      </p>
    </article>
  );
}

export default ProjectCard;
