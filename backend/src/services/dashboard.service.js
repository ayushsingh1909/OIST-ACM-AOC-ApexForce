import User from "../models/user.model.js";
import { QuizAttempt } from "../models/quiz.model.js";
import { AssignmentSubmission } from "../models/assignment.model.js";
import { SpacedRepetition } from "../models/score.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";
import masteryService from "./mastery.service.js";
import quizService from "./quiz.service.js";
import { AppError } from "../utils/errors.js";

class DashboardService {
  async getStudentDashboard(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const [
      pendingAssignments,
      completedAssignments,
      upcomingRevisions,
      recentQuizzes,
      resumeAnalysis,
      quizStats,
    ] = await Promise.all([
      AssignmentSubmission.find({ user: userId, status: "pending" })
        .populate("assignment")
        .sort({ dueDate: 1 })
        .limit(5),
      AssignmentSubmission.find({ user: userId, status: "evaluated" })
        .populate("assignment")
        .sort({ submittedAt: -1 })
        .limit(5),
      SpacedRepetition.find({
        user: userId,
        nextReviewAt: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      }).sort({ nextReviewAt: 1 }),
      QuizAttempt.find({ user: userId, status: "completed" })
        .sort({ completedAt: -1 })
        .limit(3)
        .select("accuracy score completedAt topicBreakdown"),
      ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }),
      quizService.getQuizStats(userId),
    ]);

    const masteryMatrix = masteryService.getMasteryMatrix(user);
    const weakTopics = masteryService.getWeakTopics(user);
    const highRiskItems = this.buildHighRiskItems(weakTopics, pendingAssignments, upcomingRevisions);
    const recommendedActions = this.buildRecommendedActions(user, weakTopics, resumeAnalysis);
    const studyRoadmap = this.buildStudyRoadmap(upcomingRevisions, pendingAssignments, weakTopics);

    return {
      user: {
        name: user.name,
        role: user.role,
        targetRole: user.learningProfile?.targetRole || "Full-Stack Developer",
      },
      overview: {
        overallMasteryScore: user.learningProfile?.overallMasteryScore || 0,
        riskLevel: user.learningProfile?.riskLevel || "high",
        resumeScore: user.resumeData?.strengthScore || resumeAnalysis?.strengthScore || 0,
        quizAvgAccuracy: quizStats.avgAccuracy,
        totalQuizAttempts: quizStats.totalAttempts,
      },
      masteryHeatmap: masteryMatrix,
      upcomingTasks: {
        assignments: pendingAssignments.map((s) => ({
          id: s._id,
          title: s.assignment?.title,
          topic: s.assignment?.topic,
          type: s.assignment?.type,
          dueDate: s.dueDate,
          difficulty: s.assignment?.difficulty,
        })),
        revisions: upcomingRevisions.map((r) => ({
          topic: r.topic,
          nextReviewAt: r.nextReviewAt,
          status: r.status,
          lastScore: r.lastScore,
        })),
      },
      highRiskItems,
      recommendedActions,
      studyRoadmap,
      recentActivity: {
        quizzes: recentQuizzes,
        completedAssignments: completedAssignments.map((s) => ({
          id: s._id,
          title: s.assignment?.title,
          score: s.evaluation?.overallScore,
          submittedAt: s.submittedAt,
        })),
      },
      adaptiveFeedback: {
        suggestedDifficulty: this.suggestDifficulty(user.learningProfile?.overallMasteryScore),
        focusTopics: weakTopics.slice(0, 3).map((t) => t.topicName),
        spacedRepetitionDue: upcomingRevisions.filter((r) => r.nextReviewAt <= new Date()).length,
      },
    };
  }

  suggestDifficulty(mastery) {
    if (mastery < 40) return "easy";
    if (mastery < 70) return "medium";
    return "hard";
  }

  buildHighRiskItems(weakTopics, pendingAssignments, revisions) {
    const items = [];

    for (const topic of weakTopics.filter((t) => t.masteryScore < 40)) {
      items.push({
        type: "mastery",
        title: `Critical gap: ${topic.topicName}`,
        severity: "high",
        message: `Mastery at ${topic.masteryScore}% — immediate review recommended.`,
      });
    }

    for (const assignment of pendingAssignments) {
      if (assignment.dueDate && assignment.dueDate < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)) {
        items.push({
          type: "assignment",
          title: assignment.assignment?.title,
          severity: "moderate",
          message: `Due soon on ${assignment.dueDate.toLocaleDateString()}`,
        });
      }
    }

    for (const rev of revisions.filter((r) => r.status === "overdue")) {
      items.push({
        type: "revision",
        title: `Overdue revision: ${rev.topic}`,
        severity: "high",
        message: `Scheduled review was due on ${rev.nextReviewAt.toLocaleDateString()}`,
      });
    }

    return items.slice(0, 6);
  }

  buildRecommendedActions(user, weakTopics, resumeAnalysis) {
    const actions = [];

    if ((user.resumeData?.strengthScore || 0) < 60) {
      actions.push({
        action: "upload_resume",
        label: "Improve your resume score",
        priority: "high",
        route: "/resume",
      });
    }

    if (weakTopics.length > 0) {
      actions.push({
        action: "take_quiz",
        label: `Practice ${weakTopics[0].topicName} with an adaptive quiz`,
        priority: "high",
        route: "/quiz",
      });
    }

    actions.push({
      action: "start_assignment",
      label: "Complete a pending assignment",
      priority: "medium",
      route: "/assignments",
    });

    if (resumeAnalysis?.missingSkills?.length > 0) {
      actions.push({
        action: "learn_skill",
        label: `Learn: ${resumeAnalysis.missingSkills.slice(0, 2).join(", ")}`,
        priority: "medium",
        route: "/resume",
      });
    }

    return actions;
  }

  buildStudyRoadmap(revisions, pendingAssignments, weakTopics) {
    const roadmap = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });

      const tasks = [];

      if (i === 0 && weakTopics.length > 0) {
        tasks.push({ type: "quiz", label: `Quiz: ${weakTopics[0].topicName}`, duration: "15 min" });
      }

      const dayRevisions = revisions.filter(
        (r) => r.nextReviewAt.toDateString() === date.toDateString()
      );
      for (const rev of dayRevisions) {
        tasks.push({ type: "revision", label: `Review: ${rev.topic}`, duration: "20 min" });
      }

      if (i === 1 && pendingAssignments.length > 0) {
        tasks.push({
          type: "assignment",
          label: pendingAssignments[0].assignment?.title || "Assignment",
          duration: `${pendingAssignments[0].assignment?.estimatedHours || 2}h`,
        });
      }

      if (i === 3 && weakTopics.length > 1) {
        tasks.push({ type: "quiz", label: `Quiz: ${weakTopics[1].topicName}`, duration: "15 min" });
      }

      roadmap.push({ day: dayLabel, date: date.toISOString().split("T")[0], tasks });
    }

    return roadmap;
  }
}

export default new DashboardService();
