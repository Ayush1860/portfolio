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

// The first three are the projects on the résumé (public/resume.pdf).
export const projects: Project[] = [
  {
    category: 'Generative AI',
    title: 'SecureRAG',
    outcome: 'Zero-leak hybrid-search RAG on AWS Lambda: 70 ms p95 retrieval over 156k chunks.',
    tech: ['FastAPI', 'Qdrant', 'AWS Lambda', 'GitHub Actions'],
    url: 'https://github.com/Ayush1860/SecureRag',
  },
  {
    category: 'AI agents',
    title: 'AgentGate',
    outcome: 'Multi-agent LLM code reviewer that gates pull requests in CI, at $0.0016 per review.',
    tech: ['LangGraph', 'FastAPI', 'Docker', 'GitHub Actions'],
    url: 'https://github.com/Ayush1860/Agent-Gate',
  },
  {
    category: 'Computer vision',
    title: 'Indian License Plate Recognition',
    outcome: 'Real-time vehicle tracking and plate reading, with a searchable log and blacklist alerts.',
    tech: ['YOLOv11', 'PaddleOCR', 'OpenCV', 'Streamlit'],
    url: 'https://github.com/Ayush1860/L-P-R',
  },
  {
    category: 'Forecasting',
    title: 'Commodity Price Prediction',
    outcome: 'Gradient-boosted price forecasts with tuned hyperparameters.',
    tech: ['XGBoost', 'Optuna', 'Python'],
    url: 'https://github.com/Ayush1860/Commodity-PP',
  },
  {
    category: 'Platform',
    title: 'Sahayak Setu',
    outcome: 'One-line outcome to come.', // TODO: outcome
    tech: ['TODO'], // TODO: tags
    url: 'https://github.com/Ayush1860/Sahayak-Setu',
  },
];
