import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileUpload } from "@/components/file-upload";
import { ResultsDisplay } from "@/components/results-display";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { AnalysisResult, Resume } from "@/lib/types";
import { analyzeResume, downloadReport } from "@/lib/openai";
import { 
  FileText, 
  ArrowRight, 
  Download, 
  RefreshCw,
  HelpCircle,
  DollarSign,
  Menu,
  X
} from "lucide-react";

export default function Home() {
  const isMobile = useMobile();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const { toast } = useToast();

  // Set pageLoaded after initial render for animations
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const analyzeResumeMutation = useMutation({
    mutationFn: async () => {
      if (!resumeFile || !jobDescription) {
        throw new Error("Please upload a resume and provide a job description");
      }
      return await analyzeResume(resumeFile, jobDescription);
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      
      // Scroll to results section on mobile
      if (isMobile) {
        setTimeout(() => {
          window.scrollTo({
            top: window.innerHeight / 2,
            behavior: 'smooth'
          });
        }, 300);
      }
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const downloadReportMutation = useMutation({
    mutationFn: async () => {
      if (!analysisResult || !resume) {
        throw new Error("No analysis results available");
      }
      return await downloadReport(resume.fileName, analysisResult);
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-analysis-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Report downloaded",
        description: "Your analysis report has been downloaded",
      });
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleResumeUpload = (file: File) => {
    if (!file) {
      setResumeFile(null);
      setResume(null);
    } else {
    setResumeFile(file);
    setResume({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
    }
    
  };

  const handleAnalyze = () => {
    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Please upload your resume first",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription) {
      toast({
        title: "Job description required",
        description: "Please paste the job description",
        variant: "destructive",
      });
      return;
    }

    analyzeResumeMutation.mutate();
  };

  const handleResetAnalysis = () => {
    setAnalysisResult(null);
  };

  const handleDownloadReport = () => {
    downloadReportMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-gray-900">ResumeAI Optimizer</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><a href="#" className="text-gray-500 hover:text-primary font-medium transition-colors duration-200">How It Works</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary font-medium transition-colors duration-200">Pricing</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary font-medium transition-colors duration-200">FAQ</a></li>
            </ul>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-500 hover:text-primary"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-md mobile-menu-in">
            <nav className="px-4 py-4">
              <ul className="space-y-4">
                <li>
                  <a 
                    href="#" 
                    className="block py-2 text-gray-500 hover:text-primary font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="block py-2 text-gray-500 hover:text-primary font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="block py-2 text-gray-500 hover:text-primary font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Intro Section */}
        <section className={`mb-8 text-center ${pageLoaded ? 'fade-in' : 'opacity-0'}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Optimize Your Resume with AI</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your resume and paste a job description to get AI-powered recommendations on how to tailor your resume for better results.
          </p>
        </section>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className={`space-y-6 ${pageLoaded ? 'slide-in-up' : 'opacity-0'}`}>
            {/* Resume Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6 card-hover">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Upload Your Resume</h3>
              <FileUpload
                onFileUpload={handleResumeUpload}
                uploadedFile={resume}
                acceptedFileTypes=".pdf,.doc,.docx"
                isLoading={analyzeResumeMutation.isPending}
              />
            </div>

            {/* Job Description Input */}
            <div className="bg-white rounded-lg shadow-sm p-6 card-hover">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Paste Job Description</h3>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="w-full h-40 md:h-64 p-3 resize-none"
                disabled={analyzeResumeMutation.isPending}
              />
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={!resumeFile || !jobDescription || analyzeResumeMutation.isPending}
                className="w-full sm:w-auto px-6 py-5 md:py-6 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm btn-animate"
              >
                {analyzeResumeMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    Analyze Resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Results Panel */}
          <div className={pageLoaded ? 'slide-in-right stagger-1' : 'opacity-0'}>
            {analyzeResumeMutation.isPending ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">Analyzing Your Resume</h3>
                <p className="mt-2 text-gray-600">Our AI is comparing your resume with the job description.</p>
                <div className="w-full max-w-md mt-6 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full progress-bar" style={{ width: "60%" }}></div>
                </div>
                <p className="mt-2 text-sm text-gray-500">This may take a minute...</p>
              </div>
            ) : analysisResult ? (
              <div className="scale-in">
                <ResultsDisplay
                  analysisResult={analysisResult}
                  onResetAnalysis={handleResetAnalysis}
                  onDownloadReport={handleDownloadReport}
                  isDownloading={downloadReportMutation.isPending}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center h-full flex flex-col items-center justify-center">
                <FileText className="h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-700">No Analysis Yet</h3>
                <p className="mt-2 text-gray-500 max-w-sm">
                  Upload your resume and paste a job description to see AI-powered recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="slide-in-up">
              <h3 className="text-lg font-semibold mb-4">ResumeAI Optimizer</h3>
              <p className="text-gray-400">
                Our AI-powered tool helps you tailor your resume to match job descriptions and increase your chances of landing interviews.
              </p>
            </div>
            <div className="slide-in-up stagger-1">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="slide-in-up stagger-2">
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-400">Questions or feedback? We'd love to hear from you.</p>
              <a href="mailto:support@resumeai.example.com" className="text-primary-400 hover:text-primary-300 transition-colors">support@resumeai.example.com</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm slide-in-up stagger-3">
            <p>&copy; {new Date().getFullYear()} ResumeAI Optimizer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
