import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import { Check, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Resume } from "@/lib/types";
import { useMobile } from "@/hooks/use-mobile";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: Resume | null;
  acceptedFileTypes: string;
  isLoading?: boolean;
}

export function FileUpload({
  onFileUpload,
  uploadedFile,
  acceptedFileTypes,
  isLoading = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [animated, setAnimated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMobile();

  // Add animation after component mount
  useEffect(() => {
    setAnimated(true);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Get file extension
      const fileExt = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      
      // Check if extension is accepted
      if (!acceptedFileTypes.split(',').includes(fileExt)) {
        alert(`Only ${acceptedFileTypes} files are accepted`);
        return;
      }
      
      onFileUpload(file);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileUpload(null as unknown as File);
  };

  // Format file size for display
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return sizeInBytes + ' bytes';
    } else if (sizeInBytes < 1024 * 1024) {
      return (sizeInBytes / 1024).toFixed(1) + ' KB';
    } else {
      return (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };

  return (
    <div
      className={`upload-area p-6 md:p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragOver ? "dragover" : ""
      } ${animated ? 'scale-in' : 'opacity-0'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleBrowseClick}
    >
      {uploadedFile ? (
        <div className="flex flex-col items-center slide-in-up">
          <div className="flex items-center justify-center flex-wrap">
            <div className="bg-green-100 rounded-full p-2 mb-2 md:mb-0">
              <Check className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
            <div className="ml-0 md:ml-3 text-center md:text-left">
              <span className="block text-green-700 font-medium text-sm md:text-base">{uploadedFile.fileName}</span>
              <span className="text-xs text-gray-500">{formatFileSize(uploadedFile.fileSize)}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-sm text-primary hover:text-primary-700 font-medium btn-animate"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFile();
            }}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" />
            Remove file
          </Button>
        </div>
      ) : (
        <div className={`transition-opacity duration-300 ${animated ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-blue-50 rounded-full p-4 mx-auto w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <p className="mt-2 text-gray-700 text-sm md:text-base">
            {isMobile ? (
              <span>Tap to upload your resume</span>
            ) : (
              <span>Drag and drop your resume here or <span className="text-primary font-medium">browse files</span></span>
            )}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-primary">
              <FileText className="mr-1 h-3 w-3" />
              PDF
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-primary">
              <FileText className="mr-1 h-3 w-3" />
              DOC
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-primary">
              <FileText className="mr-1 h-3 w-3" />
              DOCX
            </span>
          </div>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        disabled={isLoading}
      />
    </div>
  );
}
