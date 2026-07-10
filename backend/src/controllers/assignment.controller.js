import assignmentService from "../services/assignment.service.js";
import { catchAsync } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";

class AssignmentController {
  listAssignments = catchAsync(async (req, res) => {
    const assignments = await assignmentService.getAssignmentsForUser(req.user._id);
    sendSuccess(res, 200, "Assignments fetched", { assignments });
  });

  submitAssignment = catchAsync(async (req, res) => {
    const fileUrls = (req.files || []).map((f) => f.originalname);
    const result = await assignmentService.submitAssignment(
      req.user._id,
      req.params.assignmentId,
      {
        textContent: req.body.textContent,
        githubLink: req.body.githubLink,
        fileUrls,
      }
    );
    sendSuccess(res, 200, "Assignment submitted and evaluated", result);
  });

  getSubmission = catchAsync(async (req, res) => {
    const submission = await assignmentService.getSubmissionDetails(
      req.user._id,
      req.params.submissionId
    );
    sendSuccess(res, 200, "Submission details fetched", { submission });
  });
}

export default new AssignmentController();
