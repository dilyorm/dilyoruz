export const personalInfo = {
  name: "Muhammadjonov Dilyorbek",
  nickname: "Kyosan",
  role: "AI & ML Developer",
  location: "Tashkent",
  tagline: "I build intelligent systems in computer vision, NLP, and machine learning — from Uzbek speech recognition to retrieval-augmented customer support.",
  email: "d.muhammadjonov@newuu.uz",
  displayEmail: "dilyoruz@dilyoruz",
  telegram: "t.me/dilyor_m",
  linkedin: "linkedin.com/in/dilyor",
};

export const about = {
  description: "I'm an AI & ML developer studying AI and Robotics at New Uzbekistan University. I enjoy turning research ideas into practical systems — from speech recognition in Uzbek to intelligent agents that understand and summarize conversations.",
  education: [
    {
      institution: "New Uzbekistan University",
      degree: "Bachelor of AI and Robotics",
      period: "2024 - Present"
    },
    {
      institution: "Samarkand Presidential School",
      degree: "High School",
      period: "2021 - 2024"
    }
  ]
};

export const experience = [
  {
    company: "SATashkent",
    role: "AI & ML Developer",
    period: "May 2025 – Present",
    description: [
      "Implemented a system to identify similar questions using embeddings and vector search.",
      "Developed a customer support agent using RAG models with a website knowledge base."
    ]
  },
  {
    company: "Mutolaa",
    role: "AI & ML Developer",
    period: "October 2024 – December 2024",
    description: [
      "Implemented an automation system for training data of an Uzbek TTS model using Fairseq, Pydub, PyTorch, and supporting tools."
    ]
  }
];

export const projects = [
  {
    title: "BIL – Uzbek Speech Intelligence Layer",
    description: "Built using Google's Uzbek LLM to recognize Uzbek speech. Uses LLM to transcribe conversations and NLP to extract key points. Summarization algorithm converts conversations into actionable insights. Multi-platform support and sync.",
    tags: ["LLM", "Speech Recognition", "NLP", "Summarization"]
  },
  {
    title: "Credit Scoring – Loan Default Prediction",
    description: "Ensemble-based credit scoring pipeline for predicting loan defaults, built for the CBU Coding Challenge. Uses multiple feature sets and stacked models (LightGBM, XGBoost, CatBoost, MLP, TabM) to achieve robust performance.",
    tags: ["Machine Learning", "Tabular Data", "Ensemble", "Python"],
    link: "https://github.com/dilyorm/cbu-coding-datavision"
  },
  {
    title: "ACAR – Anti-Corruption Analytics & Reporting",
    description: "Anti-corruption analytics project that uses data-driven methods to surface anomalies and support transparency and accountability in organizational processes.",
    tags: ["Data Science", "Analytics", "Anti-corruption", "Python"],
    link: "https://github.com/azxav/ACAR"
  }
];

export const skills = {
  core: ["Python", "C++", "SQL", "OpenCV", "TensorFlow", "PyTorch", "Numpy", "Pandas"],
  languages: [
    { name: "English", level: "Fluent" },
    { name: "Russian", level: "Fluent" },
    { name: "Uzbek", level: "Native" }
  ]
};

export const achievements = [
  {
    title: "Urban.Tech Hackathon",
    subtitle: "1st place (Industry Tech)",
    description: "Project: CCTV analysis for productivity and activity feedback.",
    icon: "🏆"
  },
  {
    title: "ICPC",
    subtitle: "Semifinalist",
    description: "Team 'FemSezuko' — 12th in Uzbekistan, advanced to Kazakhstan semifinals.",
    icon: "💻"
  },
  {
    title: "CBU Coding Challenge",
    subtitle: "3rd place – Credit Scoring",
    description: "Third place at the CBU Coding Challenge with a loan default credit score prediction model powering risk-aware lending decisions.",
    icon: "📊"
  }
];

export const certifications = [
  {
    name: "Advanced Computer Vision with Python",
    provider: "FreeCodeCamp"
  },
  {
    name: "Data Analysis with Python",
    provider: "FreeCodeCamp"
  },
  {
    name: "Machine Learning Engineer Nanodegree",
    provider: "Udacity"
  },
  {
    name: "Probability Theory",
    provider: "Stepik"
  }
];

