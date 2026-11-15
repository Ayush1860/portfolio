export interface Project {
  category: string;
  title: string;
  outcome: string; // one line
  tech: string[]; // 3–4 tags
  url: string | null; // null = repo link still to come
}

export const projectsSection = {
  eyebrow: 'Projects',
  title: 'Selected work',
  linkLabel: 'View code',
  missingLabel: 'Repo link coming soon',
};

// TODO: placeholder set — confirm the final five, their outcomes and tags.
export const projects: Project[] = [
  {
    category: 'Computer vision',
    title: 'Indian LPR System',
    outcome: 'Detects and reads Indian licence plates from traffic footage.',
    tech: ['YOLOv11', 'PaddleOCR', 'OpenCV'],
    url: 'https://github.com/Ayush1860/L-P-R',
  },
  {
    category: 'Reinforcement learning',
    title: 'Traffic Signal Optimization',
    outcome: 'Adaptive signal timing learned with deep Q-networks.',
    tech: ['DQN', 'Transformer', 'PyTorch'],
    url: null, // TODO: GitHub URL
  },
  {
    category: 'Forecasting',
    title: 'Commodity Price Prediction',
    outcome: 'Gradient-boosted price forecasts with tuned hyperparameters.',
    tech: ['XGBoost', 'Optuna', 'Python'],
    url: 'https://github.com/Ayush1860/Commodity-PP',
  },
  {
    category: 'Generative AI',
    title: 'NL-to-SQL Query Assistant',
    outcome: 'Ask a database questions in plain English and get SQL back.', // TODO: confirm
    tech: ['LLM', 'SQL', 'Python'], // TODO: confirm tags
    url: null, // TODO: GitHub URL
  },
  {
    category: 'Platform',
    title: 'Sahayak Setu',
    outcome: 'One-line outcome to come.', // TODO: outcome
    tech: ['TODO'], // TODO: tags
    url: 'https://github.com/Ayush1860/Sahayak-Setu',
  },
];
