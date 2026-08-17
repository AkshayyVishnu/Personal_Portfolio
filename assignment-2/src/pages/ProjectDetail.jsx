import { Link, useParams } from 'react-router-dom';
import { projects } from '../data/projects';
import TechStack from '../components/TechStack';
import NotFound from './NotFound';

function ProjectDetail() {
  const { projectId } = useParams();
  const project = projects.find((item) => item.id === projectId);

  if (!project) return <NotFound />;

  return (
    <section id="project-detail">
      <h1>{project.title}</h1>
      <img className="card-icon" src={project.image} width="64" height="64" alt={project.alt} />

      <TechStack items={project.tech} />
      <p><strong>Duration:</strong> {project.duration}</p>

      {project.details.map((point) => <p key={point}>{point}</p>)}

      <p className="card-links">
        <a href={project.link}>View on GitHub</a>
        <Link to="/projects">Back to all projects</Link>
      </p>
    </section>
  );
}

export default ProjectDetail;
