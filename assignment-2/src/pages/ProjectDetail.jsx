import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TechStack from '../components/TechStack';
import { API_BASE_URL } from '../config';

function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProject() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
          signal: controller.signal,
        });
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        const data = await response.json();
        setProject(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Could not load this project. Is the backend server running?');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProject();
    return () => controller.abort();
  }, [projectId]);

  if (loading) {
    return (
      <section id="project-detail">
        <p>Loading project…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="project-detail">
        <p className="error" role="alert">{error}</p>
      </section>
    );
  }

  if (notFound || !project) {
    return (
      <section id="project-detail">
        <h1>Project not found</h1>
        <p>No project matches "{projectId}".</p>
        <p><Link className="btn" to="/projects">Back to all projects</Link></p>
      </section>
    );
  }

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
