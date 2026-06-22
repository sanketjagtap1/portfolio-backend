export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface Skill {
  name: string;
  level: number; // 1-100 percentage
  category: 'frontend' | 'backend' | 'database' | 'cloud' | 'tools';
  icon?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  technologies: string[];
  features: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  status: 'completed' | 'in-progress' | 'planned';
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface PortfolioData {
  contact: ContactInfo;
  summary: string;
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
}
