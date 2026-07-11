import InterviewSession from "../models/interviewSession.model.js";
import { getTailoredQuestions } from "../services/questionBank.js";
import { evaluateInterviewAnswer } from "../services/interviewEvaluation.service.js";
import geminiService from "../services/gemini.service.js";

/**
 * Initializes a new interview simulation session.
 */
export const startInterview = async (req, res) => {
  try {
    const user = req.user;
    const { targetRole, skillStack = [] } = req.body;

    if (!targetRole) {
      return res.status(400).json({ success: false, message: "Target role is required to start interview simulation" });
    }

    // Generate tailored questions (4 questions: Technical, Behavioral, System Design, Project Deep-Dive)
    let tailoredQuestions;
    const geminiQuestionsData = await geminiService.generateInterviewQuestions({ targetRole, skillStack });
    if (geminiQuestionsData && geminiQuestionsData.questions && geminiQuestionsData.questions.length === 4) {
      tailoredQuestions = geminiQuestionsData.questions;
    } else {
      tailoredQuestions = getTailoredQuestions(targetRole, skillStack);
    }

    // Set 15-minute expiration timer
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const session = new InterviewSession({
      user: user._id,
      targetRole,
      skillStack,
      status: "ongoing",
      expiresAt,
      questions: tailoredQuestions
    });

    await session.save();

    // Map questions to omit evaluation properties in start response
    const questionsResponse = session.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      category: q.category,
      difficulty: q.difficulty
    }));

    res.status(201).json({
      success: true,
      message: "Interview session started successfully",
      data: {
        _id: session._id,
        targetRole: session.targetRole,
        skillStack: session.skillStack,
        status: session.status,
        expiresAt: session.expiresAt,
        questions: questionsResponse,
        createdAt: session.createdAt
      }
    });

  } catch (error) {
    console.error("Start interview error:", error.stack || error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to start interview session"
    });
  }
};

/**
 * Submits the user response for a specific question inside the interview.
 * Evaluates the answer on-the-fly and handles completion logic.
 */
export const submitAnswer = async (req, res) => {
  try {
    const user = req.user;
    const sessionId = req.params.id;
    const { questionId, answerText = "" } = req.body;

    if (!questionId) {
      return res.status(400).json({ success: false, message: "Question ID is required" });
    }

    // 1. Fetch session and check authorization
    const session = await InterviewSession.findOne({ _id: sessionId, user: user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: "Interview session not found or does not belong to the user" });
    }

    // 2. Validate session timer/expiration
    if (session.status !== "ongoing") {
      return res.status(400).json({ success: false, message: "This interview session has already been completed or closed" });
    }

    if (new Date() > session.expiresAt) {
      session.status = "expired";
      await session.save();
      return res.status(400).json({ success: false, message: "This interview session has expired (time limit reached)" });
    }

    // 3. Find question in list
    const question = session.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found in this interview session" });
    }

    if (question.userAnswer) {
      return res.status(400).json({ success: false, message: "This question has already been answered and evaluated" });
    }

    // 4. Grade the answer on-the-fly (Latency-Optimized)
    const evaluation = await evaluateInterviewAnswer(question.questionText, answerText);

    // 5. Update question progress
    question.userAnswer = answerText || "No response provided.";
    question.score = evaluation.score;
    question.feedback = evaluation.feedback;
    question.missingConcepts = evaluation.missingConcepts;
    question.evaluatedAt = new Date();

    // 6. Check if all questions are now answered
    const answeredCount = session.questions.filter(q => q.userAnswer).length;
    const totalCount = session.questions.length;
    const isCompleted = answeredCount === totalCount;

    if (isCompleted) {
      session.status = "completed";
      // Calculate overall average score
      const totalScoreSum = session.questions.reduce((sum, q) => sum + (q.score || 0), 0);
      session.overallScore = Math.round(totalScoreSum / totalCount);

      // Generate overall feedback summary
      if (session.overallScore >= 80) {
        session.feedback = "Overall strong session! You displayed high technical competence and structured explanations. Ready for real-world loops.";
      } else if (session.overallScore >= 60) {
        session.feedback = "Good performance. You possess the baseline foundations but need to review missing technical vocabulary gaps and offer deeper case examples.";
      } else {
        session.feedback = "Review your role profiles. Answers were brief or missed target terminology. Try practicing with simpler topics and structure summaries.";
      }
    }

    await session.save();

    if (isCompleted) {
      return res.status(200).json({
        success: true,
        message: "Interview completed successfully",
        data: {
          status: session.status,
          overallScore: session.overallScore,
          feedback: session.feedback,
          lastEvaluation: {
            score: question.score,
            feedback: question.feedback,
            missingConcepts: question.missingConcepts
          }
        }
      });
    } else {
      // Find index of next unanswered question
      const nextQuestionIndex = session.questions.findIndex(q => !q.userAnswer);

      return res.status(200).json({
        success: true,
        message: "Answer evaluated successfully",
        data: {
          status: session.status,
          nextQuestionIndex,
          lastEvaluation: {
            score: question.score,
            feedback: question.feedback,
            missingConcepts: question.missingConcepts
          }
        }
      });
    }

  } catch (error) {
    console.error("Submit answer error:", error.stack || error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to evaluate answer"
    });
  }
};

/**
 * Fetches all past session history list for the logged-in user.
 */
export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch and project minimal summaries to keep history lightweight
    const history = await InterviewSession.find(
      { user: userId },
      { _id: 1, targetRole: 1, status: 1, overallScore: 1, createdAt: 1 }
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {
    console.error("Fetch history error:", error.stack || error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve history"
    });
  }
};

/**
 * Fetches a detailed, question-by-question report for a specific session.
 */
export const getReport = async (req, res) => {
  try {
    const user = req.user;
    const sessionId = req.params.id;

    const session = await InterviewSession.findOne({ _id: sessionId, user: user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: "Interview session not found or does not belong to the user" });
    }

    res.status(200).json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error("Fetch report error:", error.stack || error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve report details"
    });
  }
};
