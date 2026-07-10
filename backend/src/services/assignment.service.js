import { Assignment, AssignmentSubmission } from "../models/assignment.model.js";
import User from "../models/user.model.js";
import { ScoreRecord } from "../models/score.model.js";
import masteryService from "./mastery.service.js";
import { AppError } from "../utils/errors.js";

class AssignmentService {
  async getAssignmentsForUser(userId) {
    const user = await User.findById(userId);
    const weakTopics = masteryService.getWeakTopics(user, 70).map((t) => t.topicName);

    let assignments = await Assignment.find({
      isActive: true,
      topic: weakTopics.length > 0 ? { $in: weakTopics } : { $exists: true },
    }).sort({ difficulty: 1 });

    if (assignments.length < 3) {
      const more = await Assignment.find({ isActive: true }).limit(10);
      const map = new Map(assignments.map((a) => [a._id.toString(), a]));
      for (const a of more) map.set(a._id.toString(), a);
      assignments = [...map.values()];
    }

    const submissions = await AssignmentSubmission.find({ user: userId });
    const submissionMap = new Map(submissions.map((s) => [s.assignment.toString(), s]));

    return assignments.map((assignment) => {
      const submission = submissionMap.get(assignment._id.toString());
      const dueDate = submission?.dueDate || this.calculateDueDate(assignment.dueInDays);

      return {
        assignment: {
          _id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          type: assignment.type,
          topic: assignment.topic,
          difficulty: assignment.difficulty,
          estimatedHours: assignment.estimatedHours,
          conceptBenchmarks: assignment.conceptBenchmarks.map((c) => ({
            concept: c.concept,
            weight: c.weight,
          })),
        },
        submission: submission
          ? {
              _id: submission._id,
              status: submission.status,
              submittedAt: submission.submittedAt,
              evaluation: submission.evaluation,
              dueDate: submission.dueDate,
            }
          : null,
        dueDate,
        status: submission?.status || "pending",
      };
    });
  }

  calculateDueDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  }

  async getOrCreateSubmission(userId, assignmentId) {
    let submission = await AssignmentSubmission.findOne({ user: userId, assignment: assignmentId });
    if (!submission) {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new AppError("Assignment not found", 404);

      submission = await AssignmentSubmission.create({
        user: userId,
        assignment: assignmentId,
        status: "pending",
        dueDate: this.calculateDueDate(assignment.dueInDays),
      });
    }
    return submission;
  }

  evaluateSubmissionContent(content, benchmarks) {
    const lowerContent = (content || "").toLowerCase();
    const conceptCoverage = [];
    let totalWeight = 0;
    let coveredWeight = 0;

    for (const benchmark of benchmarks) {
      totalWeight += benchmark.weight;
      const matchedKeywords = (benchmark.keywords || []).filter((kw) =>
        lowerContent.includes(kw.toLowerCase())
      );
      const coveragePercent =
        benchmark.keywords.length > 0
          ? Math.round((matchedKeywords.length / benchmark.keywords.length) * 100)
          : lowerContent.includes(benchmark.concept.toLowerCase())
            ? 80
            : 0;

      const covered = coveragePercent >= 50;
      if (covered) coveredWeight += benchmark.weight;

      conceptCoverage.push({
        concept: benchmark.concept,
        covered,
        coveragePercent,
        matchedKeywords,
      });
    }

    const completionScore =
      totalWeight > 0 ? Math.round((coveredWeight / totalWeight) * 100) : 0;

    const feedback = [];
    const suggestions = [];

    for (const cc of conceptCoverage) {
      if (!cc.covered) {
        suggestions.push(
          `Expand coverage of "${cc.concept}" — include terms like: ${(benchmarks.find((b) => b.concept === cc.concept)?.keywords || []).slice(0, 3).join(", ")}`
        );
      } else {
        feedback.push(`Good coverage of "${cc.concept}" (${cc.coveragePercent}%).`);
      }
    }

    if (completionScore < 50) {
      feedback.push("Submission needs more depth to demonstrate concept understanding.");
    } else if (completionScore >= 80) {
      feedback.push("Strong submission demonstrating solid concept coverage.");
    }

    const masteryDelta = completionScore >= 80 ? 8 : completionScore >= 60 ? 4 : completionScore >= 40 ? 0 : -5;

    return {
      completionScore,
      conceptCoverage,
      overallScore: completionScore,
      feedback,
      suggestions,
      masteryDelta,
    };
  }

  async submitAssignment(userId, assignmentId, { textContent, githubLink, fileUrls }) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new AppError("Assignment not found", 404);

    const submission = await this.getOrCreateSubmission(userId, assignmentId);

    if (submission.status === "evaluated") {
      throw new AppError("Assignment already evaluated. Contact admin for resubmission.", 400);
    }

    const combinedContent = [textContent, githubLink, ...(fileUrls || [])].filter(Boolean).join("\n");

    if (!combinedContent.trim()) {
      throw new AppError("Please provide text content, a GitHub link, or file references", 400);
    }

    const evaluation = this.evaluateSubmissionContent(combinedContent, assignment.conceptBenchmarks);

    submission.textContent = textContent || "";
    submission.githubLink = githubLink || "";
    submission.fileUrls = fileUrls || [];
    submission.status = "evaluated";
    submission.submittedAt = new Date();
    submission.evaluation = evaluation;

    await submission.save();

    const user = await User.findById(userId);
    const masteryResult = await masteryService.updateTopicMastery(user, assignment.topic, {
      assignmentScore: evaluation.overallScore,
      scoreDelta: evaluation.masteryDelta,
    });

    user.learningProfile.overallMasteryScore = masteryService.calculateOverallMastery(
      user.learningProfile.topicMastery
    );
    user.learningProfile.riskLevel = masteryService.calculateRiskLevel(
      user.learningProfile.overallMasteryScore,
      user.learningProfile.topicMastery
    );
    await user.save();

    await ScoreRecord.create({
      user: userId,
      sourceType: "assignment",
      sourceId: submission._id,
      topic: assignment.topic,
      score: evaluation.overallScore,
      previousMastery: masteryResult.previousMastery,
      newMastery: masteryResult.newMastery,
      metadata: { difficulty: assignment.difficulty },
    });

    return {
      submissionId: submission._id,
      assignment: {
        title: assignment.title,
        topic: assignment.topic,
        type: assignment.type,
      },
      evaluation,
      masteryUpdate: masteryResult,
    };
  }

  async getSubmissionDetails(userId, submissionId) {
    const submission = await AssignmentSubmission.findOne({
      _id: submissionId,
      user: userId,
    }).populate("assignment");

    if (!submission) throw new AppError("Submission not found", 404);
    return submission;
  }
}

export default new AssignmentService();
