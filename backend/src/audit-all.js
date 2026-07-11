/**
 * COMPREHENSIVE AUDIT SCRIPT
 * Tests every function in every service with edge cases.
 * Run: node src/audit-all.js
 */
import dotenv from "dotenv";
dotenv.config({ override: true });

import { extractSkills, extractProjects, extractExperienceYears, checkStructure } from "./services/parser.service.js";
import { calculateScore, ROLE_SKILLS_DICTIONARY } from "./services/scoring.service.js";
import { evaluateSubmission } from "./services/evaluation.service.js";
import { evaluateInterviewAnswer } from "./services/interviewEvaluation.service.js";
import { getTailoredQuestions } from "./services/questionBank.js";
import { updateTopicMastery, calculateOverallMastery, calculateRiskLevel, getWeakTopics, getMasteryMatrix } from "./services/mastery.service.js";
import geminiService from "./services/gemini.service.js";

let passed = 0;
let failed = 0;
const errors = [];

function assert(label, condition, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}${details ? ` — ${details}` : ""}`);
    failed++;
    errors.push({ label, details });
  }
}

function section(name) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  📦 ${name}`);
  console.log("=".repeat(60));
}

// ─────────────────────────────────────────────────────────────
// 1. PARSER SERVICE
// ─────────────────────────────────────────────────────────────
section("parser.service.js — extractSkills");

const fullResume = `John Doe | john@example.com | linkedin.com/in/johndoe
Skills: React, Node.js, Express, MongoDB, JavaScript, HTML, CSS, Git, Docker, REST APIs, PostgreSQL, TypeScript, Python, Redis, GraphQL
Experience: 3+ years of experience in software development.
Education: B.S. Computer Science, 2020.
Projects:
- E-Commerce Platform (React + Node.js)
- AI Analytics Dashboard (Python + TensorFlow)
Experience:
Software Engineer at TechCorp (2022 - Present)
Junior Dev at WebCo (2020 - 2022)`;

const skills = extractSkills(fullResume);
assert("extractSkills — Returns array", Array.isArray(skills));
assert("extractSkills — Detects React", skills.includes("React"));
assert("extractSkills — Detects Node.js", skills.includes("Node.js"));
assert("extractSkills — Detects Docker", skills.includes("Docker"));
assert("extractSkills — Detects PostgreSQL", skills.includes("PostgreSQL"));
assert("extractSkills — Detects TypeScript", skills.includes("TypeScript"));
assert("extractSkills — Detects Python", skills.includes("Python"));
assert("extractSkills — Detects Redis", skills.includes("Redis"));
assert("extractSkills — Detects GraphQL", skills.includes("GraphQL"));
assert("extractSkills — No duplicates", skills.length === new Set(skills).size);
assert("extractSkills — Empty text returns []", extractSkills("").length === 0);
assert("extractSkills — Random text returns []", extractSkills("hello world nothing useful here").length === 0, `Got: ${extractSkills("hello world").join(",")}`);

section("parser.service.js — extractProjects");
const projects = extractProjects(fullResume);
assert("extractProjects — Returns array", Array.isArray(projects));
assert("extractProjects — Finds project from section", projects.length > 0, `Found: ${projects}`);
assert("extractProjects — No duplicates", projects.length === new Set(projects).size);
assert("extractProjects — Empty returns []", extractProjects("").length === 0);

// Verb-based fallback
const verbResume = "I developed a real-time dashboard using React. I built a REST API using Node.js.";
const verbProjects = extractProjects(verbResume);
assert("extractProjects — Verb fallback finds project titles", verbProjects.length > 0, `Found: ${verbProjects}`);

section("parser.service.js — extractExperienceYears");
assert("extractExperienceYears — 3+ years phrase", extractExperienceYears("3+ years of experience") === 3);
assert("extractExperienceYears — Year range 2020-2022", extractExperienceYears("Software Engineer (2020-2022)") === 2);
assert("extractExperienceYears — Present year", extractExperienceYears("Developer (2022 - Present)") === 4);
assert("extractExperienceYears — Role keyword fallback", extractExperienceYears("Software Engineer with experience working") >= 1);
assert("extractExperienceYears — No info returns 0", extractExperienceYears("John Doe, student") === 0);
assert("extractExperienceYears — Merged overlapping ranges", extractExperienceYears("Engineer (2018-2021) Lead (2020-2023)") === 5);
assert("extractExperienceYears — Max cap 25", extractExperienceYears("30+ years of experience") === 25, `Got: ${extractExperienceYears("30+ years of experience")}`);

section("parser.service.js — checkStructure");
const structure = checkStructure(fullResume);
assert("checkStructure — Returns sections object", structure.sections !== undefined);
assert("checkStructure — Returns score", typeof structure.score === "number");
assert("checkStructure — Detects contact (email)", structure.sections.hasContact === true);
assert("checkStructure — Detects education", structure.sections.hasEducation === true);
assert("checkStructure — Detects experience", structure.sections.hasExperience === true);
assert("checkStructure — Detects projects", structure.sections.hasProjects === true);
assert("checkStructure — Detects skills", structure.sections.hasSkills === true);
assert("checkStructure — Perfect score = 100", structure.score === 100);

const emptyStructure = checkStructure("random text with nothing");
assert("checkStructure — Empty gives 0 or low score", emptyStructure.score < 100);

// ─────────────────────────────────────────────────────────────
// 2. SCORING SERVICE
// ─────────────────────────────────────────────────────────────
section("scoring.service.js — calculateScore");

const scoreFull = calculateScore({
  skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML", "CSS", "Git", "Docker", "REST APIs", "SQL", "TypeScript"],
  projects: ["App1", "App2", "App3", "App4"],
  experienceYears: 5,
  structureScore: 100
}, "Full-Stack Developer");

assert("calculateScore — Returns object", typeof scoreFull === "object");
assert("calculateScore — Has targetRole", !!scoreFull.targetRole);
assert("calculateScore — Has strengthScore 0-100", scoreFull.strengthScore >= 0 && scoreFull.strengthScore <= 100);
assert("calculateScore — Has scoreBreakdown", !!scoreFull.scoreBreakdown);
assert("calculateScore — Has missingSkills array", Array.isArray(scoreFull.missingSkills));
assert("calculateScore — Has improvementSuggestions array", Array.isArray(scoreFull.improvementSuggestions));
assert("calculateScore — Perfect match gives high score", scoreFull.strengthScore >= 90, `Got: ${scoreFull.strengthScore}`);
assert("calculateScore — No missing skills for perfect match", scoreFull.missingSkills.length === 0, `Missing: ${scoreFull.missingSkills}`);

// Verify weight formula manually
const { skillRelevance, projectDepth, experienceIndicators, structureScore } = scoreFull.scoreBreakdown;
const expectedScore = Math.round((skillRelevance * 0.40) + (projectDepth * 0.30) + (experienceIndicators * 0.20) + (structureScore * 0.10));
assert("calculateScore — Formula is accurate", scoreFull.strengthScore === expectedScore, `Service: ${scoreFull.strengthScore}, Formula: ${expectedScore}`);

const scoreEmpty = calculateScore({ skills: [], projects: [], experienceYears: 0, structureScore: 0 }, "Full-Stack Developer");
assert("calculateScore — Empty resume gives 0", scoreEmpty.strengthScore === 0);
assert("calculateScore — All skills missing", scoreEmpty.missingSkills.length > 0);

const scoreUnknownRole = calculateScore({ skills: ["Python"], projects: [], experienceYears: 2, structureScore: 60 }, "Alien Programmer");
assert("calculateScore — Unknown role defaults to Full-Stack", scoreUnknownRole.targetRole === "Full-Stack Developer");

// ─────────────────────────────────────────────────────────────
// 3. QUESTION BANK
// ─────────────────────────────────────────────────────────────
section("questionBank.js — getTailoredQuestions");

const fsQuestions = getTailoredQuestions("Full-Stack Developer", ["React", "Node.js"]);
assert("getTailoredQuestions — Returns 4 questions", fsQuestions.length === 4);
assert("getTailoredQuestions — Has Technical", fsQuestions.some(q => q.category === "Technical"));
assert("getTailoredQuestions — Has Behavioral", fsQuestions.some(q => q.category === "Behavioral"));
assert("getTailoredQuestions — Has System Design", fsQuestions.some(q => q.category === "System Design"));
assert("getTailoredQuestions — Has Project Deep-Dive", fsQuestions.some(q => q.category === "Project Deep-Dive"));
assert("getTailoredQuestions — All have questionText", fsQuestions.every(q => q.questionText && q.questionText.length > 0));
assert("getTailoredQuestions — All have difficulty", fsQuestions.every(q => ["Easy", "Medium", "Hard"].includes(q.difficulty)));

const dsQuestions = getTailoredQuestions("Data Scientist", []);
assert("getTailoredQuestions — Data Scientist has 4 questions", dsQuestions.length === 4);

const unknownRole = getTailoredQuestions("Rocket Scientist", []);
assert("getTailoredQuestions — Unknown role uses defaults and has 4 questions", unknownRole.length === 4);
assert("getTailoredQuestions — Empty role uses defaults", getTailoredQuestions("", []).length === 4);

// ─────────────────────────────────────────────────────────────
// 4. MASTERY SERVICE
// ─────────────────────────────────────────────────────────────
section("mastery.service.js — calculateOverallMastery");

assert("calculateOverallMastery — Empty array returns 0", calculateOverallMastery([]) === 0);
assert("calculateOverallMastery — Single topic", calculateOverallMastery([{ masteryScore: 80 }]) === 80);
assert("calculateOverallMastery — Average of 2 topics", calculateOverallMastery([{ masteryScore: 60 }, { masteryScore: 80 }]) === 70);
assert("calculateOverallMastery — Rounds correctly", typeof calculateOverallMastery([{ masteryScore: 33 }, { masteryScore: 34 }]) === "number");

section("mastery.service.js — calculateRiskLevel");
assert("calculateRiskLevel — Score >= 75 is low", calculateRiskLevel(75) === "low");
assert("calculateRiskLevel — Score >= 50 is moderate", calculateRiskLevel(50) === "moderate");
assert("calculateRiskLevel — Score < 50 is high", calculateRiskLevel(49) === "high");
assert("calculateRiskLevel — Score 0 is high", calculateRiskLevel(0) === "high");
assert("calculateRiskLevel — Score 100 is low", calculateRiskLevel(100) === "low");

section("mastery.service.js — getWeakTopics");
const mockUser = {
  learningProfile: {
    topicMastery: [
      { topicName: "React Hooks", masteryScore: 30 },
      { topicName: "SQL Joins", masteryScore: 80 },
      { topicName: "System Design", masteryScore: 20 }
    ]
  }
};
const weakTopics = getWeakTopics(mockUser, 60);
assert("getWeakTopics — Finds topics below threshold", weakTopics.length === 2);
assert("getWeakTopics — Returns React Hooks as weak", weakTopics.some(t => t.topicName === "React Hooks"));
assert("getWeakTopics — Excludes SQL Joins (score=80)", !weakTopics.some(t => t.topicName === "SQL Joins"));

const emptyUser = { learningProfile: { topicMastery: [] } };
const defaultWeak = getWeakTopics(emptyUser, 60);
assert("getWeakTopics — Returns default fallbacks when empty", defaultWeak.length > 0);

section("mastery.service.js — getMasteryMatrix");
const matrix = getMasteryMatrix(mockUser);
assert("getMasteryMatrix — Returns same count as topicMastery", matrix.length === 3);
assert("getMasteryMatrix — React Hooks has 'developing' level", matrix.find(m => m.topicName === "React Hooks")?.level === "developing");
assert("getMasteryMatrix — SQL Joins has 'strong' level", matrix.find(m => m.topicName === "SQL Joins")?.level === "strong");
assert("getMasteryMatrix — System Design has 'weak' level (score=20 < 25)", matrix.find(m => m.topicName === "System Design")?.level === "weak", `Got: ${matrix.find(m => m.topicName === "System Design")?.level}`);
assert("getMasteryMatrix — Empty user returns []", getMasteryMatrix({}).length === 0);

// ─────────────────────────────────────────────────────────────
// 5. EVALUATION SERVICE (fallback mode)
// ─────────────────────────────────────────────────────────────
section("evaluation.service.js — evaluateSubmission (fallback)");

const mockAssignment = {
  topicName: "React Hooks",
  title: "Build a Custom React Hook",
  problemStatement: "...",
  assignmentType: "Coding",
  difficulty: "Medium"
};

const mockSubmission = {
  mode: "Code",
  content: `
    import { useState, useEffect } from 'react';
    const cache = new Map();
    export const useFetch = (url) => {
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      useEffect(() => {
        if (cache.has(url)) { setData(cache.get(url)); setLoading(false); return; }
        fetch(url).then(r => r.json()).then(d => { cache.set(url, d); setData(d); setLoading(false); }).catch(err => { setError(err); setLoading(false); });
        return () => {}; // cleanup
      }, [url]);
      return { data, loading, error };
    };
  `,
  githubLink: "https://github.com/user/react-hook"
};

const evalResult = await evaluateSubmission(mockAssignment, mockSubmission);
assert("evaluateSubmission — Returns object", typeof evalResult === "object");
assert("evaluateSubmission — Has score 0-100", evalResult.score >= 0 && evalResult.score <= 100, `Got: ${evalResult.score}`);
assert("evaluateSubmission — Has conceptCoverage array", Array.isArray(evalResult.conceptCoverage));
assert("evaluateSubmission — Has mistakeBreakdown array", Array.isArray(evalResult.mistakeBreakdown));
assert("evaluateSubmission — Has improvementSuggestions array", Array.isArray(evalResult.improvementSuggestions));
assert("evaluateSubmission — React loading state detected", evalResult.conceptCoverage.some(c => c.concept === "Loading State Handling" && c.covered));
assert("evaluateSubmission — React error state detected", evalResult.conceptCoverage.some(c => c.concept === "Error State Handling" && c.covered));
assert("evaluateSubmission — Cache detected", evalResult.conceptCoverage.some(c => c.concept === "In-Memory Cache Map" && c.covered));
assert("evaluateSubmission — GitHub bonus included (score > 60 baseline)", evalResult.score >= 60);

// Test with unknown topic — hits default criteria
const unknownTopicAssignment = { ...mockAssignment, topicName: "Unknown Topic XYZ" };
const unknownEval = await evaluateSubmission(unknownTopicAssignment, { mode: "Code", content: "try { const result = validate(x); } catch(e) { error(e); } // comment\nfunction doStuff() {}", githubLink: "" });
assert("evaluateSubmission — Unknown topic uses default criteria", typeof unknownEval.score === "number");

// Test with empty submission
const emptyEval = await evaluateSubmission(mockAssignment, { mode: "Code", content: "", githubLink: "" });
assert("evaluateSubmission — Empty submission scores at or above baseline", emptyEval.score >= 60, `Got: ${emptyEval.score}`);

// ─────────────────────────────────────────────────────────────
// 6. INTERVIEW EVALUATION SERVICE (fallback mode)
// ─────────────────────────────────────────────────────────────
section("interviewEvaluation.service.js — evaluateInterviewAnswer (fallback)");

const q1 = "Explain the virtual DOM reconciliation process in React and how the key prop affects rendering performance.";
const a1Strong = "The virtual DOM reconciliation works by React creating a tree snapshot of the current component structure (VDOM) and diffing it with the new tree. The fiber reconciliation algorithm checks each node's type and key prop — if the key stays the same, it patches the existing DOM node in place, avoiding full re-renders. The key prop prevents unnecessary component unmount/remount cycles and improves rendering and batching efficiency.";
const evalStrong = await evaluateInterviewAnswer(q1, a1Strong);
assert("evaluateInterviewAnswer — Returns object", typeof evalStrong === "object");
assert("evaluateInterviewAnswer — Has score 0-100", evalStrong.score >= 0 && evalStrong.score <= 100);
assert("evaluateInterviewAnswer — Has feedback string", typeof evalStrong.feedback === "string" && evalStrong.feedback.length > 0);
assert("evaluateInterviewAnswer — Has missingConcepts array", Array.isArray(evalStrong.missingConcepts));
assert("evaluateInterviewAnswer — Strong answer scores > 30", evalStrong.score > 30, `Got: ${evalStrong.score}`);

const evalEmpty = await evaluateInterviewAnswer(q1, "");
assert("evaluateInterviewAnswer — Empty answer has low score", evalEmpty.score < 40, `Got: ${evalEmpty.score}`);

const behavioralQ = "Describe a situation where you had a strong technical disagreement with a peer.";
const behavioralA = "We had a disagreement about the database schema. I listened carefully to his concerns, communicated my reasoning with data, and we reached alignment using objective criteria. Our compromise was a hybrid approach.";
const evalBehavioral = await evaluateInterviewAnswer(behavioralQ, behavioralA);
assert("evaluateInterviewAnswer — Behavioral question works", typeof evalBehavioral.score === "number");

// ─────────────────────────────────────────────────────────────
// 7. GEMINI SERVICE — Placeholder Key Check
// ─────────────────────────────────────────────────────────────
section("gemini.service.js — Placeholder key returns null gracefully");

const genAssignment = await geminiService.generateAssignment({ topicName: "React Hooks", targetRole: "Full-Stack Dev", difficulty: "Easy", assignmentType: "Coding" });
assert("geminiService.generateAssignment — Returns null for placeholder key", genAssignment === null);

const evalSubmission = await geminiService.evaluateSubmission({ topicName: "React Hooks", title: "T", problemStatement: "P", assignmentType: "Coding", difficulty: "Easy" }, { mode: "Code", content: "...", githubLink: "" });
assert("geminiService.evaluateSubmission — Returns null for placeholder key", evalSubmission === null);

const genInterviewQ = await geminiService.generateInterviewQuestions({ targetRole: "Full-Stack Developer", skillStack: ["React"] });
assert("geminiService.generateInterviewQuestions — Returns null for placeholder key", genInterviewQ === null);

const evalAnswer = await geminiService.evaluateInterviewAnswer("What is React?", "React is a JS library.");
assert("geminiService.evaluateInterviewAnswer — Returns null for placeholder key", evalAnswer === null);

const analyzeResume = await geminiService.analyzeResume("John Doe, React developer", "Full-Stack Developer");
assert("geminiService.analyzeResume — Returns null for placeholder key", analyzeResume === null);

// ─────────────────────────────────────────────────────────────
// 8. MASTERY SERVICE — updateTopicMastery with mock user object
// ─────────────────────────────────────────────────────────────
section("mastery.service.js — updateTopicMastery (unit, no DB)");

// Mock a minimal user object that mimics Mongoose save()
const mockUserForMastery = {
  learningProfile: {
    targetRole: "Full-Stack Developer",
    overallMasteryScore: 0,
    riskLevel: "high",
    topicMastery: [],
    mistakeHistory: []
  },
  save: async () => {} // no-op save mock
};

const masteryReport = await updateTopicMastery(mockUserForMastery, "React Hooks", 85);
assert("updateTopicMastery — Returns report object", typeof masteryReport === "object");
assert("updateTopicMastery — Has topicName", masteryReport.topicName === "React Hooks");
assert("updateTopicMastery — Has oldMasteryScore", masteryReport.oldMasteryScore === 0);
assert("updateTopicMastery — Has newMasteryScore", typeof masteryReport.newMasteryScore === "number");
assert("updateTopicMastery — newMasteryScore > 0 after assignment=85", masteryReport.newMasteryScore > 0, `Got: ${masteryReport.newMasteryScore}`);
assert("updateTopicMastery — Has newOverallMastery", typeof masteryReport.newOverallMastery === "number");
assert("updateTopicMastery — Has newRiskLevel", ["low", "moderate", "high"].includes(masteryReport.newRiskLevel));

// Formula verification: (quizAccuracy=75*0.5) + (assignmentScore=85*0.3) + (consistency=min(100,1*25)*0.2)
const expectedMastery = Math.round((75 * 0.50) + (85 * 0.30) + (25 * 0.20));
assert("updateTopicMastery — Formula is correct", masteryReport.newMasteryScore === expectedMastery, `Got ${masteryReport.newMasteryScore}, expected ${expectedMastery}`);

// Update again — tests attemptsCount increment and consistency grow
await updateTopicMastery(mockUserForMastery, "React Hooks", 90);
const topic2 = mockUserForMastery.learningProfile.topicMastery.find(t => t.topicName === "React Hooks");
assert("updateTopicMastery — 2nd attempt increments attemptsCount to 2", topic2.attemptsCount === 2);
const consistency2 = Math.min(100, 2 * 25);
const expectedMastery2 = Math.round((75 * 0.50) + (90 * 0.30) + (consistency2 * 0.20));
assert("updateTopicMastery — 2nd attempt formula correct", topic2.masteryScore === expectedMastery2, `Got ${topic2.masteryScore}, expected ${expectedMastery2}`);

// Test with input object format
const masteryObjReport = await updateTopicMastery(mockUserForMastery, "SQL Joins", { assignmentScore: 70, quizAccuracy: 90 });
assert("updateTopicMastery — Accepts object input", typeof masteryObjReport.newMasteryScore === "number");
const sqlTopic = mockUserForMastery.learningProfile.topicMastery.find(t => t.topicName === "SQL Joins");
const expectedSQL = Math.round((90 * 0.50) + (70 * 0.30) + (25 * 0.20));
assert("updateTopicMastery — Object input formula correct", sqlTopic.masteryScore === expectedSQL, `Got ${sqlTopic.masteryScore}, expected ${expectedSQL}`);

// ─────────────────────────────────────────────────────────────
// FINAL SUMMARY
// ─────────────────────────────────────────────────────────────
console.log(`\n${"=".repeat(60)}`);
console.log(`  🏁 AUDIT COMPLETE`);
console.log("=".repeat(60));
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  Total   : ${passed + failed}`);
if (errors.length > 0) {
  console.log("\n  FAILED TESTS:");
  errors.forEach(e => console.error(`  • ${e.label}: ${e.details}`));
}
console.log("=".repeat(60));
