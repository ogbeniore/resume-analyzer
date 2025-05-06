import { 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  CheckCircle, 
  RotateCw,
  Copy,
  ClipboardCheck,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/lib/types";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

interface ResultsDisplayProps {
  analysisResult: AnalysisResult;
  onResetAnalysis: () => void;
  onDownloadReport: () => void;
  isDownloading: boolean;
}

export function ResultsDisplay({ 
  analysisResult, 
  onResetAnalysis, 
  onDownloadReport,
  isDownloading
}: ResultsDisplayProps) {
  const { matchPercentage, missingSkills, experienceReframing, strengths, suggestedSections } = analysisResult;
  const isMobile = useMobile();
  const { toast } = useToast();
  
  // Track which tab is active (for mobile view)
  const [activeTab, setActiveTab] = useState<'skills' | 'experience' | 'strengths' | 'sections'>(
    missingSkills.length > 0 ? 'skills' : 
    experienceReframing.length > 0 ? 'experience' : 
    strengths.length > 0 ? 'strengths' : 'sections'
  );
  
  // Track which suggested text is being copied
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  
  // Reset copied state after delay
  useEffect(() => {
    if (copiedTextId) {
      const timer = setTimeout(() => {
        setCopiedTextId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedTextId]);
  
  // Function to copy text to clipboard
  const copyTextToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedTextId(id);
        toast({
          title: "Copied to clipboard",
          description: "You can now paste this text into your resume",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually",
          variant: "destructive",
        });
      }
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 h-full overflow-auto card-hover">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Analysis Results</h3>
        <div className="text-left sm:text-right">
          <div className={`font-semibold flex items-center ${
            matchPercentage < 40 ? "text-red-700" : 
            matchPercentage < 70 ? "text-yellow-700" : 
            "text-green-700"
          }`}>
            <CheckCircle className="h-5 w-5 mr-1" />
            {matchPercentage}% Match
          </div>
          <p className="text-xs text-gray-500">Based on keyword and skills alignment</p>
        </div>
      </div>



      {/* Mobile Tabs Navigation */}
      {isMobile && (
        <div className="flex border-b border-gray-200 mb-4 overflow-x-auto pb-1">
          {missingSkills.length > 0 && (
            <button
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'skills' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('skills')}
            >
              Missing Skills
            </button>
          )}
          {experienceReframing.length > 0 && (
            <button
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'experience' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('experience')}
            >
              Experience Reframing
            </button>
          )}
          {strengths.length > 0 && (
            <button
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'strengths' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('strengths')}
            >
              Your Strengths
            </button>
          )}
          {suggestedSections && suggestedSections.length > 0 && (
            <button
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'sections' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('sections')}
            >
              Suggested Sections
            </button>
          )}
        </div>
      )}
      
      {/* Actionable Suggestions */}
      <div className="space-y-6">
        {/* Missing Skills */}
        {missingSkills.length > 0 && (!isMobile || activeTab === 'skills') && (
          <div className="slide-in-up stagger-1">
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Missing Skills
            </h4>
            
            {missingSkills.map((skill, index) => (
              <div 
                key={index} 
                className={`bg-gray-50 rounded-lg p-4 mb-3 last:mb-0 transition-all duration-300 hover:shadow-md fade-in`}
                style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <p className="font-medium text-gray-800 mb-1 sm:mb-0">{skill.skill}</p>
                  <span 
                    className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center justify-center w-fit ${
                      skill.priority === "high" ? "bg-yellow-100 text-yellow-800" :
                      skill.priority === "medium" ? "bg-gray-100 text-gray-800" :
                      "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {skill.priority.charAt(0).toUpperCase() + skill.priority.slice(1)} Priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{skill.explanation}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                  <p className="text-sm text-gray-600">{skill.recommendation}</p>
                </div>
                
                {/* Suggested Text with Copy Button */}
                {skill.suggestedText && (
                  <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold text-primary">Suggested Text:</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-primary hover:text-primary-dark hover:bg-blue-100"
                        onClick={() => copyTextToClipboard(skill.suggestedText!, `skill-${index}`)}
                      >
                        {copiedTextId === `skill-${index}` ? (
                          <ClipboardCheck className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copiedTextId === `skill-${index}` ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-sm italic text-primary-dark">{skill.suggestedText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Experience Reframing */}
        {experienceReframing.length > 0 && (!isMobile || activeTab === 'experience') && (
          <div className="slide-in-up stagger-2">
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <RotateCw className="h-5 w-5 text-primary mr-2" />
              Experience Reframing
            </h4>
            
            {experienceReframing.map((item, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-lg p-4 mb-3 last:mb-0 transition-all duration-300 hover:shadow-md fade-in"
                style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
              >
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-sm text-gray-600 mt-1">{item.explanation}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                  <p className="text-sm text-gray-600">{item.recommendation}</p>
                </div>
                
                {/* Suggested Text with Copy Button */}
                {item.suggestedText && (
                  <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold text-primary">Suggested Text:</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-primary hover:text-primary-dark hover:bg-blue-100"
                        onClick={() => copyTextToClipboard(item.suggestedText!, `exp-${index}`)}
                      >
                        {copiedTextId === `exp-${index}` ? (
                          <ClipboardCheck className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copiedTextId === `exp-${index}` ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-sm italic text-primary-dark">{item.suggestedText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Strengths */}
        {strengths.length > 0 && (!isMobile || activeTab === 'strengths') && (
          <div className="slide-in-up stagger-3">
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Your Strengths
            </h4>
            
            {strengths.map((strength, index) => (
              <div 
                key={index} 
                className="bg-green-50 rounded-lg p-4 mb-3 last:mb-0 transition-all duration-300 hover:shadow-md fade-in"
                style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
              >
                <p className="font-medium text-gray-800">{strength.title}</p>
                <p className="text-sm text-gray-600 mt-1">{strength.explanation}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                  <p className="text-sm text-gray-600">{strength.recommendation}</p>
                </div>
                
                {/* Suggested Text with Copy Button */}
                {strength.suggestedText && (
                  <div className="mt-3 bg-green-100 p-3 rounded-md border border-green-200">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold text-green-800">Suggested Text:</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-green-700 hover:text-green-900 hover:bg-green-100"
                        onClick={() => copyTextToClipboard(strength.suggestedText!, `str-${index}`)}
                      >
                        {copiedTextId === `str-${index}` ? (
                          <ClipboardCheck className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copiedTextId === `str-${index}` ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-sm italic text-green-800">{strength.suggestedText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Suggested Sections */}
        {suggestedSections && suggestedSections.length > 0 && (!isMobile || activeTab === 'sections') && (
          <div className="slide-in-up stagger-4">
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              Ready-to-Use Resume Sections
            </h4>
            
            {suggestedSections.map((section, index) => (
              <div 
                key={index} 
                className="bg-blue-50 rounded-lg p-4 mb-3 last:mb-0 transition-all duration-300 hover:shadow-md fade-in"
                style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
              >
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium text-gray-800">{section.title}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-primary border-primary/50 hover:bg-primary/10"
                    onClick={() => copyTextToClipboard(section.content, `section-${index}`)}
                  >
                    {copiedTextId === `section-${index}` ? (
                      <ClipboardCheck className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copiedTextId === `section-${index}` ? 'Copied!' : 'Copy Section'}
                  </Button>
                </div>
                
                <div className="p-3 bg-white rounded-md border border-blue-100">
                  <p className="text-sm whitespace-pre-line text-gray-700">{section.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <Button
          variant="outline"
          onClick={onResetAnalysis}
          className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 btn-animate"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Analyze Again
        </Button>
        
        <Button
          variant="outline"
          onClick={onDownloadReport}
          className="px-4 py-2 flex items-center justify-center bg-primary-50 text-primary-700 font-medium rounded-lg hover:bg-primary-100 btn-animate"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


