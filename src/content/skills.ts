import type { ComponentType } from 'react';
import { Database, FileSearch, FlaskConical, Gauge, Layers } from 'lucide-react';
import { FaAws } from 'react-icons/fa6';
import {
  SiCplusplus,
  SiDocker,
  SiFastapi,
  SiGit,
  SiGithubactions,
  SiGooglecloud,
  SiJavascript,
  SiKubernetes,
  SiLanggraph,
  SiMeta,
  SiMongodb,
  SiOpencv,
  SiPandas,
  SiPytest,
  SiPython,
  SiPytorch,
  SiQdrant,
  SiReact,
  SiScikitlearn,
  SiSqlite,
  SiTensorflow,
  SiTypescript,
  SiUltralytics,
} from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

export type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

export interface Skill {
  name: string;
  icon: IconComponent;
}

export interface SkillGroup {
  label: string;
  skills: Skill[];
}

export const skillsSection = {
  eyebrow: 'Skills',
  title: 'Toolkit',
};

// From the Technical Skills section of the résumé (public/resume.pdf).
// Skills with no brand mark use generic Lucide icons: SQL, RAG, LLM evals, monitoring, ChromaDB.
// FAISS is a Meta library, so it carries the Meta mark.
export const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    skills: [
      { name: 'Python', icon: SiPython },
      { name: 'SQL', icon: Database },
      { name: 'TypeScript', icon: SiTypescript },
      { name: 'JavaScript', icon: SiJavascript },
      { name: 'C++', icon: SiCplusplus },
    ],
  },
  {
    label: 'AI / ML',
    skills: [
      { name: 'PyTorch', icon: SiPytorch },
      { name: 'TensorFlow', icon: SiTensorflow },
      { name: 'scikit-learn', icon: SiScikitlearn },
      { name: 'LangGraph', icon: SiLanggraph },
      { name: 'RAG', icon: FileSearch },
      { name: 'LLM evals', icon: FlaskConical },
      { name: 'YOLOv11', icon: SiUltralytics },
      { name: 'OpenCV', icon: SiOpencv },
    ],
  },
  {
    label: 'MLOps and reliability',
    skills: [
      { name: 'GitHub Actions', icon: SiGithubactions },
      { name: 'Docker', icon: SiDocker },
      { name: 'Kubernetes', icon: SiKubernetes },
      { name: 'pytest', icon: SiPytest },
      { name: 'Monitoring', icon: Gauge },
      { name: 'Git', icon: SiGit },
    ],
  },
  {
    label: 'Cloud and backend',
    skills: [
      { name: 'AWS', icon: FaAws },
      { name: 'Azure', icon: VscAzure },
      { name: 'GCP', icon: SiGooglecloud },
      { name: 'FastAPI', icon: SiFastapi },
      { name: 'React', icon: SiReact },
    ],
  },
  {
    label: 'Data',
    skills: [
      { name: 'Qdrant', icon: SiQdrant },
      { name: 'ChromaDB', icon: Layers },
      { name: 'FAISS', icon: SiMeta },
      { name: 'SQLite', icon: SiSqlite },
      { name: 'MongoDB', icon: SiMongodb },
      { name: 'pandas', icon: SiPandas },
    ],
  },
];
