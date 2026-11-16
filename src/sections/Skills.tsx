import { motion, useReducedMotion, type Variants } from 'motion/react';
import Parallax from '../components/Parallax';
import SectionHeading from '../components/SectionHeading';
import { skillGroups, skillsSection } from '../content/skills';
import { DUR, EASE_OUT, PARALLAX, REDUCED_FADE, itemVariants } from '../lib/motion';

export default function Skills() {
  const reduced = useReducedMotion() ?? false;

  // The panel rises in, then the icons fade up 30 ms apart, row by row.
  const panel: Variants = reduced
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: REDUCED_FADE } } }
    : {
        hidden: { opacity: 0, y: 24 },
        shown: {
          opacity: 1,
          y: 0,
          transition: { duration: DUR.slow, ease: EASE_OUT, delayChildren: 0.15, staggerChildren: 0.03 },
        },
      };
  const icon = itemVariants(reduced, { blur: false, distance: 12 });

  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="container-page">
        <SectionHeading id="skills-title" eyebrow={skillsSection.eyebrow} title={skillsSection.title} />
        <Parallax shift={PARALLAX.content}>
          <motion.div
            className="glass skills-panel"
            variants={panel}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.15 }}
          >
            {skillGroups.map((group) => (
              <div key={group.label} className="skill-row">
                <h3 className="t-label text-text-3">{group.label}</h3>
                <ul className="skill-list">
                  {group.skills.map(({ name, icon: Icon }) => (
                    <motion.li key={name} className="skill" variants={icon}>
                      <Icon className="skill-icon" aria-hidden />
                      <span>{name}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </Parallax>
      </div>
    </section>
  );
}
