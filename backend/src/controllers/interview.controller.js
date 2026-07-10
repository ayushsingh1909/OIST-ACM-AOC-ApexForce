import InterviewSession from "../models/interviewSession.model.js";
import { getQuestionsForSession } from "../services/questionBank.service.js";
import { evaluateAnswer } from "../services/evaluation.service.js";
import { AppError, catchAsync } from "../utils/errors.js";

// Role configuration parameters for onboarding and mapping
const ROLE_CONFIGS = {
  "Full-Stack Developer": {
    defaultSkills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "SQL", "Git", "Docker"],
    categoryWeights: { Technical: 35, "System Design": 35, "Project Deep-Dive": 20, Behavioral: 10 }
  },
  "Frontend Developer": {
    defaultSkills: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Redux", "TailwindCSS", "Vite"],
    categoryWeights: { Technical: 50, "System Design": 20, "Project Deep-Dive": 20, Behavioral: 10 }
  },
  "Backend Developer": {
    defaultSkills: ["Node.js", "Express", "SQL", "PostgreSQL", "MongoDB", "Redis", "Docker", "REST APIs"],
    categoryWeights: { Technical: 40, "System Design": 40, "Project Deep-Dive": 10, Behavioral: 10 }
  },
  "DevOps Engineer": {
    defaultSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Jenkins", "Bash"],
    categoryWeights: { Technical: 30, "System Design": 40, "Project Deep-Dive": 20, Behavioral: 10 }
  },
  "Data Scientist": {
    defaultSkills: ["Python", "Machine Learning", "SQL", "Pandas", "NumPy", "Scikit-Learn", "Statistics"],
    categoryWeights: { Technical: 40, "System Design": 20, "Project Deep-Dive": 20, Behavioral: 20 }
  }
};

/**
 * Filter session questions for standard client exposure during active run (protects ideal data)
 */
const filterActiveSessionQuestions = (questions) => {
  return questions.map(q => ({
    _id: q._id,
    questionId: q.questionId,
    vertical: q.vertical,
    questionText: q.questionText,
    difficulty: q.difficulty,
    answerText: q.answerText,
    timeSpent: q.timeSpent,
    isAnswered: q.isAnswered,
    // Omitting score, evaluation details, idealKeywords, sampleAnswer during simulation
  }));
};

/**
 * Endpoint to list all standard supported job roles and config properties.
 */
export const getRoles = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: ROLE_CONFIGS
  });
});

/**
 * Start an interview session, fetch questions, and set lifecycle to In-Progress.
 */
export const startSession = catchAsync(async (req, res, next) => {
  const { role, skillStack = [], difficulty = "Medium", timeLimitPerQuestion = 120 } = req.body;

  if (!role) {
    return next(new AppError("Job role target is required to start session.", 400));
  }

  // Find questions (1 from each of the 4 verticals)
  const selectedQuestions = await getQuestionsForSession(role, skillStack, difficulty);

  if (selectedQuestions.length === 0) {
    return next(new AppError("Failed to select questions for this role configuration. Verify question bank seeding.", 500));
  }

  // Build schema subdocuments
  const sessionQuestions = selectedQuestions.map(q => ({
    questionId: q._id,
    vertical: q.vertical,
    questionText: q.questionText,
    difficulty: q.difficulty,
    idealKeywords: q.idealKeywords,
    sampleAnswer: q.sampleAnswer,
    answerText: "",
    timeSpent: 0,
    isAnswered: false,
    score: 0,
    evaluation: {
      keywordRelevance: 0,
      technicalDepth: 0,
      logicalStructure: 0,
      domainTerminology: 0,
      completeness: 0,
      feedback: "",
      missingConcepts: []
    }
  }));

  // Create new session
  const newSession = await InterviewSession.create({
    user: req.user._id,
    role,
    skillStack,
    difficulty,
    status: "In-Progress",
    currentQuestionIndex: 0,
    timeLimitPerQuestion,
    questions: sessionQuestions,
    startedAt: new Date()
  });

  // Strip evaluation data before returning the active session
  const clientQuestions = filterActiveSessionQuestions(newSession.questions);

  res.status(201).json({
    success: true,
    message: "Interview session started successfully",
    data: {
      sessionId: newSession._id,
      role: newSession.role,
      difficulty: newSession.difficulty,
      status: newSession.status,
      currentQuestionIndex: newSession.currentQuestionIndex,
      timeLimitPerQuestion: newSession.timeLimitPerQuestion,
      questions: clientQuestions,
      startedAt: newSession.startedAt
    }
  });
});

/**
 * Get details of a specific interview session.
 */
export const getSession = catchAsync(async (req, res, next) => {
  const session = await InterviewSession.findById(req.params.id);

  if (!session) {
    return next(new AppError("Interview session not found.", 404));
  }

  // Security: only session owners can access
  if (session.user.toString() !== req.user._id.toString()) {
    return next(new AppError("You do not have permission to view this session.", 403));
  }

  // If in-progress, strip evaluation/answers to prevent developer console cheating
  if (session.status === "In-Progress" || session.status === "Created") {
    const clientQuestions = filterActiveSessionQuestions(session.questions);
    return res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        role: session.role,
        difficulty: session.difficulty,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        timeLimitPerQuestion: session.timeLimitPerQuestion,
        questions: clientQuestions,
        startedAt: session.startedAt
      }
    });
  }

  // If completed, return full detailed data (scorecards, suggestions, samples)
  res.status(200).json({
    success: true,
    data: session
  });
});

/**
 * Submit answer for the active question, perform fast evaluation.
 */
export const submitAnswer = catchAsync(async (req, res, next) => {
  const { answerText, timeSpent = 0 } = req.body;
  const session = await InterviewSession.findById(req.params.id);

  if (!session) {
    return next(new AppError("Interview session not found.", 404));
  }

  if (session.user.toString() !== req.user._id.toString()) {
    return next(new AppError("You are not authorized to write to this session.", 403));
  }

  if (session.status !== "In-Progress") {
    return next(new AppError("This interview session is not in-progress.", 400));
  }

  const currentIndex = session.currentQuestionIndex;
  if (currentIndex >= session.questions.length) {
    return next(new AppError("All questions in this session have already been answered.", 400));
  }

  const activeQuestion = session.questions[currentIndex];

  // Evaluate the answer locally (sub-3-seconds response time)
  const evalResult = evaluateAnswer(answerText, activeQuestion.idealKeywords, activeQuestion.vertical);

  // Update question subdocument
  activeQuestion.answerText = answerText || "";
  activeQuestion.timeSpent = timeSpent;
  activeQuestion.isAnswered = true;
  activeQuestion.score = evalResult.score;
  activeQuestion.evaluation = evalResult.evaluation;

  // Progress index
  session.currentQuestionIndex = currentIndex + 1;

  // Check if reached end of questions
  if (session.currentQuestionIndex >= session.questions.length) {
    session.status = "Evaluating";
  }

  await session.save();

  res.status(200).json({
    success: true,
    message: "Answer submitted successfully",
    data: {
      questionIndex: currentIndex,
      score: evalResult.score,
      evaluation: evalResult.evaluation,
      nextQuestionIndex: session.currentQuestionIndex,
      sessionStatus: session.status
    }
  });
});

/**
 * Complete the interview session, finalize overall scores, and compile missing concepts.
 */
export const completeSession = catchAsync(async (req, res, next) => {
  const session = await InterviewSession.findById(req.params.id);

  if (!session) {
    return next(new AppError("Interview session not found.", 404));
  }

  if (session.user.toString() !== req.user._id.toString()) {
    return next(new AppError("You do not have permission to modify this session.", 403));
  }

  // Calculate composite score
  const totalQuestions = session.questions.length;
  if (totalQuestions === 0) {
    return next(new AppError("This session contains no questions.", 400));
  }

  const sumScores = session.questions.reduce((sum, q) => sum + q.score, 0);
  const overallScore = Math.round(sumScores / totalQuestions);

  // Compile overall unique missing concepts
  const missingSet = new Set();
  session.questions.forEach(q => {
    if (q.evaluation && q.evaluation.missingConcepts) {
      q.evaluation.missingConcepts.forEach(c => missingSet.add(c));
    }
  });
  const missingConceptsBreakdown = Array.from(missingSet);

  // Draft overall qualitative feedback
  let overallFeedback = "";
  if (overallScore >= 85) {
    overallFeedback = `Excellent performance! You demonstrate a strong readiness for a ${session.role} position. Your answers have outstanding depth and structural execution.`;
  } else if (overallScore >= 70) {
    overallFeedback = `Good performance. You are well-prepared, but focusing on addressing missing concepts in design patterns and deep-diving architectural parameters will push you to the next level.`;
  } else if (overallScore >= 50) {
    overallFeedback = `Moderate performance. There are noticeable gaps in key technical concepts and explanation completeness. Dedicate time to reviewing the core rubrics and practice structural structuring.`;
  } else {
    overallFeedback = `Needs improvement. Major gaps were identified across multiple categories. Focus on reviewing standard technical terms, building practical projects, and practicing mock responses.`;
  }

  // Update session
  session.overallScore = overallScore;
  session.overallFeedback = overallFeedback;
  session.missingConceptsBreakdown = missingConceptsBreakdown;
  session.status = "Completed";
  session.endedAt = new Date();

  await session.save();

  res.status(200).json({
    success: true,
    message: "Session evaluated and completed successfully",
    data: session
  });
});

/**
 * Retrieve user's historical completed interview records.
 */
export const getUserHistory = catchAsync(async (req, res, next) => {
  const history = await InterviewSession.find({
    user: req.user._id,
    status: "Completed"
  }).sort({ endedAt: -1 });

  res.status(200).json({
    success: true,
    count: history.length,
    data: history
  });
});
