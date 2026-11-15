import { ArrowUpRight } from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import GlassCard from '../components/GlassCard';
import { RevealGroup } from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { projects, projectsSection, type Project } from '../content/projects';

function ProjectCard({ project }: { project: Project }) {
  return (
    <GlassCard href={project.url} className="project-card">
      <p className="t-label text-text-3">{project.category}</p>
      <h3 className="t-card">{project.title}</h3>
      <p className="card-copy text-text-2">{project.outcome}</p>
      <ul className="chips" aria-label="Tech">
        {project.tech.map((tag) => (
          <li key={tag} className="chip">
            {tag}
          </li>
        ))}
      </ul>
      {project.url ? (
        <p className="card-foot">
          <SiGithub className="card-foot-icon" aria-hidden />
          {projectsSection.linkLabel}
          <ArrowUpRight className="arrow" aria-hidden />
        </p>
      ) : (
        <p className="card-foot card-foot-muted">
          <SiGithub className="card-foot-icon" aria-hidden />
          {projectsSection.missingLabel}
        </p>
      )}
    </GlassCard>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="container-page">
        <SectionHeading
          id="projects-title"
          eyebrow={projectsSection.eyebrow}
          title={projectsSection.title}
        />
        <RevealGroup as="ul" className="project-grid">
          {projects.map((project) => (
            <li key={project.title}>
              <ProjectCard project={project} />
            </li>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
