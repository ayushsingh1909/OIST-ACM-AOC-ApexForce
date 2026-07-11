import dotenv from "dotenv";
// Ensure environment variables are loaded
dotenv.config({ override: true });

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  }

  /**
   * Generates a personalized programming/analytical assignment using Gemini.
   * @param {object} params - { topicName, targetRole, difficulty, assignmentType }
   * @returns {Promise<object|null>} - { title, problemStatement } or null if failed/disabled
   */
  async generateAssignment({ topicName, targetRole, difficulty, assignmentType }) {
    if (!this.apiKey || this.apiKey.includes("your_gemini_api_key") || this.apiKey.startsWith("AQ.")) {
      console.warn("GEMINI_API_KEY is not configured or uses a placeholder. Using simulated assignment generation.");
      return null;
    }

    const prompt = `You are an expert technical interviewer and adaptive educator.
Generate a structured learning assignment for a student preparing for a role.
Target Role: ${targetRole}
Focus Topic: ${topicName}
Difficulty Level: ${difficulty}
Assignment Type: ${assignmentType}

Return a JSON object containing:
1. "title": A concise, engaging title for the assignment.
2. "problemStatement": A detailed description of the task, requirements, constraints, and instructions for submission.

Make sure the title and problemStatement are highly relevant to the focus topic and target role.`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            problemStatement: { type: "string" }
          },
          required: ["title", "problemStatement"]
        }
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini assignment generation failed. Falling back to simulation:", error.message);
      return null;
    }
  }

  /**
   * Evaluates user assignment submissions using Gemini.
   * @param {object} assignment - Mongoose Assignment document
   * @param {object} submission - { mode, content, githubLink }
   * @returns {Promise<object|null>} - Structured evaluation report or null if failed/disabled
   */
  async evaluateSubmission(assignment, submission) {
    if (!this.apiKey || this.apiKey.includes("your_gemini_api_key") || this.apiKey.startsWith("AQ.")) {
      console.warn("GEMINI_API_KEY is not configured or uses a placeholder. Using simulated assignment evaluation.");
      return null;
    }

    const combinedContent = `${submission.content} ${submission.githubLink ? `(GitHub Link: ${submission.githubLink})` : ""}`;

    const prompt = `You are an expert technical reviewer.
Evaluate the user's submission for the following assignment:
Topic: ${assignment.topicName}
Assignment Title: ${assignment.title}
Problem Statement: ${assignment.problemStatement}
Assignment Type: ${assignment.assignmentType}
Difficulty: ${assignment.difficulty}

Submission Mode: ${submission.mode}
Submission Content:
${combinedContent}

Evaluate the submission. Assess completeness, correctness, technical depth, best practices, and clean implementation.
You must return a JSON object with:
1. "score": An integer between 0 and 100.
2. "conceptCoverage": An array of objects, each containing:
   - "concept": Name of the key concept/benchmark.
   - "covered": Boolean indicating if it was covered in the submission.
   (Provide at least 3-4 relevant concepts).
3. "mistakeBreakdown": An array of objects, each containing:
   - "category": Broad category of the mistake/weakness.
   - "details": Detailed explanation of what was wrong or missing.
4. "improvementSuggestions": An array of strings with specific, actionable steps the user can take to improve the implementation.`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "integer" },
            conceptCoverage: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  concept: { type: "string" },
                  covered: { type: "boolean" }
                },
                required: ["concept", "covered"]
              }
            },
            mistakeBreakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  details: { type: "string" }
                },
                required: ["category", "details"]
              }
            },
            improvementSuggestions: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["score", "conceptCoverage", "mistakeBreakdown", "improvementSuggestions"]
        }
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini assignment evaluation failed. Falling back to simulation:", error.message);
      return null;
    }
  }

  /**
   * Generates a tailored list of 4 interview questions using Gemini.
   * @param {object} params - { targetRole, skillStack }
   * @returns {Promise<object|null>} - { questions: [{ questionText, category, difficulty }] } or null if failed/disabled
   */
  async generateInterviewQuestions({ targetRole, skillStack = [] }) {
    if (!this.apiKey || this.apiKey.includes("your_gemini_api_key") || this.apiKey.startsWith("AQ.")) {
      console.warn("GEMINI_API_KEY is not configured or uses a placeholder. Using simulated interview question generation.");
      return null;
    }

    const skillsString = skillStack.length > 0 ? skillStack.join(", ") : "general industry concepts";
    const prompt = `You are an expert technical recruiter and interviewer.
Generate exactly 4 tailored interview questions for a candidate preparing for the following role:
Target Role: ${targetRole}
Key Skills / Stack: ${skillsString}

Requirements:
- Generate EXACTLY one question for each of the following 4 categories: "Technical", "Behavioral", "System Design", "Project Deep-Dive".
- Assign an appropriate difficulty to each question: "Easy", "Medium", or "Hard".
- Ensure the questions are highly relevant, professional, and practical.

Return a JSON object containing a "questions" array of 4 objects. Each object must have fields: "questionText", "category", and "difficulty".`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  questionText: { type: "string" },
                  category: { type: "string", enum: ["Technical", "Behavioral", "System Design", "Project Deep-Dive"] },
                  difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] }
                },
                required: ["questionText", "category", "difficulty"]
              }
            }
          },
          required: ["questions"]
        }
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini interview question generation failed. Falling back to question bank:", error.message);
      return null;
    }
  }

  /**
   * Evaluates a user response to an interview question using Gemini.
   * @param {string} questionText
   * @param {string} answerText
   * @returns {Promise<object|null>} - { score, feedback, missingConcepts } or null if failed/disabled
   */
  async evaluateInterviewAnswer(questionText, answerText) {
    if (!this.apiKey || this.apiKey.includes("your_gemini_api_key") || this.apiKey.startsWith("AQ.")) {
      console.warn("GEMINI_API_KEY is not configured or uses a placeholder. Using simulated interview evaluation.");
      return null;
    }

    const prompt = `You are an expert technical interviewer.
Evaluate the candidate's response to the following question:
Question: ${questionText}
Candidate Response: ${answerText || "No response provided."}

Instructions:
1. Assign a numeric score from 0 to 100 representing the quality, completeness, correctness, structure, and depth of the answer.
2. Provide a constructive, professional feedback summary.
3. Identify 1 to 4 critical concepts, terms, or topics related to the question that the candidate failed to cover or could improve.

Return a JSON object containing:
- "score": An integer from 0 to 100.
- "feedback": A brief qualitative summary text.
- "missingConcepts": Array of strings representing concepts that were missing or weak in their answer.`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "integer" },
            feedback: { type: "string" },
            missingConcepts: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["score", "feedback", "missingConcepts"]
        }
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini interview evaluation failed. Falling back to simulation:", error.message);
      return null;
    }
  }

  /**
   * Dynamic resume parsing and scoring service using Gemini.
   * @param {string} resumeText - Extracted text contents of the resume PDF/input
   * @param {string} targetRole - Job role chosen
   * @returns {Promise<object|null>} - Complete Resume Analysis Schema or null if failed/disabled
   */
  async analyzeResume(resumeText, targetRole) {
    if (!this.apiKey || this.apiKey.includes("your_gemini_api_key") || this.apiKey.startsWith("AQ.")) {
      console.warn("GEMINI_API_KEY is not configured or uses a placeholder. Using simulated resume analysis.");
      return null;
    }

    const prompt = `You are a professional resume reviewer and talent acquisition specialist.
Analyze the following resume text for a candidate seeking a ${targetRole} role.
Resume Text:
${resumeText}

Instructions:
1. Extract all technical and soft skills listed or demonstrated in the text.
2. Extract project names/titles mentioned in the projects section.
3. Calculate the total years of professional work experience. Be careful to calculate date ranges (e.g., 2018-2022 is 4 years, "Present" translates to 2026).
4. Evaluate a structure score (0-100) based on the presence of standard sections: Contact info, Education, Experience, Projects, and Skills.
5. Score target skill relevance for a ${targetRole} (0-100).
6. Score project depth (0-100) based on complexity and alignment.
7. Score experience indicators (0-100) relative to target role.
8. Calculate the overall strengthScore: (Skill Relevance * 0.40) + (Project Depth * 0.30) + (Experience Indicators * 0.20) + (Structure Score * 0.10).
9. Identify missing target skills that are critical for ${targetRole} but absent from the resume.
10. Generate a list of actionable suggestions to improve the resume.

Return a JSON object containing:
- "targetRole": The normalized target role.
- "extractedSkills": Array of strings.
- "detectedProjects": Array of strings.
- "detectedExperienceYears": Integer.
- "strengthScore": Integer between 0 and 100.
- "scoreBreakdown": Object with "skillRelevance", "projectDepth", "experienceIndicators", "structureScore" integers.
- "missingSkills": Array of strings.
- "improvementSuggestions": Array of strings.`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            targetRole: { type: "string" },
            extractedSkills: { type: "array", items: { type: "string" } },
            detectedProjects: { type: "array", items: { type: "string" } },
            detectedExperienceYears: { type: "integer" },
            strengthScore: { type: "integer" },
            scoreBreakdown: {
              type: "object",
              properties: {
                skillRelevance: { type: "integer" },
                projectDepth: { type: "integer" },
                experienceIndicators: { type: "integer" },
                structureScore: { type: "integer" }
              },
              required: ["skillRelevance", "projectDepth", "experienceIndicators", "structureScore"]
            },
            missingSkills: { type: "array", items: { type: "string" } },
            improvementSuggestions: { type: "array", items: { type: "string" } }
          },
          required: [
            "targetRole",
            "extractedSkills",
            "detectedProjects",
            "detectedExperienceYears",
            "strengthScore",
            "scoreBreakdown",
            "missingSkills",
            "improvementSuggestions"
          ]
        }
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini resume analysis failed. Falling back to heuristic parsing:", error.message);
      return null;
    }
  }
}

export default new GeminiService();
