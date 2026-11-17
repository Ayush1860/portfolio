import { Mail } from 'lucide-react';
import { FaAws, FaLinkedinIn } from 'react-icons/fa6';
import { SiGithub, SiInstagram } from 'react-icons/si';
import type { IconComponent } from './skills';

export interface ProfileLink {
  id: 'linkedin' | 'aws' | 'instagram' | 'github' | 'email';
  label: string;
  handle: string | null; // null = still to come
  url: string | null; // null = still to come
  icon: IconComponent;
}

export const linksSection = {
  eyebrow: 'Links',
  title: 'Let’s build something.',
  missingLabel: 'Coming soon',
};

export const links: ProfileLink[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'in/ayush-suryawanshi-45234a246',
    url: 'https://linkedin.com/in/ayush-suryawanshi-45234a246',
    icon: FaLinkedinIn,
  },
  {
    id: 'aws',
    label: 'AWS Builder Center',
    handle: '@ayush1806',
    url: 'https://builder.aws.com/community/@ayush1806',
    icon: FaAws,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@ayush._186',
    url: 'https://www.instagram.com/ayush._186',
    icon: SiInstagram,
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: '@Ayush1860',
    url: 'https://github.com/Ayush1860',
    icon: SiGithub,
  },
  {
    id: 'email',
    label: 'Email',
    handle: 'ayushsuryawanshi9@gmail.com',
    url: 'mailto:ayushsuryawanshi9@gmail.com',
    icon: Mail,
  },
];
