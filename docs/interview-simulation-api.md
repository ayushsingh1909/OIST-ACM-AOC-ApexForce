# Interview Simulation Engine API Documentation

This document provides a comprehensive overview, mathematical scoring framework, latency-optimization design, and API specifications for the **Interview Simulation Engine** of the AI Career Intelligence Engine (ACIE).

---

## 1. Overview

The **Interview Simulation Engine** provides students with a realistic, timed environment to test their interview readiness across Technical, Behavioral, System Design, and Project Deep-Dive categories.

### Features
- **Session State Tracking**: Manages the interview lifecycle through states (`ongoing`, `completed`, `expired`) and enforces a 15-minute countdown timer.
- **Dynamic Question Selection**: Tailors a 4-question bank matching the user's selected target role (e.g. Full-Stack Developer) and skill sets.
- **Sub-3-Second Latency Optimization**: To achieve responses under 3 seconds (typically <100ms), the engine relies on a compiled regular-expression parser and keyword relevance mapping in memory, eliminating heavy external NLP dependencies or external API round-trips during evaluation.

---

## 2. Evaluation Metrics Criteria

Answers are graded out of 100 points per question using a deterministic lexical check. The score weights are broken down as follows:

| Metric | Weight | Scoring Rule | Description |
| :--- | :--- | :--- | :--- |
| **Completeness** | 25% | Up to 25 pts | Checked by character length. Full points for answers $> 150$ characters, partial points down to 50 characters. |
| **Keyword Relevance** | 25% | Up to 25 pts | Evaluates presence of primary keywords related to the question topic focus (e.g. `state`, `effect` for React hooks). |
| **Technical Depth** | 20% | Up to 20 pts | Checks for presence of advanced descriptors or implementation details (e.g. `AbortController`, `ws://`). |
| **Logical Structure** | 15% | Up to 15 pts | Searches for logical structural transitional terms (e.g. `firstly`, `consequently`, `for example`, `however`). |
| **Terminology Density** | 15% | Up to 15 pts | Evaluates count of specialized domain jargon terms to verify vocabulary command. |

---

## 3. API Endpoints Specification

All endpoints are protected under the JWT authentication header.

### 3.1 Start Interview Session

Initializes a mock interview session, selects a tailored 4-question bank, and sets the countdown expiration timestamp.

- **HTTP Method**: `POST`
- **Route Path**: `/api/interviews/start`
- **Headers**:
  - `Authorization`: `Bearer <JWT_TOKEN>` (Required)
  - `Content-Type`: `application/json`

#### Request Payload
```json
{
  "targetRole": "Full-Stack Developer",
  "skillStack": ["React", "Node.js", "Docker"]
}
```

#### Response Payloads

##### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Interview session started successfully",
  "data": {
    "_id": "6a5152a219ba9e75ff248c1a",
    "targetRole": "Full-Stack Developer",
    "skillStack": ["React", "Node.js", "Docker"],
    "status": "ongoing",
    "expiresAt": "2026-07-11T01:58:00.000Z",
    "questions": [
      {
        "questionText": "Explain the virtual DOM reconciliation process in React and how key prop affects it.",
        "category": "Technical",
        "difficulty": "Medium",
        "_id": "6a5152a219ba9e75ff248c1b"
      },
      {
        "questionText": "Describe a scenario where you had to debug a memory leak in a Node.js API application.",
        "category": "Project Deep-Dive",
        "difficulty": "Medium",
        "_id": "6a5152a219ba9e75ff248c1c"
      }
    ],
    "createdAt": "2026-07-11T01:43:00.000Z"
  }
}
```

---

### 3.2 Submit Question Answer

Submits the answer for the active question. The system grades the response on the fly, logs it, and returns the next index or completes the session.

- **HTTP Method**: `POST`
- **Route Path**: `/api/interviews/:id/submit`
- **Headers**:
  - `Authorization`: `Bearer <JWT_TOKEN>` (Required)
  - `Content-Type`: `application/json`

#### Request Payload
```json
{
  "questionId": "6a5152a219ba9e75ff248c1b",
  "answerText": "Firstly, the virtual DOM is a lightweight representation of the real DOM in memory. In React, when state changes, a new virtual DOM is created. React compares it with the previous snapshot, which is called diffing. For example, key props help React identify which items have changed, been added, or removed, optimizing updates."
}
```

#### Response Payloads

##### Success Response (`200 OK` - Answer Evaluated & Next Available)
```json
{
  "success": true,
  "message": "Answer evaluated successfully",
  "data": {
    "status": "ongoing",
    "nextQuestionIndex": 1,
    "lastEvaluation": {
      "score": 90,
      "feedback": "Strong answer demonstrating a solid grasp of virtual DOM reconciliation and keys. Good logical structure with transitions.",
      "missingConcepts": ["Fiber architecture", "batching"]
    }
  }
}
```

##### Success Response (`200 OK` - Final Answer Submitted & Interview Complete)
```json
{
  "success": true,
  "message": "Interview completed successfully",
  "data": {
    "status": "completed",
    "overallScore": 88,
    "feedback": "Overall strong session! You displayed high technical competence and structured explanations. Brush up on advanced memory leak tools.",
    "lastEvaluation": {
      "score": 85,
      "feedback": "Good description of profiling tools.",
      "missingConcepts": ["Heap snapshots"]
    }
  }
}
```

##### Error Response (`400 Bad Request` - Timer Expired)
```json
{
  "success": false,
  "message": "Interview session has expired or has already been completed"
}
```

---

### 3.3 Fetch Interview History

Retrieves all previous mock interview sessions conducted by the user.

- **HTTP Method**: `GET`
- **Route Path**: `/api/interviews/history`
- **Headers**:
  - `Authorization`: `Bearer <JWT_TOKEN>` (Required)

#### Response Payloads

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6a5152a219ba9e75ff248c1a",
      "targetRole": "Full-Stack Developer",
      "status": "completed",
      "overallScore": 88,
      "createdAt": "2026-07-11T01:43:00.000Z"
    }
  ]
}
```

---

### 3.4 Get Detailed Session Report

Retrieves a detailed question-by-question breakdown, feedback, and missing concept reports for a completed session.

- **HTTP Method**: `GET`
- **Route Path**: `/api/interviews/:id/report`
- **Headers**:
  - `Authorization`: `Bearer <JWT_TOKEN>` (Required)

#### Response Payloads

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "6a5152a219ba9e75ff248c1a",
    "targetRole": "Full-Stack Developer",
    "status": "completed",
    "overallScore": 88,
    "feedback": "Overall strong session! You displayed high technical competence.",
    "questions": [
      {
        "_id": "6a5152a219ba9e75ff248c1b",
        "questionText": "Explain the virtual DOM reconciliation process in React and how key prop affects it.",
        "category": "Technical",
        "difficulty": "Medium",
        "userAnswer": "Firstly, the virtual DOM is a lightweight representation...",
        "score": 90,
        "feedback": "Strong answer demonstrating a solid grasp of virtual DOM reconciliation and keys.",
        "missingConcepts": ["Fiber architecture", "batching"],
        "evaluatedAt": "2026-07-11T01:45:00.000Z"
      }
    ],
    "createdAt": "2026-07-11T01:43:00.000Z"
  }
}
```
