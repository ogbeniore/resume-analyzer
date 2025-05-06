export interface AnalysisResult {
  matchPercentage: number;
  missingSkills: {
    skill: string;
    priority: "high" | "medium" | "low";
    explanation: string;
    recommendation: string;
    suggestedText?: string; // Text to add to resume
  }[];
  experienceReframing: {
    title: string;
    explanation: string;
    recommendation: string;
    suggestedText?: string; // Text to add to resume
  }[];
  strengths: {
    title: string;
    explanation: string;
    recommendation: string;
    suggestedText?: string; // Text to add to resume
  }[];
  // Overall suggested sections to add to resume
  suggestedSections?: {
    title: string; // Section title (e.g., "Skills", "Experience", "Summary")
    content: string; // Ready-to-use text for the resume
  }[];
}

export interface Resume {
  fileName: string;
  fileType: string;
  fileSize: number;
  content?: string;
}
