# Adaptive Assignment Engine API Documentation

This document provides a comprehensive overview, mathematical scoring framework, and detailed API specifications for the **Adaptive Assignment Engine** of the AI Career Intelligence Engine (ACIE).

---

## 1. Overview

The **Adaptive Assignment Engine** is a core closed-loop learning module that reinforces student skills through practical hands-on assessments. Key capabilities include:
- **Topic-Specific Generation**: Automatically generates assignments tailored to the user's weakest topics, target career role, and practical skillset demands.
- **Multimodal Submissions**: Supports diverse submission types, including raw code, file attachments (ZIP/PDF), plain text responses, and GitHub repository links.
- **AI-Simulated Evaluation**: Automatically reviews deliverables against logic correctness, structure, concept application, completeness, and efficiency.
- **Dynamic Mastery Scaling**: Recalculates user topic mastery, adapts risk profiles, and dynamically scales assignment difficulty (Easy, Medium, Hard) to ensure adaptive learning.

---

## 2. Core Evaluation & Mastery Math

Upon assignment submission and evaluation, the system recalculates the user's topic mastery using a weighted average of their performance and consistent participation.

### Topic Mastery Formulation
The mathematical formula for calculating **Topic Mastery** is defined as follows:

$$\text{Topic Mastery} = (\text{Quiz Score} \times 0.50) + (\text{Assignment Score} \times 0.30) + (\text{Consistency} \times 0.20)$$

*All mastery scores are capped at a maximum of 100.*

#### Parameters Explanation:
1. **Quiz Score (50% Weight)**: Derived from the average quiz accuracy score (`quizAccuracy` / `topicMastery.quizAccuracy`) logged for the specific topic.
2. **Assignment Score (30% Weight)**: The score (0-100) returned by the AI Evaluation Engine for the submitted assignment.
3. **Consistency (20% Weight)**: A measure of the user's regular engagement with the topic, defined by the formula:

$$\text{Consistency} = \min(100, \text{attemptsCount} \times 25)$$

*(Where each attempt adds 25 points, reaching 100% consistency at 4 or more submissions).*

### Risk Profiling & Difficulty Scaling
- **Overall Mastery**: Calculated as the average of all individual topic mastery scores in the user's profile.
- **Risk Profiling**:
  - `low` risk: Overall Mastery $\ge 75$
  - `moderate` risk: $50 \le$ Overall Mastery $< 75$
  - `high` risk: Overall Mastery $< 50$
- **Difficulty Scaling**: As individual topic mastery scores cross thresholds, the assignment generator scales difficulty up from `Easy` ($<50$), to `Medium` ($50-75$), and `Hard` ($>75$).

---

## 3. API Endpoints Specification

All routes below require JSON Web Tokens passed in the request headers.

### 3.1 Generate Adaptive Assignment

Generates a new assignment. If no `topicName` is specified in the request body, the engine scans the user's profile and defaults to their weakest topic.

- **HTTP Method**: `POST`
- **Route Path**: `/api/assignments/generate`
- **Headers**:
  - `Authorization`: `Bearer <JWT_TOKEN>` (Required)
  - `Content-Type`: `application/json`

#### Request Payload
```json
{
  "topicName": "React Hooks",
  "targetRole": "Full-Stack Developer",
  "difficulty": "Medium",
  "assignmentType": "Coding"
}
```

#### Response Payloads

##### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Assignment generated successfully",
  "data": {
    "_id": "6a514d7a82379001b5be37ea",
    "user": "6a514b7782379001b5be36cd",
    "topicName": "React Hooks",
    "targetRole": "Full-Stack Developer",
    "title": "Build a Custom React Hook for Data Fetching & Caching",
    "problemStatement": "Implement a custom hook `useFetch` that fetches data from a given URL, handles loading and error states, and caches the response in memory to prevent duplicate network calls. Write unit tests to cover success and failure states.",
    "assignmentType": "Coding",
    "difficulty": "Medium",
    "status": "pending",
    "dueDate": "2026-07-18T01:30:00.000Z",
    "createdAt": "2026-07-11T01:30:00.000Z"
  }
}
```

##### Error Response (`401 Unauthorized`)
```json
{
  "success": false,
  "message": "Invalid or expired access token."
}
```

---

### 3.2 Fetch Assignment History

Fetches all assignments (both pending submissions and evaluated completions) for the logged-in user.

- **HTTP Method**: `GET`
- **Route Path**: `/api/assignments`
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
      "_id": "6a514d7a82379001b5be37ea",
      "user": "6a514b7782379001b5be36cd",
      "topicName": "React Hooks",
      "targetRole": "Full-Stack Developer",
      "title": "Build a Custom React Hook for Data Fetching & Caching",
      "assignmentType": "Coding",
      "difficulty": "Medium",
      "status": "pending",
      "dueDate": "2026-07-18T01:30:00.000Z",
      "createdAt": "2026-07-11T01:30:00.000Z"
    }
  ]
}
```

---

### 3.3 Submit and Evaluate Assignment

Submits assignment deliverables and runs them through the automated evaluation engine to calculate scores, update topic mastery, and output a detailed analysis report.

- **HTTP Method**: `POST`
- **Route Path**: `/api/assignments/:id/submit`
- **Headers**:
  - `Authorization`: `Bearer <JWT_TOKEN>` (Required)
  - `Content-Type`: `application/json` OR `multipart/form-data`

#### Request Payload Structure

- **Scenario A: Direct Text/Code or GitHub Link (JSON)**
  ```json
  {
    "submissionMode": "Code",
    "content": "const useFetch = (url) => { ... }",
    "githubLink": "https://github.com/user/custom-hook-repo"
  }
  ```

- **Scenario B: File Attachment ZIP/PDF (Multipart)**
  - File key: `file` (Binary ZIP or PDF upload)
  - Text field: `submissionMode` (`"File"`)

#### Response Payloads

##### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Assignment submitted and evaluated successfully",
  "data": {
    "status": "completed",
    "submission": {
      "mode": "Code",
      "content": "const useFetch = (url) => { ... }",
      "submittedAt": "2026-07-11T01:35:10.000Z"
    },
    "evaluation": {
      "score": 85,
      "evaluatedAt": "2026-07-11T01:35:12.000Z",
      "conceptCoverage": [
        { "concept": "Loading State Handling", "covered": true },
        { "concept": "Error State Handling", "covered": true },
        { "concept": "In-Memory Cache Map", "covered": true },
        { "concept": "Component Unmount Cleanup", "covered": false }
      ],
      "mistakeBreakdown": [
        { "category": "Memory Leaks", "details": "The hook does not abort active fetches or cleanup state updates if the component unmounts mid-request." }
      ],
      "improvementSuggestions": [
        "Implement AbortController in useEffect to cancel active fetch promises on unmount.",
        "Add stale-while-revalidate caching headers if communicating with standard API services."
      ]
    },
    "masteryUpdate": {
      "topicName": "React Hooks",
      "oldMasteryScore": 40,
      "newMasteryScore": 65,
      "newRiskLevel": "moderate"
    }
  }
}
```

##### Error Response (`404 Not Found`)
```json
{
  "success": false,
  "message": "Assignment not found or does not belong to user"
}
```
