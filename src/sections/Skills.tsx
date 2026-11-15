import SectionHeading from '../components/SectionHeading';
import { skillGroups, skillsSection } from '../content/skills';

export default function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="container-page">
        <SectionHeading id="skills-title" eyebrow={skillsSection.eyebrow} title={skillsSection.title} />
        <div className="glass skills-panel">
          {skillGroups.map((group) => (
            <div key={group.label} className="skill-row">
              <h3 className="t-label text-text-3">{group.label}</h3>
              <ul className="skill-list">
                {group.skills.map(({ name, icon: Icon }) => (
                  <li key={name} className="skill">
                    <Icon className="skill-icon" aria-hidden />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
