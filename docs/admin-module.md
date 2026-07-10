# Module 8: Admin & Platform Management

## 1. Module Overview & Purpose
The Admin & Platform Management module is the administrative layer of the AI Career Intelligence Engine (ACIE). It allows administrators and staff to:
1. **Manage Platform Users**: Access complete student profiles, toggle account activation status (`isActive`), and assign specialized roles (student, admin, judge).
2. **Control Platform Content**: Perform CRUD operations on the unified question bank (for both quiz questions and verbal mock interview questions) and define required skill/topic maps.
3. **Analyze Cohort Performance**: Extract cohort-level summaries, track average Career Readiness Scores (CRS), review Interview Readiness Score (IRS) distributions, and identify high-risk users.

---

## 2. API Reference Documentation

All endpoints listed below are protected and require:
- A valid Bearer Token (`protect` middleware)
- Admin role authorization (`adminOnly` middleware / `role === "admin"`)

### User Management APIs

#### List Users
- **Endpoint**: `GET /api/admin/users`
- **Query Params**:
  - `page` (Optional, Default: `1`): Current page index.
  - `limit` (Optional, Default: `20`): Page size.
  - `search` (Optional): Query matching username or email (case-insensitive).
  - `role` (Optional): Filter by `student`, `admin`, or `judge`.
  - `status` (Optional): Filter by `active` or `inactive`.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": {
      "users": [
        {
          "_id": "603d2e1c9b1d92305a415a77",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "role": "student",
          "isActive": true,
          "createdAt": "2026-07-10T12:00:00.000Z"
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 20,
        "totalPages": 1
      }
    }
  }
  ```

#### Get User Detail
- **Endpoint**: `GET /api/admin/users/:id`
- **Response**: Returns full user info including `learningProfile` and `resumeData` sub-documents.

#### Update User Role
- **Endpoint**: `PATCH /api/admin/users/:id/role`
- **Request Body**: `{ "role": "admin" }` (Valid: `student`, `admin`, `judge`)

#### Toggle Account Status
- **Endpoint**: `PATCH /api/admin/users/:id/status`
- **Request Body**: `{ "isActive": false }`

---

### Question Bank CRUD APIs

#### List Questions
- **Endpoint**: `GET /api/admin/questions`
- **Query Params**: `type` (quiz/interview), `topic`, `role`, `difficulty`, `page`, `limit`
- **Response**: Returns lists of unified questions populated with the user details of the creator.

#### Create Question
- **Endpoint**: `POST /api/admin/questions`
- **Request Body (Quiz Type)**:
  ```json
  {
    "text": "What is a React custom hook?",
    "type": "quiz",
    "topic": "React Hooks",
    "targetRole": "Frontend Developer",
    "difficulty": "Easy",
    "options": ["A JavaScript function", "A database query", "A style library", "An HTML selector"],
    "correctAnswer": "A JavaScript function"
  }
  ```
- **Request Body (Interview Type)**:
  ```json
  {
    "text": "Explain the concept of Virtual DOM in React.",
    "type": "interview",
    "topic": "React Core",
    "targetRole": "Frontend Developer",
    "difficulty": "Medium",
    "expectedKeywords": ["reconciliation", "diffing algorithm", "performance"],
    "idealResponseHint": "Explain how React computes state changes in memory before rendering."
  }
  ```

#### Update Question
- **Endpoint**: `PUT /api/admin/questions/:id`

#### Delete Question
- **Endpoint**: `DELETE /api/admin/questions/:id`

---

### Role-Skill Mapping APIs

#### List Mappings
- **Endpoint**: `GET /api/admin/role-skills`

#### Create Mapping
- **Endpoint**: `POST /api/admin/role-skills`
- **Request Body**:
  ```json
  {
    "role": "Backend Developer",
    "skills": ["Node.js", "Express.js", "MongoDB", "SQL"],
    "topics": ["REST APIs", "Database Indexing", "Caching Strategies"],
    "description": "Primary track for backend engineers."
  }
  ```

#### Update Mapping
- **Endpoint**: `PUT /api/admin/role-skills/:id`

#### Delete Mapping
- **Endpoint**: `DELETE /api/admin/role-skills/:id`

---

### Platform Aggregate Analytics Reporting API

#### Get Cohort Analytics Report
- **Endpoint**: `GET /api/admin/reports/aggregate`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Aggregate report generated successfully",
    "data": {
      "report": {
        "userStats": {
          "totalUsers": 24,
          "activeUsers": 22,
          "inactiveUsers": 2,
          "newUsersLast7Days": 3,
          "highRiskUserCount": 4
        },
        "cohortScores": {
          "cohortAverageCRS": 76,
          "cohortAverageIRS": 74,
          "cohortAverageCCI": 78,
          "totalScoreAttempts": 42
        },
        "irsDistribution": {
          "Highly Ready": 12,
          "Moderately Ready": 18,
          "Developing": 8,
          "Needs Significant Improvement": 4
        },
        "platformEngagement": {
          "totalAssignments": 50,
          "completedAssignments": 35,
          "avgAssignmentScore": 82
        }
      }
    }
  }
  ```

---

## 3. Role-Based Access Control (RBAC) Architecture

All admin endpoints enforce access control through authorization chaining:
1. **Authentication Guard (`protect`)**: Reads credentials from headers (`Authorization: Bearer <JWT>`) or cookie stores. Validates the signature, ensures the user account exists, and sets `req.user`.
2. **Admin Authorization Guard (`adminOnly`)**: Restricts incoming calls to users where `role === "admin"`. Employs the reusable `authorizeRoles` factory. If unauthorized, returns a `403 Forbidden` response.
3. **Self-Demotion Prevention**: The update-role and update-status endpoints prevent the currently logged-in administrator from updating their own status/role to prevent platform lockouts.

---

## 4. Aggregation & Reporting Logic

The aggregate reporting engine leverages MongoDB Aggregation pipelines:
- **Cohort Average Calculation**: Evaluates numerical fields in `ScoreHistory` using `$group` and the `$avg` operator.
  ```javascript
  {
    $group: {
      _id: null,
      avgCRS: { $avg: "$CRS" },
      avgIRS: { $avg: "$IRS" },
      avgCCI: { $avg: "$CCI" }
    }
  }
  ```
- **IRS Distribution Bucket Aggregation**: Counts user attempts categorizing them by classification labels.
- **Engagement Ratios**: Aggregates total assignments generated and evaluates user completion percentages across `status === "completed"`.

---

## 5. Setup & Local Installation Notes

1. **Verify Environment Variables**: Verify that `VITE_API_URL` points to the correct backend host (usually `http://localhost:5000/api`).
2. **First Admin Initialization**: Set a user's role to `"admin"` directly in MongoDB using a database GUI or script:
   ```javascript
   db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
   ```
3. **Vite Routing Guard**: Admin routes on the frontend are wrapped in the `<ProtectedRoute adminOnly={true}>` component. Unprivileged user attempts will redirect to the home screen.
