import InterviewQuestion from "../models/interviewQuestion.model.js";

// Sample questions seed data
const SEED_QUESTIONS = [
  // --- Technical Verticals ---
  {
    vertical: "Technical",
    difficulty: "Medium",
    questionText: "Explain how React's Virtual DOM works, focusing on the diffing algorithm, fiber reconciliation, and key-based list updates.",
    idealKeywords: ["Virtual DOM", "diffing", "reconciliation", "fiber", "state", "props", "render", "keys", "component"],
    roles: ["Full-Stack Developer", "Frontend Developer"],
    sampleAnswer: "React maintains an in-memory representation of the UI called the Virtual DOM. When state or props change, a new Virtual DOM tree is generated. React's diffing algorithm compares the new tree with the previous one. To perform this efficiently in O(n) time, React assumes that two elements of different types will produce different trees, and that keys can identify elements across renders. The Reconciliation process (using React Fiber since version 16) schedules and breaks down work into units, updating the real DOM only with the differences, minimizing expensive reflows.",
    rubric: {
      keywordRelevance: "Mention virtual DOM, diffing, reconciliation, and fiber.",
      technicalDepth: "Detail the tree comparison time complexity O(n) and the purpose of Fiber.",
      logicalStructure: "Structure the answer chronologically: state change, Virtual DOM creation, diffing, real DOM updates.",
      domainTerminology: "Use specific React vocabulary like Fiber, Reconciliation, Diffing, Key-attribute.",
      completeness: "Clearly connect the role of keys in optimizing list re-renders."
    }
  },
  {
    vertical: "Technical",
    difficulty: "Easy",
    questionText: "What is the CSS Box Model? Explain the differences between content-box and border-box sizing and how box-sizing affects layout sizing calculations.",
    idealKeywords: ["margin", "border", "padding", "content", "box-sizing", "border-box", "content-box", "width", "height"],
    roles: ["Full-Stack Developer", "Frontend Developer"],
    sampleAnswer: "The CSS Box Model consists of content, padding, border, and margin. In the default 'content-box' sizing, the width and height of an element apply only to the content area. Padding and borders are added to the outside, increasing the element's actual size on screen. In 'border-box' sizing, the width and height include content, padding, and border. Adding padding or borders shrinks the content area instead of increasing the total element width, making responsive layout dimensions much more predictable.",
    rubric: {
      keywordRelevance: "Mention content, padding, border, margin, border-box.",
      technicalDepth: "Explain the math behind width and height calculations under both models.",
      logicalStructure: "Define the box model components, compare content-box vs border-box, and explain application.",
      domainTerminology: "Use terms like box-sizing property, padding box, border box.",
      completeness: "Clearly state how layouts become easier to manage using border-box."
    }
  },
  {
    vertical: "Technical",
    difficulty: "Medium",
    questionText: "Explain how Node.js handles asynchronous operations under the hood using the Event Loop, libuv pool, and thread delegation.",
    idealKeywords: ["event loop", "asynchronous", "single thread", "libuv", "thread pool", "callback", "non-blocking", "event-driven", "promises"],
    roles: ["Full-Stack Developer", "Backend Developer"],
    sampleAnswer: "Node.js is single-threaded but handles highly concurrent, non-blocking I/O operations. It does this by offloading tasks to the system kernel or the libuv thread pool for file system, cryptography, or network operations. The Event Loop is the orchestrator. It cycles through phases: timers (setTimeout), I/O callbacks, poll phase (new events), check phase (setImmediate), and close callbacks. Microtasks (process.nextTick and Promise resolvers) are executed immediately after the current operation finishes, before moving to the next event loop phase.",
    rubric: {
      keywordRelevance: "Mention Event Loop, libuv, thread pool, and non-blocking I/O.",
      technicalDepth: "Differentiate between microtask queue (Promises) and macrotask queue phases.",
      logicalStructure: "Outline Node's single-threaded nature, transition to libuv threads, and cycle of phases.",
      domainTerminology: "Use specific engine terms: Event Loop, call stack, microtask queue, thread pool delegation.",
      completeness: "Explain how blocking the event loop affects scaling and user request latency."
    }
  },
  {
    vertical: "Technical",
    difficulty: "Medium",
    questionText: "How do Docker layers work? Explain how Docker uses image layer caching, copy-on-write mechanisms, and why multi-stage builds are beneficial.",
    idealKeywords: ["Docker", "layer", "caching", "multi-stage", "image", "copy-on-write", "builder", "run", "size"],
    roles: ["DevOps Engineer"],
    sampleAnswer: "Docker images are built as a read-only stack of layers. Each instruction in a Dockerfile (like RUN, COPY, ADD) creates a new layer. Docker uses layer caching: if a layer's contents and the layers before it have not changed, Docker reuses the cached layer, speeding up builds. Layers utilize a copy-on-write (CoW) storage driver, where modified files are copied to the top writeable layer. Multi-stage builds use multiple FROM instructions. You compile code in a heavy build container, then copy only the compiled binaries into a minimal runtime image, reducing image size and the attack surface.",
    rubric: {
      keywordRelevance: "Docker layers, caching, copy-on-write, multi-stage builds.",
      technicalDepth: "Explain the difference between build-time layers and the container's thin read-write runtime layer.",
      logicalStructure: "Discuss image layer stacking, caching constraints, copy-on-write operations, and multi-stage benefits.",
      domainTerminology: "Use DevOps terms: storage driver, intermediate layers, base image, runtime footprint.",
      completeness: "Clearly state why smaller image sizes benefit deployment speed and security."
    }
  },
  {
    vertical: "Technical",
    difficulty: "Medium",
    questionText: "Explain the bias-variance trade-off in machine learning models. How do regularization methods (like L1/L2) affect these metrics?",
    idealKeywords: ["bias", "variance", "overfitting", "underfitting", "regularization", "L1", "L2", "trade-off", "cross-validation"],
    roles: ["Data Scientist"],
    sampleAnswer: "The bias-variance trade-off is a fundamental ML concept. Bias represents error due to erroneous assumptions in the algorithm (leads to underfitting). Variance represents sensitivity to small fluctuations in the training set (leads to overfitting). A complex model has low bias but high variance. Regularization prevents overfitting by adding a penalty to the loss function. L1 regularization (Lasso) adds an absolute weight penalty, driving coefficients to zero (feature selection). L2 regularization (Ridge) adds a squared weight penalty, shrinking coefficients. Both increase bias slightly to achieve a much larger decrease in variance.",
    rubric: {
      keywordRelevance: "Explain bias, variance, overfitting, regularization, L1/L2 penalties.",
      technicalDepth: "Formulate how the loss function changes with Lasso and Ridge penalties.",
      logicalStructure: "Define bias and variance, describe the inverse relationship, explain regularization, and compare L1 vs L2.",
      domainTerminology: "Use specific ML vocabulary: loss function, coefficients shrinkage, feature selection, generalizability.",
      completeness: "Explain how to choose the optimal point in the trade-off curve (using cross-validation)."
    }
  },

  // --- System Design Verticals ---
  {
    vertical: "System Design",
    difficulty: "Medium",
    questionText: "Describe the Cache-Aside architecture. Explain how you prevent cache invalidation issues, cache stampede (dogpiling), and cache penetration.",
    idealKeywords: ["cache", "Redis", "cache-aside", "invalidation", "stampede", "penetration", "TTL", "bloom filter", "mutex"],
    roles: ["Full-Stack Developer", "Backend Developer", "Frontend Developer"],
    sampleAnswer: "In Cache-Aside, the application queries the cache first. If a hit occurs, data is returned. On a miss, data is read from the database, written to the cache, and returned. For invalidation, we update the DB and delete the cache entry to prevent stale data. Cache Stampede occurs when a hot key expires and concurrent requests hit the database at once; we mitigate this using locking (mutex) or background pre-warming. Cache Penetration happens when requests seek non-existent keys, hitting the DB repeatedly. We solve this by caching null values with a short TTL or using a Bloom Filter.",
    rubric: {
      keywordRelevance: "Explain Cache-Aside workflow, invalidation, stampede, and penetration remedies.",
      technicalDepth: "Explain the implementation of a Bloom Filter or mutex locks in caching layers.",
      logicalStructure: "Define Cache-Aside, explain the 3 main failure/edge scenarios, and present mitigation techniques.",
      domainTerminology: "Use architectural terms: TTL, Bloom Filter, lock/mutex, cache miss, cache hit ratio, stale data.",
      completeness: "Address both reading and writing operations in the Cache-Aside pattern."
    }
  },
  {
    vertical: "System Design",
    difficulty: "Hard",
    questionText: "Design a scalable, highly available real-time streaming data pipeline for credit card fraud detection. The system must process events within 100ms.",
    idealKeywords: ["Kafka", "streaming", "pipeline", "latency", "Flink", "Spark", "features", "inference", "model", "cache", "throughput"],
    roles: ["Data Scientist", "DevOps Engineer", "Backend Developer"],
    sampleAnswer: "To ingest and process credit card transactions within 100ms, we design a low-latency event-driven pipeline. Transactions are ingested into Apache Kafka topics partitioned by cardholder ID to ensure order. A streaming engine like Apache Flink consumes messages. Flink maintains low-latency state and enriches transactions with historical features loaded from an in-memory database like Redis. The enriched record is sent to a microservice hosting the machine learning fraud detection model (e.g., using Triton or a custom gRPC server). The model performs inference and publishes alerts back to Kafka for real-time blocking.",
    rubric: {
      keywordRelevance: "Mention Kafka partitions, Flink/Spark streaming, Redis feature store, and gRPC model inference.",
      technicalDepth: "Explain the choice of Flink over Spark Streaming for sub-100ms element-by-element processing.",
      logicalStructure: "Structure by data stages: Ingestion, Processing/Enrichment, Machine Learning Inference, and Action/Alerting.",
      domainTerminology: "Use streaming terms: message queue partitioning, stateful stream processing, feature store, gRPC latency.",
      completeness: "Specifically address how the sub-100ms latency requirement is guaranteed at each step."
    }
  },
  {
    vertical: "System Design",
    difficulty: "Medium",
    questionText: "Design a secure, highly available CI/CD deployment architecture for containerized microservices to AWS EKS with zero-downtime.",
    idealKeywords: ["CI/CD", "AWS", "EKS", "Kubernetes", "load balancer", "canary", "blue-green", "pipeline", "secrets", "Helm"],
    roles: ["DevOps Engineer", "Backend Developer"],
    sampleAnswer: "A highly available CI/CD pipeline starts with code commits triggering a GitHub Actions or GitLab CI pipeline. The pipeline runs linting, tests, builds a Docker image, scans it for vulnerabilities, and pushes it to AWS ECR. For deployment, we use GitOps (ArgoCD or Helm) pointing to AWS EKS. The EKS cluster spans multiple Availability Zones. We achieve zero-downtime using rolling updates (with proper readiness/liveness probes) or Blue-Green / Canary deployments managed by an AWS Application Load Balancer and Kubernetes Ingress. Secrets are stored securely in AWS Secrets Manager and mounted dynamically.",
    rubric: {
      keywordRelevance: "Mention GitOps, EKS multi-AZ, zero-downtime deployment strategies, and secrets management.",
      technicalDepth: "Differentiate between blue-green and canary deployments in Kubernetes context.",
      logicalStructure: "Divide into CI (build, test, push) and CD (GitOps, deployment strategy, EKS high availability).",
      domainTerminology: "Use cloud/K8s terms: Availability Zones, Ingress, ArgoCD, Helm chart, readinessProbe, rolling update.",
      completeness: "Explain how rollback occurs automatically if health checks or liveness probes fail."
    }
  },

  // --- Project Deep-Dive Verticals ---
  {
    vertical: "Project Deep-Dive",
    difficulty: "Hard",
    questionText: "Describe your systematic methodology to debug, isolate, and optimize a backend API endpoint that takes 5 seconds to respond due to database queries.",
    idealKeywords: ["index", "explain", "execution plan", "join", "query optimization", "profiler", "n+1", "connection pool", "select"],
    roles: ["Full-Stack Developer", "Backend Developer"],
    sampleAnswer: "First, I isolate the issue using logging and tracing tools (APM) to verify the database is the bottleneck. Next, I profile the database calls using EXPLAIN ANALYZE on the SQL queries to inspect the query execution plan, checking for table scans instead of index scans. I look for the N+1 query problem, where related entities are fetched in a loop; I resolve this using JOINs or eager loading. I create indexes on fields used in WHERE and JOIN clauses. I also verify database connection pooling, ensure only required columns are in SELECT (avoiding SELECT *), and cache slow-changing results in Redis.",
    rubric: {
      keywordRelevance: "Explain query profiling, EXPLAIN execution plans, indexing, N+1 query fixes, and selective columns.",
      technicalDepth: "Explain database indexing mechanics (B-Trees) and how connection pool limits affect latency.",
      logicalStructure: "Outline a step-by-step troubleshooting protocol: Isolate/Trace, Profile/Explain, Refactor queries, Cache/Index, Verify.",
      domainTerminology: "Use database terms: table scan, index scan, N+1 problem, connection pool saturation, query optimizer.",
      completeness: "Address both the database level (indexing, query design) and application level (pooling, caching)."
    }
  },
  {
    vertical: "Project Deep-Dive",
    difficulty: "Medium",
    questionText: "Discuss a web page performance optimization project. How did you diagnose, resolve, and measure improvements in Core Web Vitals (LCP, FID, CLS)?",
    idealKeywords: ["Core Web Vitals", "LCP", "FID", "CLS", "Lighthouse", "bundling", "lazy loading", "caching", "rendering", "images"],
    roles: ["Full-Stack Developer", "Frontend Developer"],
    sampleAnswer: "To optimize a slow web page, I analyze it using Lighthouse and Chrome DevTools. To improve Largest Contentful Paint (LCP), I compress images (WebP format), implement modern responsive source sets, and preload critical hero images. To optimize First Input Delay (FID, now Interaction to Next Paint), I reduce JavaScript execution time by code-splitting (dynamic imports), deferring non-critical scripts, and offloading heavy tasks. To solve Cumulative Layout Shift (CLS), I set explicit dimensions on images and ad containers, ensuring page elements do not shift dynamically during load.",
    rubric: {
      keywordRelevance: "Address LCP, FID/INP, CLS, code-splitting, image optimization, and Lighthouse testing.",
      technicalDepth: "Explain how code splitting reduces the main thread block time, directly improving responsiveness metrics.",
      logicalStructure: "Define the problem metric, state the audit tool, outline specific optimizations for each Core Web Vital, and describe verification.",
      domainTerminology: "Use frontend terms: Core Web Vitals, main thread blocking, code-splitting, dynamic imports, layout shift.",
      completeness: "Explain how to monitor performance continuously in production (Real User Monitoring vs Synthetic)."
    }
  },

  // --- Behavioral Verticals ---
  {
    vertical: "Behavioral",
    difficulty: "Medium",
    questionText: "Describe a situation where you had a significant technical disagreement with a team member. How did you handle the conflict, communicate, and reach alignment?",
    idealKeywords: ["conflict", "communication", "collaborate", "listen", "compromise", "empathy", "resolution", "alignment", "data-driven"],
    roles: ["Full-Stack Developer", "Backend Developer", "Frontend Developer", "DevOps Engineer", "Data Scientist"],
    sampleAnswer: "In a previous project, a team-mate wanted to use a NoSQL database while I favored a relational database. Instead of arguing, I scheduled a collaborative design review. I focused on active listening to understand their scalability concerns. We listed the system requirements: complex transactions, relational integrity, and structured reports. I presented data-driven arguments, showing that SQL met our latency targets and guaranteed ACID transactions, whereas NoSQL would require complex application-level joins. We compromised by using PostgreSQL, but caching document-like configurations in a JSONB column. This aligned our goals and maintained a strong working relationship.",
    rubric: {
      keywordRelevance: "Discuss active listening, collaborative review, data-driven decisions, compromise, and alignment.",
      technicalDepth: "Focus on interpersonal engineering: separating ideas from egos, constructing objective trade-off lists.",
      logicalStructure: "Follow the STAR method: Situation (NoSQL vs SQL), Task (choose DB, resolve conflict), Action (design review, trade-offs), Result (Postgres with JSONB, alignment).",
      domainTerminology: "Use collaboration terms: consensus, trade-off matrix, active listening, objective criteria, alignment.",
      completeness: "Conclude with the professional growth impact and relationship preservation."
    }
  },
  {
    vertical: "Behavioral",
    difficulty: "Medium",
    questionText: "Tell me about a project that failed or did not meet expectations. What was the setback, how did you take ownership, and what did you learn?",
    idealKeywords: ["failure", "setback", "reflection", "learning", "ownership", "responsibility", "post-mortem", "growth", "communication"],
    roles: ["Full-Stack Developer", "Backend Developer", "Frontend Developer", "DevOps Engineer", "Data Scientist"],
    sampleAnswer: "I was leading a migration of our user auth service. Due to aggressive timelines, I rushed integration testing. During rollout, we encountered a concurrency bug under load that blocked users. I immediately took full ownership, halted the rollout, and rolled back to the legacy system. I conducted a blameless post-mortem with the team to analyze the root cause. We learned that synthetic tests did not replicate concurrent production loads. Since then, I ensure all migrations undergo load-testing with production-like profiles and implement feature flags for gradual rollouts. This experience reinforced the value of quality assurance over speed.",
    rubric: {
      keywordRelevance: "Mention taking ownership, blameless post-mortem, rollback, root cause analysis, and learnings.",
      technicalDepth: "Explain the technical recovery steps (rollback, database state restoration) and preventative steps (feature flags).",
      logicalStructure: "Apply STAR: Situation (migration fail), Task (restore service), Action (ownership, rollback, post-mortem), Result (learnings, load-testing integration).",
      domainTerminology: "Use operational terms: rollout, rollback, blameless post-mortem, feature flag, load-testing, concurrency.",
      completeness: "State clearly how the learnings were turned into permanent engineering guidelines in subsequent projects."
    }
  }
];

/**
 * Pre-seeds the database with standard questions if the bank is currently empty.
 */
export const seedQuestions = async () => {
  try {
    const count = await InterviewQuestion.countDocuments();
    if (count === 0) {
      console.log("Interview Question Bank is empty. Seeding standard questions...");
      await InterviewQuestion.insertMany(SEED_QUESTIONS);
      console.log(`Successfully seeded ${SEED_QUESTIONS.length} interview questions.`);
    }
  } catch (error) {
    console.error("Error seeding interview questions:", error.message);
  }
};

/**
 * Fetches exactly 4 questions (one per vertical) matching role, skills, and difficulty constraints.
 * 
 * @param {string} targetRole Target role selected by user
 * @param {Array<string>} skillStack Custom skill stack tags
 * @param {string} targetDifficulty Easy, Medium, Hard
 * @returns {Promise<Array<object>>} Chosen questions list (4 entries)
 */
export const getQuestionsForSession = async (targetRole, skillStack = [], targetDifficulty = "Medium") => {
  const verticals = ["Technical", "Behavioral", "System Design", "Project Deep-Dive"];
  const selectedQuestions = [];

  for (const vertical of verticals) {
    // 1. First try: Match role + vertical + difficulty
    let query = {
      vertical,
      difficulty: targetDifficulty,
      roles: { $in: [targetRole] }
    };

    let questions = await InterviewQuestion.find(query);

    // 2. Second try: Fallback to match vertical + difficulty for any role
    if (questions.length === 0) {
      query = {
        vertical,
        difficulty: targetDifficulty
      };
      questions = await InterviewQuestion.find(query);
    }

    // 3. Third try: Fallback to match vertical for any role & difficulty
    if (questions.length === 0) {
      query = { vertical };
      questions = await InterviewQuestion.find(query);
    }

    if (questions.length > 0) {
      // Pick a random question from matched results to avoid repeat sessions
      const randomIndex = Math.floor(Math.random() * questions.length);
      selectedQuestions.push(questions[randomIndex]);
    }
  }

  // If we couldn't find questions for all 4 verticals (edge case), fetch random ones to make sure we return 4
  if (selectedQuestions.length < 4) {
    const fetchedIds = selectedQuestions.map(q => q._id);
    const fallbacks = await InterviewQuestion.find({ _id: { $nin: fetchedIds } }).limit(4 - selectedQuestions.length);
    selectedQuestions.push(...fallbacks);
  }

  // Shuffle or order questions by Technical -> Behavioral -> System Design -> Project Deep-Dive
  const orderMap = { "Technical": 1, "Behavioral": 2, "System Design": 3, "Project Deep-Dive": 4 };
  selectedQuestions.sort((a, b) => (orderMap[a.vertical] || 5) - (orderMap[b.vertical] || 5));

  return selectedQuestions;
};

export default { seedQuestions, getQuestionsForSession };
