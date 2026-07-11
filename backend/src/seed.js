import dotenv from "dotenv";
dotenv.config({ override: true });

import connectDB from "./config/db.config.js";
import { Question } from "./models/quiz.model.js";
import { Assignment } from "./models/assignment.model.js";

const questions = [
  {
    topic: "JavaScript",
    type: "mcq",
    difficulty: "easy",
    questionText: "What does `typeof null` return in JavaScript?",
    options: ["null", "undefined", "object", "number"],
    correctAnswer: "object",
    explanation: "This is a well-known JavaScript quirk — typeof null returns 'object'.",
    tags: ["types", "fundamentals"],
  },
  {
    topic: "JavaScript",
    type: "code-output",
    difficulty: "medium",
    questionText: "What is the output of: console.log([1, 2, 3].map(n => n * 2).filter(n => n > 3));",
    options: ["[2, 4, 6]", "[4, 6]", "[1, 2, 3]", "[6]"],
    correctAnswer: "[4, 6]",
    explanation: "map doubles values to [2,4,6], filter keeps values > 3.",
    tags: ["arrays", "functional"],
  },
  {
    topic: "JavaScript",
    type: "short-answer",
    difficulty: "hard",
    questionText: "What keyword is used to declare a block-scoped variable in ES6?",
    options: [],
    correctAnswer: "let|const",
    explanation: "Both let and const are block-scoped ES6 declarations.",
    tags: ["es6"],
  },
  {
    topic: "React",
    type: "mcq",
    difficulty: "easy",
    questionText: "Which hook is used to manage local state in a functional component?",
    options: ["useEffect", "useState", "useContext", "useReducer"],
    correctAnswer: "useState",
    explanation: "useState is the primary hook for local component state.",
    tags: ["hooks"],
  },
  {
    topic: "React",
    type: "mcq",
    difficulty: "medium",
    questionText: "What is the purpose of the useEffect hook?",
    options: [
      "Manage form state",
      "Perform side effects after render",
      "Create context providers",
      "Memoize expensive calculations",
    ],
    correctAnswer: "Perform side effects after render",
    explanation: "useEffect runs side effects like data fetching after renders.",
    tags: ["hooks", "side-effects"],
  },
  {
    topic: "React",
    type: "code-output",
    difficulty: "hard",
    questionText: "In React 18+, what does StrictMode do in development?",
    options: [
      "Disables hooks",
      "Double-invokes effects to detect side effects",
      "Enables server-side rendering",
      "Removes console warnings",
    ],
    correctAnswer: "Double-invokes effects to detect side effects",
    explanation: "StrictMode intentionally double-invokes certain lifecycles in dev.",
    tags: ["strict-mode"],
  },
  {
    topic: "Node.js",
    type: "mcq",
    difficulty: "easy",
    questionText: "Which module is used to create an HTTP server in Node.js?",
    options: ["fs", "http", "path", "os"],
    correctAnswer: "http",
    explanation: "The built-in http module creates HTTP servers.",
    tags: ["core-modules"],
  },
  {
    topic: "Node.js",
    type: "short-answer",
    difficulty: "medium",
    questionText: "What is the default package manager bundled with Node.js?",
    options: [],
    correctAnswer: "npm",
    explanation: "npm ships with Node.js installations.",
    tags: ["tooling"],
  },
  {
    topic: "MongoDB",
    type: "mcq",
    difficulty: "medium",
    questionText: "Which operator is used to match documents where a field value is in a given array?",
    options: ["$eq", "$in", "$gt", "$ne"],
    correctAnswer: "$in",
    explanation: "$in selects documents where field value is in the specified array.",
    tags: ["query-operators"],
  },
  {
    topic: "MongoDB",
    type: "mcq",
    difficulty: "hard",
    questionText: "What does the $lookup aggregation stage do?",
    options: [
      "Sorts documents",
      "Performs a left outer join",
      "Groups documents",
      "Limits results",
    ],
    correctAnswer: "Performs a left outer join",
    explanation: "$lookup joins documents from another collection.",
    tags: ["aggregation"],
  },
  {
    topic: "SQL",
    type: "mcq",
    difficulty: "easy",
    questionText: "Which SQL clause is used to filter rows?",
    options: ["GROUP BY", "ORDER BY", "WHERE", "HAVING"],
    correctAnswer: "WHERE",
    explanation: "WHERE filters rows before grouping.",
    tags: ["fundamentals"],
  },
  {
    topic: "SQL",
    type: "code-output",
    difficulty: "medium",
    questionText: "What does JOIN do in SQL?",
    options: [
      "Deletes rows",
      "Combines rows from two or more tables",
      "Creates a new table",
      "Indexes a column",
    ],
    correctAnswer: "Combines rows from two or more tables",
    explanation: "JOIN combines related data across tables.",
    tags: ["joins"],
  },
  {
    topic: "Docker",
    type: "mcq",
    difficulty: "medium",
    questionText: "What is a Dockerfile used for?",
    options: [
      "Run containers",
      "Define how to build a container image",
      "Monitor container logs",
      "Scale Kubernetes pods",
    ],
    correctAnswer: "Define how to build a container image",
    explanation: "A Dockerfile contains instructions to build an image.",
    tags: ["containers"],
  },
  {
    topic: "REST APIs",
    type: "mcq",
    difficulty: "easy",
    questionText: "Which HTTP method is typically used to create a new resource?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correctAnswer: "POST",
    explanation: "POST is conventionally used for resource creation.",
    tags: ["http"],
  },
  {
    topic: "TypeScript",
    type: "short-answer",
    difficulty: "medium",
    questionText: "What TypeScript feature allows defining reusable type shapes?",
    options: [],
    correctAnswer: "interface|type alias",
    explanation: "Interfaces and type aliases define reusable type shapes.",
    tags: ["types"],
  },
];

const assignments = [
  {
    title: "Build a REST API with Express",
    description:
      "Create a RESTful API with CRUD endpoints for a 'tasks' resource. Include validation, error handling, and MongoDB integration.",
    type: "coding",
    topic: "Node.js",
    difficulty: "medium",
    estimatedHours: 3,
    dueInDays: 7,
    conceptBenchmarks: [
      { concept: "Express Routing", weight: 2, keywords: ["express", "router", "route", "middleware"] },
      { concept: "CRUD Operations", weight: 3, keywords: ["create", "read", "update", "delete", "crud", "post", "get", "put"] },
      { concept: "MongoDB Integration", weight: 2, keywords: ["mongoose", "mongodb", "schema", "model", "database"] },
      { concept: "Error Handling", weight: 1, keywords: ["error", "try catch", "status code", "validation"] },
    ],
  },
  {
    title: "React Todo App with State Management",
    description:
      "Build a todo application using React hooks. Support add, toggle, delete, and filter operations with a clean component structure.",
    type: "mini-project",
    topic: "React",
    difficulty: "easy",
    estimatedHours: 2,
    dueInDays: 5,
    conceptBenchmarks: [
      { concept: "Component Architecture", weight: 2, keywords: ["component", "props", "jsx", "render"] },
      { concept: "State Management", weight: 3, keywords: ["usestate", "state", "hook", "setstate"] },
      { concept: "Event Handling", weight: 2, keywords: ["onclick", "onchange", "handler", "event"] },
      { concept: "List Rendering", weight: 1, keywords: ["map", "key", "list", "filter"] },
    ],
  },
  {
    title: "Design a Scalable Chat System",
    description:
      "Design a real-time chat system architecture. Cover WebSocket connections, message delivery, scaling, and data storage.",
    type: "system-design",
    topic: "Node.js",
    difficulty: "hard",
    estimatedHours: 4,
    dueInDays: 10,
    conceptBenchmarks: [
      { concept: "WebSocket Architecture", weight: 3, keywords: ["websocket", "socket.io", "real-time", "bidirectional"] },
      { concept: "Scalability", weight: 2, keywords: ["scale", "load balancer", "horizontal", "redis", "pub sub"] },
      { concept: "Data Storage", weight: 2, keywords: ["database", "message queue", "caching", "persistence"] },
      { concept: "Reliability", weight: 1, keywords: ["acknowledgment", "retry", "delivery guarantee", "fault tolerance"] },
    ],
  },
  {
    title: "JavaScript Array Manipulation Challenge",
    description:
      "Solve array manipulation problems: flatten nested arrays, group by property, and implement custom map/filter/reduce.",
    type: "coding",
    topic: "JavaScript",
    difficulty: "medium",
    estimatedHours: 2,
    dueInDays: 5,
    conceptBenchmarks: [
      { concept: "Array Methods", weight: 3, keywords: ["map", "filter", "reduce", "foreach", "array"] },
      { concept: "Recursion", weight: 2, keywords: ["recursive", "recursion", "base case", "nested"] },
      { concept: "Functional Programming", weight: 2, keywords: ["immutable", "pure function", "callback", "higher-order"] },
    ],
  },
  {
    title: "MongoDB Schema Design for E-Commerce",
    description:
      "Design MongoDB schemas for an e-commerce platform with users, products, orders, and reviews. Explain embedding vs referencing.",
    type: "system-design",
    topic: "MongoDB",
    difficulty: "medium",
    estimatedHours: 3,
    dueInDays: 8,
    conceptBenchmarks: [
      { concept: "Schema Design", weight: 3, keywords: ["schema", "embed", "reference", "denormalize", "collection"] },
      { concept: "Indexing Strategy", weight: 2, keywords: ["index", "compound index", "query performance"] },
      { concept: "Data Relationships", weight: 2, keywords: ["one-to-many", "many-to-many", "relationship", "foreign key"] },
    ],
  },
];

async function seed() {
  await connectDB();

  const existingQuestions = await Question.countDocuments();
  if (existingQuestions === 0) {
    await Question.insertMany(questions);
    console.log(`Seeded ${questions.length} quiz questions`);
  } else {
    console.log(`Skipping questions — ${existingQuestions} already exist`);
  }

  const existingAssignments = await Assignment.countDocuments();
  if (existingAssignments === 0) {
    await Assignment.insertMany(assignments);
    console.log(`Seeded ${assignments.length} assignments`);
  } else {
    console.log(`Skipping assignments — ${existingAssignments} already exist`);
  }

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
