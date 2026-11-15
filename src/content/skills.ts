import type { ComponentType } from 'react';
import { Database, ScanEye } from 'lucide-react';
import { FaAws } from 'react-icons/fa6';
import {
  SiCplusplus,
  SiDocker,
  SiFastapi,
  SiGooglecloud,
  SiJavascript,
  SiKubernetes,
  SiOpencv,
  SiPython,
  SiPytorch,
  SiReact,
  SiTensorflow,
} from 'react-icons/si';

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

// TODO: confirm the final skills list.
// SQL and YOLO have no brand mark, so they use generic Lucide icons.
export const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    skills: [
      { name: 'Python', icon: SiPython },
      { name: 'C++', icon: SiCplusplus },
      { name: 'JavaScript', icon: SiJavascript },
      { name: 'SQL', icon: Database },
    ],
  },
  {
    label: 'ML and CV',
    skills: [
      { name: 'PyTorch', icon: SiPytorch },
      { name: 'TensorFlow', icon: SiTensorflow },
      { name: 'YOLO', icon: ScanEye },
      { name: 'OpenCV', icon: SiOpencv },
    ],
  },
  {
    label: 'Web',
    skills: [
      { name: 'React', icon: SiReact },
      { name: 'FastAPI', icon: SiFastapi },
    ],
  },
  {
    label: 'Cloud and DevOps',
    skills: [
      { name: 'AWS', icon: FaAws },
      { name: 'GCP', icon: SiGooglecloud },
      { name: 'Docker', icon: SiDocker },
      { name: 'Kubernetes', icon: SiKubernetes },
    ],
  },
];
