import { apiRequest } from "./queryClient";
import { AnalysisResult } from "./types";

export const analyzeResume = async (
  resumeFile: File,
  jobDescription: string
): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("jobDescription", jobDescription);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Analysis failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const downloadReport = async (
  resumeFileName: string,
  analysisResult: AnalysisResult
): Promise<Blob> => {
  const response = await apiRequest("POST", "/api/generate-report", {
    resumeFileName,
    analysisResult,
  });

  if (!response.ok) {
    throw new Error("Failed to generate report");
  }

  return await response.blob();
};
