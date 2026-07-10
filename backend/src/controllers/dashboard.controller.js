import dashboardService from "../services/dashboard.service.js";
import masteryService from "../services/mastery.service.js";
import { catchAsync } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";

class DashboardController {
  getDashboard = catchAsync(async (req, res) => {
    const data = await dashboardService.getStudentDashboard(req.user._id);
    sendSuccess(res, 200, "Dashboard data fetched", data);
  });

  getMasteryMatrix = catchAsync(async (req, res) => {
    const matrix = masteryService.getMasteryMatrix(req.user);
    sendSuccess(res, 200, "Mastery matrix fetched", { matrix });
  });

  recalculateMastery = catchAsync(async (req, res) => {
    const profile = await masteryService.recalculateUserMastery(req.user._id);
    sendSuccess(res, 200, "Mastery recalculated", { learningProfile: profile });
  });
}

export default new DashboardController();
