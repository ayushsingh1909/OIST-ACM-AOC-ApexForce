import { extractSkills, extractProjects, extractExperienceYears, checkStructure } from "./services/parser.service.js";
import { calculateScore } from "./services/scoring.service.js";

const sampleResume = `
John Doe
Email: john.doe@example.com
Phone: +1-555-0199
LinkedIn: linkedin.com/in/johndoe

Summary
Passionate Full-Stack Developer with 3+ years of experience building high-quality web applications.

Skills
React, Node.js, Express, MongoDB, JavaScript, HTML, CSS, Git, Docker, REST APIs

Projects
- E-commerce Platform: Built a full-stack e-commerce web application utilizing React, Node.js, and MongoDB. Implemented user authentication, product catalog, shopping cart, and payment processing.
- AI Chatbot Application: Designed a chatbot interface using React, WebSockets, and OpenAI API, allowing users to converse with an AI in real-time.
- Task Management System: Developed a RESTful API and front-end interface using Express and PostgreSQL for teams to organize and assign daily duties.

Experience
Software Engineer at TechCorp (2023 - Present)
- Developed and maintained scalable web apps using React, Node.js, and Express.
- Collaborated with product teams to design new feature APIs.

Junior Developer at WebSolutions (2020 - 2022)
- Built interactive frontend dashboards with HTML, CSS, and JavaScript.
- Wrote unit tests and automated builds with Git.

Education
Bachelor of Science in Computer Science
State University, 2016 - 2020
`;

const runTests = () => {
  console.log("=== Running Resume Analysis Heuristic Service Tests ===");

  console.log("\n1. Testing Parser Service...");
  const skills = extractSkills(sampleResume);
  console.log("Extracted Skills:", skills);

  const projects = extractProjects(sampleResume);
  console.log("Extracted Projects:", projects);

  const expYears = extractExperienceYears(sampleResume);
  console.log("Extracted Experience Years:", expYears);

  const structure = checkStructure(sampleResume);
  console.log("Structure Check:", structure);

  console.log("\n2. Testing Scoring Service...");
  const targetRole = "Full-Stack Developer";
  const scoring = calculateScore({
    skills,
    projects,
    experienceYears: expYears,
    structureScore: structure.score
  }, targetRole);

  console.log("Target Role:", scoring.targetRole);
  console.log("Strength Score:", scoring.strengthScore);
  console.log("Score Breakdown:", scoring.scoreBreakdown);
  console.log("Missing Skills:", scoring.missingSkills);
  console.log("Suggestions:", scoring.improvementSuggestions);

  // Asserting formula weight checks:
  // Resume Strength = (Skill Relevance * 0.40) + (Project Depth * 0.30) + (Experience Indicators * 0.20) + (Structure Score * 0.10)
  const expectedRelevance = scoring.scoreBreakdown.skillRelevance;
  const expectedProjectDepth = scoring.scoreBreakdown.projectDepth;
  const expectedExpIndicators = scoring.scoreBreakdown.experienceIndicators;
  const expectedStructure = scoring.scoreBreakdown.structureScore;
  
  const expectedRaw = (expectedRelevance * 0.4) + (expectedProjectDepth * 0.3) + (expectedExpIndicators * 0.2) + (expectedStructure * 0.1);
  const expectedScore = Math.round(expectedRaw);

  console.log("\n=== Validation ===");
  console.log(`Calculated Score in Service: ${scoring.strengthScore}`);
  console.log(`Expected Score by Formula: ${expectedScore}`);

  if (scoring.strengthScore === expectedScore) {
    console.log("SUCCESS: Scoring Engine formula matches requirements exactly!");
  } else {
    console.error("FAILURE: Scoring Engine mismatch.");
  }
};

runTests();
