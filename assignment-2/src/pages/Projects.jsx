import { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { API_BASE_URL } from '../config';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Could not load projects. Is the backend server running?');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section id="projects">
        <h1>Projects</h1>
        <p>Loading projects…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects">
        <h1>Projects</h1>
        <p className="error" role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section id="projects">
      <h1>Projects</h1>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </section>
  );
}

export default Projects;
