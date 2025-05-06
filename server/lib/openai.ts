import "dotenv/config";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import { AnalysisResult } from "../../client/src/lib/types";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Analyzes a resume against a job description using OpenAI
 */
export async function analyzeResumeWithJobDescription(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Check if we have valid inputs
    if (!resumeText || !jobDescription) {
      throw new Error("Resume text and job description are required");
    }

    const prompt = `
      You are an expert resume analyst with deep knowledge of HR and recruitment. 
      Analyze the resume against the job description provided and generate detailed, actionable feedback.
      
      Please focus on:
      1. Calculate a match percentage based on skills and keyword alignment (0-100%)
      2. Identify missing skills or keywords that are critical to the job
      3. Suggest how existing experience can be reframed to better match the job requirements
      4. Highlight strengths already present in the resume
      5. For each item above, provide specific text examples that the applicant can copy and directly add to their resume
      6. Create 1-3 complete suggested sections (like a Skills section, Summary section, etc.) that can be directly copied into the resume
      
      Resume:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
      
      Provide your analysis as a JSON object in the following format:
      {
        "matchPercentage": number,
        "missingSkills": [
          {
            "skill": string,
            "priority": "high" | "medium" | "low",
            "explanation": string,
            "recommendation": string,
            "suggestedText": string // Example text that can be directly added to the resume
          }
        ],
        "experienceReframing": [
          {
            "title": string,
            "explanation": string,
            "recommendation": string,
            "suggestedText": string // Example bullet point or phrase that can be directly added to the resume
          }
        ],
        "strengths": [
          {
            "title": string,
            "explanation": string,
            "recommendation": string,
            "suggestedText": string // Example text that better highlights this strength
          }
        ],
        "suggestedSections": [
          {
            "title": string, // Like "Technical Skills", "Professional Summary", etc.
            "content": string // Complete ready-to-use text for this section
          }
        ]
      }
      
      Be specific and actionable in your recommendations. Point out exactly what should be added, modified, or emphasized. 
      Make sure to include suggestedText for every item - this should be professional, concise text that can be directly copied and pasted into a resume.
      The suggestedSections should be complete, well-formatted sections that follow best practices for resume writing and are tailored to this specific job description.
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume analyst with deep knowledge of HR and recruitment. You provide detailed, actionable feedback on how to optimize resumes for specific job descriptions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to get analysis from OpenAI");
    }

    return JSON.parse(content) as AnalysisResult;
  } catch (error) {
    console.error("Error in OpenAI analysis:", error);
    throw new Error(
      `Failed to analyze resume: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generates a PDF report from analysis results
 */
export async function generatePDFReport(
  resumeFileName: string,
  analysis: AnalysisResult
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
        size: "A4",
      });

      // Buffer to store PDF
      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Add document title
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor("#1e40af")
        .text("Resume Analysis Report", { align: "center" });

      doc.moveDown();
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor("#4b5563")
        .text(`Resume: ${resumeFileName}`, { align: "center" });

      doc.moveDown();
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#1e40af")
        .text("Match Score");

      // Add match score
      const matchColor =
        analysis.matchPercentage < 40
          ? "#ef4444"
          : analysis.matchPercentage < 70
          ? "#f59e0b"
          : "#10b981";

      doc.moveDown(0.5);
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor("#4b5563")
        .text(`Match Percentage: `, { continued: true })
        .fillColor(matchColor)
        .text(`${analysis.matchPercentage}%`);

      // Draw match score bar
      doc.moveDown(0.5);
      doc.rect(50, doc.y, 495, 20).fillAndStroke("#e5e7eb", "#e5e7eb");
      doc
        .rect(50, doc.y - 20, (495 * analysis.matchPercentage) / 100, 20)
        .fillAndStroke(matchColor, matchColor);
      doc.moveDown(1.5);

      // Missing Skills section
      if (analysis.missingSkills.length > 0) {
        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .fillColor("#1e40af")
          .text("Missing Skills");
        doc.moveDown(0.5);

        analysis.missingSkills.forEach((skill) => {
          const priorityColor =
            skill.priority === "high"
              ? "#f59e0b"
              : skill.priority === "medium"
              ? "#6b7280"
              : "#3b82f6";

          doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor("#374151")
            .text(skill.skill, { continued: true })
            .font("Helvetica")
            .fillColor(priorityColor)
            .text(` (${skill.priority} priority)`, { align: "left" });

          doc.moveDown(0.2);
          doc
            .font("Helvetica")
            .fontSize(11)
            .fillColor("#4b5563")
            .text(skill.explanation);

          doc.moveDown(0.2);
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#4b5563")
            .text("Recommendation:", { continued: true })
            .font("Helvetica")
            .text(` ${skill.recommendation}`);

          // Add suggested text if available
          if (skill.suggestedText) {
            doc.moveDown(0.5);
            doc
              .font("Helvetica-Bold")
              .fontSize(11)
              .fillColor("#1e40af")
              .text("Suggested Text:");

            doc
              .font("Helvetica-Oblique")
              .fontSize(11)
              .fillColor("#1e3a8a")
              .text(skill.suggestedText, {
                paragraphGap: 5,
                indent: 10,
              });
          }

          doc.moveDown(1);
        });
      }

      // Experience Reframing section
      if (analysis.experienceReframing.length > 0) {
        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .fillColor("#1e40af")
          .text("Experience Reframing");
        doc.moveDown(0.5);

        analysis.experienceReframing.forEach((item) => {
          doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor("#374151")
            .text(item.title);

          doc.moveDown(0.2);
          doc
            .font("Helvetica")
            .fontSize(11)
            .fillColor("#4b5563")
            .text(item.explanation);

          doc.moveDown(0.2);
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#4b5563")
            .text("Recommendation:", { continued: true })
            .font("Helvetica")
            .text(` ${item.recommendation}`);

          // Add suggested text if available
          if (item.suggestedText) {
            doc.moveDown(0.5);
            doc
              .font("Helvetica-Bold")
              .fontSize(11)
              .fillColor("#1e40af")
              .text("Suggested Text:");

            doc
              .font("Helvetica-Oblique")
              .fontSize(11)
              .fillColor("#1e3a8a")
              .text(item.suggestedText, {
                paragraphGap: 5,
                indent: 10,
              });
          }

          doc.moveDown(1);
        });
      }

      // Strengths section
      if (analysis.strengths.length > 0) {
        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .fillColor("#1e40af")
          .text("Your Strengths");
        doc.moveDown(0.5);

        analysis.strengths.forEach((strength) => {
          doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor("#374151")
            .text(strength.title);

          doc.moveDown(0.2);
          doc
            .font("Helvetica")
            .fontSize(11)
            .fillColor("#4b5563")
            .text(strength.explanation);

          doc.moveDown(0.2);
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#4b5563")
            .text("Recommendation:", { continued: true })
            .font("Helvetica")
            .text(` ${strength.recommendation}`);

          // Add suggested text if available
          if (strength.suggestedText) {
            doc.moveDown(0.5);
            doc
              .font("Helvetica-Bold")
              .fontSize(11)
              .fillColor("#1e40af")
              .text("Suggested Text:");

            doc
              .font("Helvetica-Oblique")
              .fontSize(11)
              .fillColor("#1e3a8a")
              .text(strength.suggestedText, {
                paragraphGap: 5,
                indent: 10,
              });
          }

          doc.moveDown(1);
        });
      }

      // Suggested Sections
      if (analysis.suggestedSections && analysis.suggestedSections.length > 0) {
        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .fillColor("#1e40af")
          .text("Ready-to-Use Resume Sections");
        doc.moveDown(0.5);

        analysis.suggestedSections.forEach((section) => {
          doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor("#374151")
            .text(section.title);

          doc.moveDown(0.5);
          doc
            .font("Helvetica-Oblique")
            .fontSize(11)
            .fillColor("#1e3a8a")
            .text(section.content, {
              paragraphGap: 5,
              indent: 10,
            });

          doc.moveDown(1);
        });
      }

      // Add footer
      const footerText = `Generated on ${new Date().toLocaleDateString()} by ResumeAI Optimizer`;
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#9ca3af")
        .text(footerText, 50, doc.page.height - 50, { align: "center" });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(
        new Error(
          `Failed to generate PDF report: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      );
    }
  });
}
