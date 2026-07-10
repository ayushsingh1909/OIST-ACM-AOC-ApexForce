import { PDFParse } from "pdf-parse";

// Comprehensive skill database mapping canonical names to search regexes
const SKILLS_DB = [
  { name: "React", pattern: /\breact(\.js)?\b/i },
  { name: "Node.js", pattern: /\bnode(\.js)?\b/i },
  { name: "Express", pattern: /\bexpress(\.js)?\b/i },
  { name: "MongoDB", pattern: /\bmongodb\b/i },
  { name: "JavaScript", pattern: /\b(javascript|js)\b/i },
  { name: "HTML", pattern: /\bhtml5?\b/i },
  { name: "CSS", pattern: /\bcss3?\b/i },
  { name: "Git", pattern: /\bgit\b/i },
  { name: "Docker", pattern: /\bdocker\b/i },
  { name: "REST APIs", pattern: /\brest(ful)?\s+api(s)?\b/i },
  { name: "SQL", pattern: /\bsql\b/i },
  { name: "TypeScript", pattern: /\b(typescript|ts)\b/i },
  { name: "Python", pattern: /\bpython\b/i },
  { name: "R", pattern: /\b[rR]\b/ }, // Avoid matching within words
  { name: "Machine Learning", pattern: /\bmachine\s+learning\b/i },
  { name: "Deep Learning", pattern: /\bdeep\s+learning\b/i },
  { name: "Pandas", pattern: /\bpandas\b/i },
  { name: "NumPy", pattern: /\bnumpy\b/i },
  { name: "Scikit-Learn", pattern: /\b(scikit-learn|sklearn)\b/i },
  { name: "TensorFlow", pattern: /\btensorflow\b/i },
  { name: "PyTorch", pattern: /\bpytorch\b/i },
  { name: "Statistics", pattern: /\b(statistics|stats)\b/i },
  { name: "Data Visualization", pattern: /\bdata\s+visuali[zs]ation\b/i },
  { name: "Kubernetes", pattern: /\b(kubernetes|k8s)\b/i },
  { name: "AWS", pattern: /\baws\b/i },
  { name: "CI/CD", pattern: /\bci\/?cd\b/i },
  { name: "Linux", pattern: /\blinux\b/i },
  { name: "Terraform", pattern: /\bterraform\b/i },
  { name: "Jenkins", pattern: /\bjenkins\b/i },
  { name: "Bash", pattern: /\bbash\b/i },
  { name: "Ansible", pattern: /\bansible\b/i },
  { name: "Monitoring", pattern: /\b(monitoring|prometheus|grafana)\b/i },
  { name: "Product Strategy", pattern: /\bproduct\s+strategy\b/i },
  { name: "Agile", pattern: /\bagile\b/i },
  { name: "Scrum", pattern: /\bscrum\b/i },
  { name: "Roadmap", pattern: /\broadmap\b/i },
  { name: "User Research", pattern: /\buser\s+research\b/i },
  { name: "Product Analytics", pattern: /\bproduct\s+analytics\b/i },
  { name: "Wireframing", pattern: /\bwirefram(ing|e)?\b/i },
  { name: "Stakeholder Management", pattern: /\bstakeholder\s+management\b/i },
  { name: "Java", pattern: /\bjava\b/i },
  { name: "Go", pattern: /\b(golang|go)\b/i },
  { name: "Swift", pattern: /\bswift\b/i },
  { name: "Kotlin", pattern: /\bkotlin\b/i },
  { name: "Flutter", pattern: /\bflutter\b/i },
  { name: "React Native", pattern: /\breact\s+native\b/i },
  { name: "Redux", pattern: /\bredux\b/i },
  { name: "Sass", pattern: /\bsass\b/i },
  { name: "TailwindCSS", pattern: /\btailwind(css)?\b/i },
  { name: "Webpack", pattern: /\bwebpack\b/i },
  { name: "Vite", pattern: /\bvite\b/i },
  { name: "PostgreSQL", pattern: /\b(postgresql|postgres)\b/i },
  { name: "Redis", pattern: /\bredis\b/i },
  { name: "GraphQL", pattern: /\bgraphql\b/i },
  { name: "Microservices", pattern: /\bmicroservices\b/i },
  { name: "C++", pattern: /\bc\+\+\b/i },
  { name: "C#", pattern: /\bc#\b/i },
  { name: ".NET", pattern: /\b\.net\b/i }
];

/**
 * Parses a PDF buffer and returns plain text.
 * @param {Buffer} pdfBuffer 
 * @returns {Promise<string>}
 */
export const parsePDF = async (pdfBuffer) => {
  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  } catch (error) {
    console.error("PDF parsing error:", error.message);
    throw new Error("Failed to parse PDF file: " + error.message);
  }
};

/**
 * Extracts skills from text based on predefined dictionary.
 * @param {string} text 
 * @returns {string[]}
 */
export const extractSkills = (text) => {
  const matchedSkills = [];
  for (const skill of SKILLS_DB) {
    if (skill.pattern.test(text)) {
      matchedSkills.push(skill.name);
    }
  }
  return matchedSkills;
};

/**
 * Heuristic extraction of projects from text.
 * @param {string} text 
 * @returns {string[]}
 */
export const extractProjects = (text) => {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const projects = [];
  let inProjectsSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect project section headers
    if (/^(projects|personal projects|key projects|academic projects|selected projects|portfolio|built projects)/i.test(line)) {
      inProjectsSection = true;
      continue;
    }

    // Detect other sections (stop parsing projects)
    if (inProjectsSection && /^(experience|work experience|employment|education|skills|technical skills|certifications|languages|summary|about me)/i.test(line)) {
      inProjectsSection = false;
    }

    if (inProjectsSection) {
      // Clean and identify potential project names
      if (/^[-*•]\s*(.+)/.test(line)) {
        const content = line.replace(/^[-*•]\s*/, "");
        if (content.length > 3 && content.length < 80 && !content.endsWith(".") && /[A-Z]/.test(content[0])) {
          projects.push(content);
        }
      } else if (line.length > 3 && line.length < 60 && !line.endsWith(".") && /[A-Z]/.test(line[0])) {
        projects.push(line);
      }
    }
  }

  // Fallback: check for action verbs if no project section was detected
  if (projects.length === 0) {
    const verbRegex = /\b(developed|designed|built|created|implemented)\s+a\s+([A-Za-z0-9\s\-]+?)(?:using|with|to|$)/i;
    for (const line of lines) {
      const match = line.match(verbRegex);
      if (match && match[2]) {
        const projName = match[2].trim();
        if (projName.length > 3 && projName.length < 50 && !projects.includes(projName)) {
          projects.push(projName);
        }
      }
    }
  }

  return [...new Set(projects)].map(p => p.trim());
};

/**
 * Heuristic extraction of work experience in years.
 * @param {string} text 
 * @returns {number}
 */
export const extractExperienceYears = (text) => {
  // 1. Direct phrases like "5+ years of experience"
  const expPhraseRegex = /(\d+)\+?\s*(?:yr|year)s?\s*(?:of\s+)?(?:work\s+|professional\s+)?experience/i;
  const phraseMatch = text.match(expPhraseRegex);
  if (phraseMatch && phraseMatch[1]) {
    return parseInt(phraseMatch[1], 10);
  }

  // 2. Scan for year ranges (e.g. 2018-2022, 2021 to Present)
  const yearRangeRegex = /\b(20\d{2})\s*[-–—to\s]+\s*(Present|20\d{2})\b/gi;
  let match;
  let totalYears = 0;
  const currentYear = 2026; // Set to local current year from environment metadata
  const ranges = [];

  while ((match = yearRangeRegex.exec(text)) !== null) {
    const startYear = parseInt(match[1], 10);
    const endYearStr = match[2];
    const endYear = /present/i.test(endYearStr) ? currentYear : parseInt(endYearStr, 10);
    
    if (endYear >= startYear) {
      ranges.push({ startYear, endYear });
    }
  }

  // Merge overlapping ranges to prevent double counting
  if (ranges.length > 0) {
    ranges.sort((a, b) => a.startYear - b.startYear);
    const merged = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
      const last = merged[merged.length - 1];
      const curr = ranges[i];
      if (curr.startYear <= last.endYear) {
        last.endYear = Math.max(last.endYear, curr.endYear);
      } else {
        merged.push(curr);
      }
    }
    totalYears = merged.reduce((sum, r) => sum + (r.endYear - r.startYear), 0);
    if (totalYears === 0 && ranges.length > 0) {
      totalYears = 1; // Baseline if range starts/ends same year
    }
  }

  // 3. Fallback baseline if experience sections/roles exist
  if (totalYears === 0) {
    const roleKeywords = /\b(software engineer|developer|analyst|manager|consultant|intern|architect|lead)\b/i;
    if (roleKeywords.test(text)) {
      if (/experience|employment|work history/i.test(text)) {
        totalYears = 2;
      } else {
        totalYears = 1;
      }
    }
  }

  return Math.min(25, totalYears);
};

/**
 * Checks structure completeness based on standard sections.
 * Returns indicators of presence for: Contact, Education, Experience, Projects, Skills.
 * @param {string} text 
 * @returns {object}
 */
export const checkStructure = (text) => {
  const sections = {
    hasContact: /email|phone|linkedin|github|address|\bcontact\b/i.test(text),
    hasEducation: /education|university|college|degree|bachelor|master|phd/i.test(text),
    hasExperience: /experience|employment|work history|career|history/i.test(text),
    hasProjects: /project|portfolio|academic work/i.test(text),
    hasSkills: /skills?|technologies|tools|expertise/i.test(text)
  };

  const presentCount = Object.values(sections).filter(Boolean).length;
  const score = (presentCount / 5) * 100;

  return {
    sections,
    score
  };
};
