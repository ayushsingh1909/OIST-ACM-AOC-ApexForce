# Module 3: Adaptive Quiz Engine

## 1. Module Overview & Purpose
The Adaptive Quiz Engine provides students with dynamically-generated quizzes targeted at improving their weak performance areas, closing resume gaps, and resolving mock interview deficiencies. 

Key features include:
1. **Dynamic Selection**: Questions are chosen based on the user's weak topics, mistake history, and target difficulty.
2. **Flexible Question Types**: Supports Multiple Choice Questions (MCQ), Short Answer (evaluated via keyword matching), and Code Output challenges.
3. **Automatic Evaluation & Mastery Recalculation**: Immediately grades submissions and triggers updates to topic mastery profiles, overall scores, and platform risk flags.

---

## 2. Component Reference

### Frontend Views
1. **Quiz Start Screen**: Displays the quiz title, topic focal point, adaptive target difficulty, time limit (default: 15 minutes), and question count (default: 10 questions).
2. **Quiz-Taking Interface**: A focused layout equipped with:
   - An active countdown timer.
   - Question navigation (previous/next).
   - "Flag for Review" toggles.
3. **Quiz Submission & Results Screen**: Displays the calculated score, accuracy percentages, topic-wise breakdowns, detailed question-by-question explanations, and specific mistake highlights.
4. **Quiz History Screen**: A historic log of completed quiz attempts with chronological navigation.

---

## 3. Database Schemas

### Question Schema (`Question`)
Stores the master bank of questions for quizzes.

| Field | Type | Description |
| :--- | :--- | :--- |
| `topic` | `String` | Topic category index (e.g., "JavaScript", "React Core"). Required. |
| `subtopic` | `String` | Detailed subcategory. |
| `type` | `String` | Type of question: `mcq`, `code-output`, or `short-answer`. Required. |
| `difficulty` | `String` | Target difficulty level: `easy`, `medium`, or `hard`. |
| `questionText` | `String` | The challenge prompt. Required. |
| `options` | `[String]` | Array of options (for MCQ types). |
| `correctAnswer` | `String` | Evaluated answer key (pipe-separated `|` list for short-answer keywords). Required. |
| `explanation` | `String` | Educational context shown to students post-evaluation. |
| `tags` | `[String]` | Extra semantic taxonomy tags. |
| `isActive` | `Boolean` | Filter out deprecated questions. Default: `true`. |

### Quiz Attempt Schema (`QuizAttempt`)
Tracks the individual student runtime quiz state and evaluations.

| Field | Type | Description |
| :--- | :--- | :--- |
| `user` | `ObjectId` | Reference to the `User`. Required. |
| `questions` | `[Object]` | Array of questions embedded inside the attempt, capturing `questionId`, `userAnswer`, `isCorrect`, `isFlagged`, and `timeSpentSeconds`. |
| `status` | `String` | Lifecycle status: `in-progress`, `completed`, or `expired`. |
| `totalQuestions`| `Number` | Total question count. |
| `correctCount` | `Number` | Number of correct user responses. |
| `accuracy` | `Number` | Percentage correctness (`0 - 100`). |
| `score` | `Number` | Attempt score scaling (`0 - 100`). |
| `timeLimitMinutes`| `Number` | Maximum duration. Default: `15`. |
| `startedAt` | `Date` | Timestamp of initialization. |
| `completedAt` | `Date` | Timestamp of submission. |
| `topicBreakdown` | `[Object]` | Topic-wise performance summaries. |
| `adaptiveProfile` | `Object` | Captured generation input parameters (`weakTopics` and `targetDifficulty`). |

---

## 4. API Reference Documentation

All endpoints are protected under the base `/api/quiz` prefix and require a valid auth token.

### Start Quiz Attempt
- **Endpoint**: `POST /api/quiz/start`
- **Description**: Generates an adaptive quiz based on the user's weak topics, overall mastery, and past mistake history.
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Adaptive quiz generated successfully",
    "data": {
      "attemptId": "603d2e1c9b1d92305a415b88",
      "timeLimitMinutes": 15,
      "totalQuestions": 10,
      "questions": [
        {
          "questionId": "603d2e1c9b1d92305a415a11",
          "topic": "JavaScript",
          "type": "mcq",
          "difficulty": "medium",
          "questionText": "What does `typeof null` return?",
          "options": ["object", "null", "undefined", "string"]
        }
      ],
      "adaptiveProfile": {
        "weakTopics": ["JavaScript", "React"],
        "targetDifficulty": "medium"
      }
    }
  }
  ```

### Get Attempt Details
- **Endpoint**: `GET /api/quiz/:attemptId`
- **Description**: Fetches an active or historic attempt. If active, the `correctAnswer` and `explanation` are omitted to prevent cheating.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Quiz attempt fetched",
    "data": {
      "attemptId": "603d2e1c9b1d92305a415b88",
      "status": "in-progress",
      "timeLimitMinutes": 15,
      "questions": [
        {
          "questionId": "603d2e1c9b1d92305a415a11",
          "topic": "JavaScript",
          "type": "mcq",
          "difficulty": "medium",
          "questionText": "What does `typeof null` return?",
          "options": ["object", "null", "undefined", "string"],
          "userAnswer": "",
          "isFlagged": false
        }
      ]
    }
  }
  ```

### Save Question Answer
- **Endpoint**: `PATCH /api/quiz/:attemptId/answer`
- **Request Body**:
  ```json
  {
    "questionId": "603d2e1c9b1d92305a415a11",
    "userAnswer": "object",
    "isFlagged": true,
    "timeSpentSeconds": 14
  }
  ```
- **Response (`200 OK`)**: Saves the answer and progress state dynamically.

### Submit Quiz Attempt
- **Endpoint**: `POST /api/quiz/:attemptId/submit`
- **Description**: Submits the attempt, runs answers evaluation, records mistakes, logs score history, and updates learning profile.
- **Response (`200 OK`)**: Returns results breakdown including correct answers and explanations.

### Get Quiz History
- **Endpoint**: `GET /api/quiz/history`
- **Response (`200 OK`)**: Returns a list of all completed attempts.

### Get Performance Stats
- **Endpoint**: `GET /api/quiz/stats`
- **Response (`200 OK`)**: Returns high-level statistics like total attempts, average accuracy, and topic accuracy mappings.

---

## 5. Backend Adaptive Engine Rules

### 1. Weak Topic Extraction
- Extracts all topics where `masteryScore` is below `60%`.
- Merges these with topics present in the user's `mistakeHistory`.
- If no topics are logged yet, defaults to `["JavaScript", "React", "Node.js"]`.

### 2. Difficulty Progression
Evaluates the student's `overallMasteryScore` to set target question difficulty:
- **Mastery < 40%**: `easy`
- **Mastery 40% - 69%**: `medium`
- **Mastery >= 70%**: `hard`

### 3. Evaluator Scoring Logic
- **MCQ / Code Output**: Exact match comparison after trimming, lowercasing, and normalizing whitespace.
- **Short Answer**: Checks if the student's normalized answer contains any of the pipe-separated (`|`) correct answer keywords.
