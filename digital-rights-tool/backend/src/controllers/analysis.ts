import { Request, Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../utils/types";
import { analyzeLicensing } from "../lib/llm";
import fs from "fs";
import path from "path";

// Analyze content for an upload ID
export const analyzeContent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { uploadId } = req.params;

    if (!uploadId || typeof uploadId !== "string") {
      return res.status(400).json({ message: "Invalid upload ID" });
    }

    // Find the upload
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    // Ensure user owns the upload
    if (upload.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to analyze this content" });
    }

    // Check if analysis already exists
    const existingAnalysis = await prisma.analysis.findUnique({
      where: { uploadId },
    });

    if (existingAnalysis) {
      return res.status(400).json({
        message: "Analysis already exists for this content",
        analysisId: existingAnalysis.id,
      });
    }

    let contentToAnalyze = "";

    try {
      const filePath = upload.fileUrl.startsWith("http")
        ? null
        : path.resolve(process.cwd(), upload.fileUrl.replace(/^\//, ""));

      if (filePath && fs.existsSync(filePath)) {
        if (upload.fileType === "ARTICLE") {
          contentToAnalyze = fs.readFileSync(filePath, "utf-8");
        } else {
          contentToAnalyze = `File name: ${upload.fileName}, File type: ${upload.fileType}`;
          if (upload.contentType) {
            contentToAnalyze += `, Content type: ${upload.contentType}`;
          }
        }
      } else {
        contentToAnalyze = `File name: ${upload.fileName}, File type: ${upload.fileType}`;
        if (upload.contentType) {
          contentToAnalyze += `, Content type: ${upload.contentType}`;
        }
      }
    } catch (error) {
      console.error("Error reading file:", error);
      contentToAnalyze = `File name: ${upload.fileName}, File type: ${upload.fileType}`;
    }

    console.log(`Analyzing content: ${contentToAnalyze.substring(0, 100)}...`);

    // Analyze content using Gemini
    const analysisResult = await analyzeLicensing(contentToAnalyze);

    // Save analysis result in the database
    const analysis = await prisma.analysis.create({
      data: {
        uploadId,
        licensingInfo: analysisResult.licensingInfo,
        licensingSummary: analysisResult.licensingSummary,
        riskScore: analysisResult.riskScore,
      },
    });

    return res.status(201).json({
      message: "Content analysis completed",
      analysis,
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return res.status(500).json({ message: "Server error during analysis", error: error.message });
  }
};

// Get analysis by upload ID
export const getAnalysisById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { uploadId } = req.params;

    if (!uploadId || typeof uploadId !== "string") {
      return res.status(400).json({ message: "Invalid upload ID" });
    }

    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: { analysis: true },
    });

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    // Ensure user owns the upload
    if (upload.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this analysis" });
    }

    if (!upload.analysis) {
      return res.status(404).json({ message: "Analysis not found for this upload" });
    }

    return res.json({
      analysis: {
        ...upload.analysis,
        upload: {
          id: upload.id,
          fileName: upload.fileName,
          fileType: upload.fileType,
          fileUrl: upload.fileUrl,
          createdAt: upload.createdAt,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching analysis:", error);
    return res.status(500).json({ message: "Server error while fetching analysis", error: error.message });
  }
};
