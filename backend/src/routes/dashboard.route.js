import { Router } from "express";
import dashboardController from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", dashboardController.getDashboard);
router.get("/mastery", dashboardController.getMasteryMatrix);
router.post("/mastery/recalculate", dashboardController.recalculateMastery);

export default router;
