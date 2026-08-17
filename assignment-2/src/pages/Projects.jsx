import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';

function Projects() {
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
