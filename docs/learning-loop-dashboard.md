# Module 5: Adaptive Learning Loop & Student Dashboard

## 1. Module Overview & Purpose
The Student Dashboard serves as the central cockpit for students using the AI Career Intelligence Engine (ACIE). The backend implements an Adaptive Learning Loop that tracks topic-level mastery over time, schedules reviews based on Spaced Repetition, and adjusts platform content difficulty dynamically to optimize the learning path.

Key features include:
1. **Aggregated Dashboard API**: A single endpoint that queries all widget states (pending tasks, revisions, heatmaps, recent activities, roadmap).
2. **Topic Mastery & Heatmap Tracking**: Tracks topic-level mastery using a composite score weighing quiz scores, assignments, and repetition consistency.
3. **Adaptive Spaced Repetition Loop**: Manages revision workflows by raising/lowering difficulty, flagging student risk levels, and generating dynamic weekly roadmaps.

---

## 2. Component Reference

### Frontend Views
1. **Student Dashboard UI**: Highlights the upcoming quiz attempt target, pending assignments, high-risk flags, recommended study actions, and active learning statistics.
2. **Topic Mastery Heatmap Visualization**: Displays color-coded grid nodes indicating mastery level classifications for all tracked skills and topics.
3. **Daily Study Plan Roadmap**: Displays a dynamic 7-day chronological calendar outlining planned quizzes, pending assignments, and spaced repetition tasks.
4. **Performance Trend Charts**: Graphs tracking historical metrics such as quiz accuracy progression, Career Readiness Score (CRS), and assignment evaluations.

---

## 3. Database Schemas

### User Learning Profile Sub-document (`User.learningProfile`)
Embedded inside the user schema, tracking mastery states, risk levels, and mistake histories.

| Field | Type | Description |
| :--- | :--- | :--- |
| `targetRole` | `String` | Career target role (e.g., "Full-Stack Developer"). Default: `"Full-Stack Developer"`. |
| `overallMasteryScore`| `Number` | Mathematical average of all topic mastery scores. Default: `0`. |
| `riskLevel` | `String` | Calculated platform risk tier: `low`, `moderate`, or `high`. Default: `"high"`. |
| `topicMastery` | `[Object]` | Array of individual topic mastery sub-documents (structured below). |
| `mistakeHistory` | `[Object]` | Chronological history of incorrect answers for targeted revision targeting. |

#### Topic Mastery Object Structure
Tracks mastery and consistency counts on a per-topic basis.

| Field | Type | Description |
| :--- | :--- | :--- |
| `topicName` | `String` | Name of the skill/topic evaluated (e.g. "React Hooks", "SQL Joins"). |
| `masteryScore` | `Number` | Composite mastery score (`0 - 100`) calculated by formula. |
| `quizAccuracy` | `Number` | Most recent quiz accuracy percentage. Default: `0`. |
| `assignmentScore` | `Number` | Most recent evaluated assignment score. Default: `0`. |
| `attemptsCount` | `Number` | Total number of interactions (used for consistency tracking). Default: `0`. |

### Spaced Repetition Schema (`SpacedRepetition`)
Tracks review schedules for weak topics.

| Field | Type | Description |
| :--- | :--- | :--- |
| `user` | `ObjectId` | Reference to the `User`. Required. |
| `topic` | `String` | Skill topic scheduled for review. Required. |
| `intervalDays` | `Number` | Current review interval in days. Default: `1`. |
| `easeFactor` | `Number` | Modifier for spaced repetition interval adjustments. Default: `2.5`. |
| `lastScore` | `Number` | Review score recorded during last iteration. |
| `nextReviewAt` | `Date` | Timestamp of scheduled review. |
| `status` | `String` | Review state: `scheduled`, `completed`, or `overdue`. |

---

## 4. API Reference Documentation

All endpoints are protected under the base `/api/dashboard` prefix and require a valid auth token.

### Get Aggregated Student Dashboard
- **Endpoint**: `GET /api/dashboard`
- **Description**: Returns all aggregated widgets, status indicators, roadmap steps, heatmap blocks, and focus area recommendations in a single call.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Dashboard data fetched",
    "data": {
      "user": {
        "name": "Jane Doe",
        "role": "student",
        "targetRole": "Full-Stack Developer"
      },
      "overview": {
        "overallMasteryScore": 72,
        "riskLevel": "moderate",
        "resumeScore": 85,
        "quizAvgAccuracy": 78,
        "totalQuizAttempts": 12
      },
      "masteryHeatmap": [
        { "topicName": "React Hooks", "masteryScore": 82 },
        { "topicName": "SQL Joins", "masteryScore": 45 }
      ],
      "upcomingTasks": {
        "assignments": [
          {
            "id": "603d2e1c9b1d92305a415c11",
            "title": "React Context Lab",
            "topic": "React Hooks",
            "dueDate": "2026-07-15T00:00:00.000Z",
            "difficulty": "medium"
          }
        ],
        "revisions": [
          {
            "topic": "SQL Joins",
            "nextReviewAt": "2026-07-11T12:00:00.000Z",
            "status": "scheduled",
            "lastScore": 50
          }
        ]
      },
      "highRiskItems": [
        {
          "type": "mastery",
          "title": "Critical gap: SQL Joins",
          "severity": "high",
          "message": "Mastery at 45% — immediate review recommended."
        }
      ],
      "recommendedActions": [
        {
          "action": "take_quiz",
          "label": "Practice SQL Joins with an adaptive quiz",
          "priority": "high",
          "route": "/quiz"
        }
      ],
      "studyRoadmap": [
        {
          "day": "Today",
          "date": "2026-07-11",
          "tasks": [
            { "type": "quiz", "label": "Quiz: SQL Joins", "duration": "15 min" }
          ]
        }
      ],
      "recentActivity": {
        "quizzes": [],
        "completedAssignments": []
      },
      "adaptiveFeedback": {
        "suggestedDifficulty": "medium",
        "focusTopics": ["SQL Joins"],
        "spacedRepetitionDue": 1
      }
    }
  }
  ```

### Get Topic Mastery Heatmap
- **Endpoint**: `GET /api/dashboard/mastery`
- **Response (`200 OK`)**: Returns a lists of topics and their detailed mastery records.

### Force Recalculate User Mastery
- **Endpoint**: `POST /api/dashboard/mastery/recalculate`
- **Response (`200 OK`)**: Re-runs overall mastery and risk level calculations for the user, returning the fresh `learningProfile`.

---

## 5. Adaptive Learning Loop Algorithms

### 1. Topic Mastery Formula
Topic mastery is computed as a weighted average combining quiz accuracy, assignment performance, and engagement consistency:

$$\text{Topic Mastery} = (\text{Quiz Accuracy} \times 0.50) + (\text{Assignment Score} \times 0.30) + (\text{Consistency} \times 0.20)$$

Where:
- **Consistency** is calculated as:
  $$\text{Consistency} = \min(100, \text{attemptsCount} \times 25)$$

### 2. Overall Mastery & Risk Classification
- **Overall Mastery Score**: Arithmetic mean of all topics' `masteryScore`.
- **Student Risk Level**:
  - **Overall Mastery $\ge$ 75%**: `low` risk (Highly Ready)
  - **Overall Mastery 50% - 74%**: `moderate` risk (Developing)
  - **Overall Mastery < 50%**: `high` risk (Needs Significant Improvement)
