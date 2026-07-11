import User from "../models/user.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";
import { parsePDF, extractSkills, extractProjects, extractExperienceYears, checkStructure } from "../services/parser.service.js";
import { calculateScore } from "../services/scoring.service.js";
import geminiService from "../services/gemini.service.js";

/**
 * Handles PDF resume upload or plain text resume submission.
 * Extracts details, scores the resume, updates User, and saves history.
 */
export const uploadResume = async (req, res) => {
  try {
    let resumeText = "";
    let fileName = "Plain Text Input";

    // 1. Text Extraction
    if (req.file) {
      fileName = req.file.originalname;
      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "Only PDF files are supported" });
      }
      // Parse PDF buffer to text
      resumeText = await parsePDF(req.file.buffer);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({
        message: "Please upload a PDF resume or provide resume text in 'resumeText'"
      });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ message: "Resume content is empty" });
    }

    // 2. Identify target role
    // Check request body, then fall back to user's saved targetRole, then system default
    const user = req.user;
    const targetRole = req.body.targetRole || 
                       (user.learningProfile && user.learningProfile.targetRole) || 
                       "Full-Stack Developer";

    // 3. Attempt Gemini API Resume Analysis
    let analysisResult = await geminiService.analyzeResume(resumeText, targetRole);
    let extractedSkills, detectedProjects, detectedExperienceYears, scoringResult;

    if (analysisResult) {
      extractedSkills = analysisResult.extractedSkills || [];
      detectedProjects = analysisResult.detectedProjects || [];
      detectedExperienceYears = analysisResult.detectedExperienceYears || 0;
      
      scoringResult = {
        targetRole: analysisResult.targetRole || targetRole,
        strengthScore: analysisResult.strengthScore || 0,
        scoreBreakdown: analysisResult.scoreBreakdown || {
          skillRelevance: 0,
          projectDepth: 0,
          experienceIndicators: 0,
          structureScore: 0
        },
        missingSkills: analysisResult.missingSkills || [],
        improvementSuggestions: analysisResult.improvementSuggestions || []
      };
    } else {
      // Fallback: Local regex heuristic parsing & scoring
      extractedSkills = extractSkills(resumeText);
      detectedProjects = extractProjects(resumeText);
      detectedExperienceYears = extractExperienceYears(resumeText);
      const structureResult = checkStructure(resumeText);

      scoringResult = calculateScore({
        skills: extractedSkills,
        projects: detectedProjects,
        experienceYears: detectedExperienceYears,
        structureScore: structureResult.score
      }, targetRole);
    }

    // 5. Update user's profile with latest resume metadata
    if (!user.learningProfile) {
      user.learningProfile = {};
    }
    user.learningProfile.targetRole = scoringResult.targetRole;
    
    user.resumeData = {
      resumeUrl: req.file ? `uploads/${fileName}` : "Plain Text Input",
      strengthScore: scoringResult.strengthScore,
      extractedSkills: extractedSkills,
      missingSkills: scoringResult.missingSkills,
      detectedProjects: detectedProjects
    };
    
    await user.save();

    // 6. Save history entry in the ResumeAnalysis collection
    const analysis = new ResumeAnalysis({
      user: user._id,
      fileName,
      targetRole: scoringResult.targetRole,
      strengthScore: scoringResult.strengthScore,
      scoreBreakdown: scoringResult.scoreBreakdown,
      extractedSkills,
      missingSkills: scoringResult.missingSkills,
      detectedProjects,
      detectedExperienceYears,
      improvementSuggestions: scoringResult.improvementSuggestions
    });

    await analysis.save();

    // 7. Return detailed response
    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      data: {
        fileName,
        targetRole: scoringResult.targetRole,
        strengthScore: scoringResult.strengthScore,
        scoreBreakdown: scoringResult.scoreBreakdown,
        extractedSkills,
        missingSkills: scoringResult.missingSkills,
        detectedProjects,
        detectedExperienceYears,
        improvementSuggestions: scoringResult.improvementSuggestions,
        analysisId: analysis._id
      }
    });

  } catch (error) {
    console.error("Resume upload error:", error.stack || error.message);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during resume analysis"
    });
  }
};

/**
 * Retrieves the logged-in user's resume analysis history.
 */
export const getResumeHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch analyses sorted by creation date descending
    const history = await ResumeAnalysis.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error("Fetch history error:", error.stack || error.message);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching resume history"
    });
  }
};
