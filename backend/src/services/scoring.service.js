// Mock dictionary of standard skills for different roles
export const ROLE_SKILLS_DICTIONARY = {
  "Full-Stack Developer": [
    "React", "Node.js", "Express", "MongoDB", "JavaScript", 
    "HTML", "CSS", "Git", "Docker", "REST APIs", "SQL", "TypeScript"
  ],
  "Data Scientist": [
    "Python", "R", "SQL", "Machine Learning", "Deep Learning", 
    "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", 
    "Statistics", "Data Visualization"
  ],
  "DevOps Engineer": [
    "Docker", "Kubernetes", "AWS", "CI/CD", "Git", 
    "Linux", "Terraform", "Jenkins", "Bash", "Ansible", "Monitoring"
  ],
  "Backend Developer": [
    "Node.js", "Express", "MongoDB", "SQL", "PostgreSQL", 
    "Redis", "Docker", "REST APIs", "GraphQL", "Python", 
    "Java", "Go", "Microservices", "Git"
  ],
  "Frontend Developer": [
    "React", "JavaScript", "TypeScript", "HTML", "CSS", 
    "Redux", "Sass", "TailwindCSS", "Webpack", "Vite", "Git"
  ],
  "Product Manager": [
    "Product Strategy", "Agile", "Scrum", "Roadmap", 
    "User Research", "Product Analytics", "SQL", "Wireframing", 
    "Stakeholder Management"
  ]
};

/**
 * Calculates the Resume Strength Score and returns breakdown plus suggestions.
 * @param {object} extractionResult 
 * @param {string} targetRole 
 * @returns {object}
 */
export const calculateScore = (extractionResult, targetRole) => {
  const { skills = [], projects = [], experienceYears = 0, structureScore = 0 } = extractionResult;

  // 1. Determine target role skills (default to Full-Stack Developer if not found)
  let normalizedRole = targetRole || "Full-Stack Developer";
  let targetSkills = ROLE_SKILLS_DICTIONARY[normalizedRole];

  // Case-insensitive check to find closest matching role if not an exact match
  if (!targetSkills) {
    const foundRoleKey = Object.keys(ROLE_SKILLS_DICTIONARY).find(
      key => key.toLowerCase() === normalizedRole.toLowerCase()
    );
    if (foundRoleKey) {
      normalizedRole = foundRoleKey;
      targetSkills = ROLE_SKILLS_DICTIONARY[foundRoleKey];
    } else {
      // Fallback if role is totally unknown
      normalizedRole = "Full-Stack Developer";
      targetSkills = ROLE_SKILLS_DICTIONARY[normalizedRole];
    }
  }

  // 2. Calculate Skill Relevance (0-100)
  // Check how many of the target role's skills are matched
  const matchedTargetSkills = targetSkills.filter(targetSkill => 
    skills.some(extractedSkill => extractedSkill.toLowerCase() === targetSkill.toLowerCase())
  );
  const skillRelevance = targetSkills.length > 0
    ? Math.round((matchedTargetSkills.length / targetSkills.length) * 100)
    : 100;

  // Detect missing skills
  const missingSkills = targetSkills.filter(targetSkill => 
    !skills.some(extractedSkill => extractedSkill.toLowerCase() === targetSkill.toLowerCase())
  );

  // 3. Calculate Project Depth (0-100)
  // Heuristic: 25 points per project, max 100 (4 projects)
  const projectCount = projects.length;
  const projectDepth = Math.min(100, projectCount * 25);

  // 4. Calculate Experience Indicators (0-100)
  // Heuristic: 20 points per year of experience, max 100 (5 years)
  const experienceIndicators = Math.min(100, experienceYears * 20);

  // 5. Calculate Final Score using project weights:
  // Resume Strength = (Skill Relevance * 0.40) + (Project Depth * 0.30) + (Experience Indicators * 0.20) + (Structure Score * 0.10)
  const finalScoreRaw = (skillRelevance * 0.40) + 
                        (projectDepth * 0.30) + 
                        (experienceIndicators * 0.20) + 
                        (structureScore * 0.10);
  const strengthScore = Math.round(finalScoreRaw);

  // 6. Generate improvement suggestions
  const improvementSuggestions = [];

  if (missingSkills.length > 0) {
    improvementSuggestions.push(
      `Acquire and highlight these missing key skills for ${normalizedRole}: ${missingSkills.slice(0, 5).join(", ")}.`
    );
  }
  if (projectCount < 3) {
    improvementSuggestions.push(
      "Add more detailed technical projects (aim for at least 3-4) describing your hands-on achievements and the tools you used."
    );
  }
  if (experienceYears < 3) {
    improvementSuggestions.push(
      "Elaborate on professional experiences, internships, or freelance work. Include specific roles, contributions, and dates."
    );
  }
  if (structureScore < 100) {
    improvementSuggestions.push(
      "Improve your resume's structure by ensuring it has distinct, labeled sections for Contact Info, Education, Experience, Projects, and Skills."
    );
  }

  // Base positive suggestion if everything is perfect
  if (improvementSuggestions.length === 0) {
    improvementSuggestions.push("Your resume is well-structured and displays strong alignment with your target role. Consider highlighting metrics and quantitative impacts.");
  }

  return {
    targetRole: normalizedRole,
    strengthScore,
    scoreBreakdown: {
      skillRelevance,
      projectDepth,
      experienceIndicators,
      structureScore
    },
    missingSkills,
    improvementSuggestions
  };
};
