import { PortfolioData, ContactInfo, Skill, Experience, Project, Education } from '../types/portfolio';

export const portfolioData: PortfolioData = {
  contact: {
    name: 'Sanket Jagtap',
    email: 'sanketjagtap479@gmail.com',
    phone: '8806328987',
    location: 'Pune, India',
    linkedin: 'linkedin.com/in/sanket-jagtap'
  },
  summary: `Full Stack Developer with 4+ years of experience designing, developing, and deploying scalable web and mobile applications using Angular, Node.js, Flutter, and AWS. Skilled in microservices architecture, CI/CD pipelines, WebSocket-based real-time systems, and Redis caching. Proven track record of delivering end-to-end projects with significant performance improvements and operational optimizations.`,
  skills: [
    // Frontend
    { name: 'Angular', level: 95, category: 'frontend', icon: 'angular' },
    { name: 'TypeScript', level: 90, category: 'frontend', icon: 'typescript' },
    { name: 'JavaScript (ES6+)', level: 90, category: 'frontend', icon: 'javascript' },
    { name: 'HTML5', level: 95, category: 'frontend', icon: 'html5' },
    { name: 'CSS3', level: 90, category: 'frontend', icon: 'css3' },
    { name: 'Bootstrap', level: 85, category: 'frontend', icon: 'bootstrap' },
    { name: 'Material UI', level: 85, category: 'frontend', icon: 'material-ui' },
    { name: 'RxJS', level: 80, category: 'frontend', icon: 'rxjs' },
    { name: 'Ionic', level: 75, category: 'frontend', icon: 'ionic' },
    
    // Backend
    { name: 'Node.js', level: 90, category: 'backend', icon: 'nodejs' },
    { name: 'Express.js', level: 90, category: 'backend', icon: 'express' },
    { name: 'NestJS', level: 75, category: 'backend', icon: 'nestjs' },
    { name: 'WebSockets', level: 80, category: 'backend', icon: 'websocket' },
    { name: 'REST APIs', level: 90, category: 'backend', icon: 'api' },
    { name: 'Swagger', level: 75, category: 'backend', icon: 'swagger' },
    
    // Database
    { name: 'PostgreSQL', level: 85, category: 'database', icon: 'postgresql' },
    { name: 'MySQL', level: 85, category: 'database', icon: 'mysql' },
    { name: 'MongoDB', level: 80, category: 'database', icon: 'mongodb' },
    { name: 'Redis', level: 75, category: 'database', icon: 'redis' },
    { name: 'Prisma', level: 70, category: 'database', icon: 'prisma' },
    { name: 'Sequelize', level: 70, category: 'database', icon: 'sequelize' },
    
    // Cloud & DevOps
    { name: 'AWS', level: 80, category: 'cloud', icon: 'aws' },
    { name: 'Docker', level: 75, category: 'cloud', icon: 'docker' },
    { name: 'GitHub Actions', level: 80, category: 'cloud', icon: 'github' },
    { name: 'Nginx', level: 70, category: 'cloud', icon: 'nginx' },
    { name: 'PM2', level: 75, category: 'cloud', icon: 'pm2' },
    
    // Tools
    { name: 'Git', level: 90, category: 'tools', icon: 'git' },
    { name: 'Postman', level: 85, category: 'tools', icon: 'postman' },
    { name: 'Jest', level: 75, category: 'tools', icon: 'jest' },
    { name: 'SonarQube', level: 70, category: 'tools', icon: 'sonarqube' }
  ],
  experience: [
    {
      id: 'pegasus-2024',
      title: 'Senior Software Engineer',
      company: 'Pegasus InfoCorp',
      location: 'Mumbai, India',
      startDate: '2024-09',
      endDate: '',
      current: true,
      description: 'Spearheading development of scalable web and mobile modules using Node.js, Express.js, and Angular.',
      achievements: [
        'Improved response times and UI performance through optimized development practices',
        'Designed and integrated RESTful APIs for loan and insurance workflows with external partners (KreditBee and Motilal Oswal)',
        'Engineered mobile features using Ionic + Angular for consistent cross-platform user experience',
        'Optimized MySQL schemas and queries for faster transaction handling and reduced database load',
        'Ensured high code quality through SonarQube compliance, unit testing, and peer reviews',
        'Collaborated in Agile sprints with daily stand-ups, backlog grooming, and sprint retrospectives'
      ],
      technologies: ['Angular', 'Node.js', 'Express.js', 'Ionic', 'MySQL', 'REST APIs', 'SonarQube']
    },
    {
      id: 'bajaj-2022',
      title: 'Assistant Manager IT',
      company: 'Bajaj Housing Finance Ltd (BASSL)',
      location: 'Pune, India',
      startDate: '2022-10',
      endDate: '2024-09',
      current: false,
      description: 'Led end-to-end development of enterprise-grade Retention Portal using Angular, Node.js, and PostgreSQL.',
      achievements: [
        'Built and deployed microservices architecture on AWS EC2, configured Nginx and PM2 for performance and availability',
        'Automated loan service request processes, reducing retention processing time from 2 weeks to 2 days',
        'Interfaced with business stakeholders to analyze use cases and translate them into scalable backend workflows',
        'Supervised a team of 4 developers — conducted code reviews and set delivery timelines',
        'Handled VAPT (Vulnerability Assessment and Penetration Testing) fixes to maintain compliance and security standards',
        'Led UAT discussions with QA team and proactively resolved post-release issues and deployment bugs'
      ],
      technologies: ['Angular', 'Node.js', 'PostgreSQL', 'AWS', 'Nginx', 'PM2', 'Microservices']
    },
    {
      id: 'televed-2021',
      title: 'Software Engineer',
      company: 'Televed Systems Pvt Ltd',
      location: 'Pune, India',
      startDate: '2021-11',
      endDate: '2022-10',
      current: false,
      description: 'Developed modules for healthcare product platform using Angular, Node.js, and MongoDB.',
      achievements: [
        'Created scalable and reusable REST APIs supporting patient records, appointment scheduling, and doctor dashboards',
        'Built responsive, user-centric interfaces using Material UI and optimized client-side performance',
        'Implemented role-based access control (RBAC), form validation, and dynamic dashboards for doctors and admins',
        'Tuned MongoDB queries and indexing for faster retrieval of large patient datasets',
        'Participated in requirement discussions with product managers and delivered sprint-ready solutions',
        'Managed QA handoffs and collaborated closely for regression testing and bug resolution'
      ],
      technologies: ['Angular', 'Node.js', 'MongoDB', 'Material UI', 'RBAC', 'REST APIs']
    }
  ],
  projects: [
    {
      id: 'algo-etf',
      name: 'AlgoETF - Automated Trading Platform',
      description: 'Real-time automated trading platform with multi-broker integration for maximizing trading profits.',
      longDescription: 'Designed and developed a comprehensive automated trading platform that integrates with multiple brokers to execute trades based on market conditions and predefined algorithms. The platform features real-time data streaming, intelligent order execution, and comprehensive monitoring dashboards.',
      technologies: ['Angular', 'Node.js', 'Express.js', 'Redis', 'WebSockets', 'MySQL', 'AWS', 'GitHub Actions'],
      features: [
        'Real-time market data streaming using WebSockets',
        'Multi-broker integration for order execution',
        'Redis Pub/Sub architecture for low-latency communication',
        'Fault-tolerant microservices backend',
        'Interactive monitoring dashboards',
        'Automated CI/CD pipelines',
        'Performance metrics and KPI visualization'
      ],
      startDate: '2025-06',
      endDate: '2025-09',
      status: 'completed',
      githubUrl: 'https://github.com/sanketjagtap/algo-etf',
      imageUrl: '/assets/images/algo-etf.png'
    }
  ],
  education: [
    {
      degree: 'Masters In Computer Science',
      institution: 'Savitribai Phule Pune University',
      location: 'Pune, India',
      startDate: '2020-06',
      endDate: '2022-03'
    },
    {
      degree: 'Bachelor\'s In Computer Science',
      institution: 'Savitribai Phule Pune University',
      location: 'Pune, India',
      startDate: '2017-06',
      endDate: '2020-03'
    }
  ]
};
