'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  File,
  Home,
  LogOut,
  MessageSquare,
  User,
  FileText,
  Book,
  Share2,
  Shield,
  FileQuestion,
  Settings,
  Clipboard,
  Download,
  RefreshCw,
  Send,
  PaperclipIcon,
  Sparkles,
  Briefcase,
  Scale,
  BookOpen,
  Check,
  FileCheck,
  X,
  Upload,
  FilePlus,
  AlertCircle
} from 'lucide-react';

interface DocumentExample {
  prompt: string;
  category: 'contract' | 'application' | 'litigation';
  icon: React.ReactNode;
}

export default function AgentsPage() {
  const router = useRouter();
  const [wordCount, setWordCount] = useState<number>(5000);
  const [inputText, setInputText] = useState<string>('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track mouse position for dynamic effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  const documentExamples: DocumentExample[] = [
    { 
      prompt: "Draft a memorial from petitioner side on Khan Gul vs Lakha Singh regarding property dispute.", 
      category: "litigation",
      icon: <Scale className="h-5 w-5 text-purple-600" />
    },
    { 
      prompt: "I want to draft an employment contract for a new software engineer in my tech startup.", 
      category: "contract",
      icon: <Briefcase className="h-5 w-5 text-violet-600" />
    },
    { 
      prompt: "Draft a bail application under Section 438 for my client charged under Section 498A.", 
      category: "application",
      icon: <FileCheck className="h-5 w-5 text-indigo-600" />
    },
  ];

  const capabilities = [
    "Generate legal drafts powered by advanced LangChain and LangGraph AI agents with context-aware reasoning.",
    "Research and cite relevant case laws using the Exa API for precise legal references.",
    "Customize any legal document with an intuitive Word-like editor and form-based details.",
    "Choose from multiple document templates including memorials, bail applications, contracts, and more.",
    "Download drafts in Word format with all placeholders automatically filled in.",
    "Upload your existing DOCX and PDF files for AI analysis and enhancement."
  ];

  const handleSendMessage = () => {
    if (inputText.trim()) {
      console.log('Send message:', inputText);
      router.push(`/research?query=${encodeURIComponent(inputText)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Only DOCX and PDF files are allowed.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setUploadError('File size should not exceed 10MB.');
        return;
      }
      newFiles.push(file);
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...uploadedFiles];
    updatedFiles.splice(index, 1);
    setUploadedFiles(updatedFiles);
  };

  const handleUploadSubmit = async () => {
    if (uploadedFiles.length === 0) {
      setUploadError('Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);
    
    try {
      // In a real app, you would upload the files to your backend here
      // For this example, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful upload
      console.log('Files uploaded:', uploadedFiles);
      setIsUploadModalOpen(false);
      setUploadedFiles([]);
      
      // After successful upload, you might want to redirect to a page that processes these files
      // router.push('/chat-with-pdf');
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100 relative">
      {/* Dynamic background elements */}
      <div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(147, 51, 234, 0.1) 0%, rgba(237, 233, 254, 0) 70%)`,
        }}
      />
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-black/5 to-transparent rounded-full blur-3xl z-0 transform translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-white/50 to-transparent rounded-full blur-3xl z-0 transform -translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-1/3 left-1/4 w-1/4 h-1/4 bg-gradient-to-br from-purple-300/10 to-transparent rounded-full blur-3xl z-0" />
      <div className="absolute bottom-1/3 right-1/4 w-1/4 h-1/4 bg-gradient-to-tl from-violet-300/10 to-transparent rounded-full blur-3xl z-0" />

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg z-10">
        <div className="p-4 border-b border-black/5">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-md flex items-center justify-center shadow-md">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-violet-800">AI Jurist</h1>
              <p className="text-xs text-violet-600">Indian Legal Assistant</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-4 bg-white">
          <div className="px-4 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</div>
          <NavItem icon={<Home />} label="Home" active />
          <NavItem icon={<FileText />} label="My Drafts" onClick={() => router.push('/draft')} />
          <NavItem icon={<MessageSquare />} label="Chat with PDF" />
          
          <div className="px-4 mt-6 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Legal Tools</div>
          <NavItem icon={<Scale />} label="Litigation Tools" />
          <NavItem icon={<Briefcase />} label="Contract Templates" />
          <NavItem icon={<BookOpen />} label="Legal Research" />
          
          <div className="px-4 mt-6 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Account</div>
          <NavItem icon={<User />} label="Contact Us" />
          <NavItem icon={<FileQuestion />} label="Feedback" />
          <NavItem icon={<Settings />} label="Pricing" />
          <NavItem icon={<Shield />} label="Privacy Policy" />
          <NavItem icon={<Book />} label="Terms & Conditions" />
          <NavItem icon={<Share2 />} label="Refer & Earn" />
          <NavItem icon={<LogOut />} label="Logout" />
        </nav>
        
        <div className="mt-8 px-4 bg-white">
          <div className="border-t border-black/5 pt-4">
            <div className="px-2 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Drafts</div>
            <RecentDraft date="Thu Apr 17 2025" title="Bail Application for 498A" category="application" />
            <RecentDraft date="Thu Apr 17 2025" title="Employment Contract" category="contract" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto z-10">
        <header className="bg-white border-b border-black/5 flex justify-between items-center p-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-800">AI Jurist Dashboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-3 py-1 rounded-full text-sm border border-emerald-200/50 backdrop-blur-sm shadow-sm flex items-center">
              <Check className="h-4 w-4 mr-1" />
              <span>Plan: Premium</span>
            </div>
            <div className="text-gray-700 flex items-center bg-white px-3 py-1 rounded-full text-sm border border-black/5 shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-violet-500 mr-2"></span>
              {wordCount} Words Remaining
            </div>
            <button className="text-gray-700 hover:text-gray-900 bg-white p-2 rounded-full border border-black/5 shadow-sm">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100">
          <div className="bg-white border border-black/5 rounded-xl p-6 shadow-md mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-14 w-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center border border-white/80 shadow-md">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div className="ml-5">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Welcome to AI Jurist
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Your virtual drafting assistant for Indian Laws, powered by advanced AI technology.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(true)} 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg shadow-md flex items-center transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-5">
                <div className="bg-white p-2 rounded-md shadow-md border border-black/5">
                  <FileText className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-800">
                  Documents I can assist you with
                </h3>
              </div>
              
              <div className="space-y-4">
                {documentExamples.map((example, index) => {
                  return (
                    <div 
                      key={index} 
                      className="bg-white p-5 rounded-lg border border-black/5 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:translate-y-[-2px]"
                    >
                      <div className="flex items-start">
                        <div className="p-2 rounded-lg bg-violet-50 shadow-sm border border-black/5 mr-4 flex-shrink-0">
                          {example.icon}
                        </div>
                        <div>
                          <div className="text-sm text-violet-600 font-medium mb-1">
                            {example.category.charAt(0).toUpperCase() + example.category.slice(1)}
                          </div>
                          <p className="text-gray-700">{example.prompt}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-5">
                <div className="bg-white p-2 rounded-md shadow-md border border-black/5">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-800">
                  Advanced Capabilities
                </h3>
              </div>
              
              <div className="space-y-4">
                {capabilities.map((capability, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-5 rounded-lg border border-black/5 shadow-md"
                  >
                    <div className="flex items-start">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mr-4 flex-shrink-0 border border-white shadow-sm">
                        <span className="text-xs text-white font-medium">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{capability}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white border border-black/5 p-5 rounded-lg flex items-center shadow-md">
              <div className="rounded-lg bg-violet-50 p-3 mr-4 border border-violet-100">
                <Sparkles className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Powered by AI Agent Technology</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Our system uses LangChain, LangGraph, OpenRouter, and Exa API to deliver accurate legal drafting with context-aware reasoning.
                </p>
              </div>
            </div>
          
            <div className="bg-white border border-black/5 p-5 rounded-lg flex items-center shadow-md">
              <div className="rounded-lg bg-amber-50 p-3 mr-4 border border-amber-100">
                <span className="text-amber-600 text-lg">⚠️</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Legal Disclaimer</h3>
                <p className="text-gray-700 text-sm mt-1">
                  Please verify all data (including drafts) provided here before using officially in any manner.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button className="py-2 px-6 bg-white hover:bg-gray-50 rounded-full text-gray-700 flex items-center justify-center shadow-md transition-all border border-black/5">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate response
            </button>
          </div>
        </main>
      </div>
      
      {/* Input Area - Updated */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center bg-white rounded-full shadow-lg border border-black/5 overflow-hidden pl-6">
            <div className="text-violet-600 font-medium text-sm mr-3">Ask AI Jurist:</div>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="text-gray-500 hover:text-gray-700 mr-2"
            >
              <PaperclipIcon className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <textarea 
                className="w-full py-3 px-3 bg-transparent border-none focus:outline-none resize-none text-gray-700 placeholder-gray-400"
                placeholder="Type your legal drafting request..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ minHeight: '44px' }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                Press Enter to send
              </div>
            </div>
            <div className="flex">
              <button 
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-6 py-4 flex items-center transition-colors rounded-r-full"
                onClick={handleSendMessage}
              >
                <span className="mr-2">Research</span>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* File Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 relative">
            <button 
              onClick={() => setIsUploadModalOpen(false)} 
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                <FilePlus className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Upload Documents</h3>
                <p className="text-sm text-gray-600">Upload DOCX or PDF files to analyze with AI</p>
              </div>
            </div>
            
            <div 
              onClick={handleFileUploadClick}
              className="border-2 border-dashed border-violet-200 rounded-lg p-8 mb-4 text-center cursor-pointer hover:bg-violet-50 transition-colors"
            >
              <Upload className="h-8 w-8 text-violet-500 mx-auto mb-3" />
              <p className="text-violet-700 font-medium mb-1">Click to browse files</p>
              <p className="text-sm text-gray-500">or drag and drop files here</p>
              <p className="text-xs text-gray-400 mt-2">Supports DOCX and PDF up to 10MB</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            {uploadError && (
              <div className="flex items-start bg-red-50 p-3 rounded-lg mb-4 text-red-700 text-sm">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{uploadError}</p>
              </div>
            )}
            
            {uploadedFiles.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Selected Files ({uploadedFiles.length})</div>
                <div className="max-h-44 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-violet-50 p-2 rounded-md mb-2">
                      <div className="flex items-center overflow-hidden">
                        <div className="p-1.5 bg-violet-100 rounded-md mr-2">
                          <FileText className="h-4 w-4 text-violet-600" />
                        </div>
                        <div className="truncate max-w-[240px]">
                          <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-violet-200 rounded-full"
                      >
                        <X className="h-4 w-4 text-violet-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadSubmit}
                disabled={uploadedFiles.length === 0 || isUploading}
                className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg shadow-sm flex items-center transition-colors ${
                  uploadedFiles.length === 0 || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-600 hover:to-violet-700'
                }`}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sidebar Nav Item Component
const NavItem = ({ 
  icon, 
  label, 
  active,
  onClick
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <a 
      href="#" 
      className={`flex items-center px-4 py-2.5 text-sm ${
        active 
          ? 'text-violet-700 bg-violet-50 border-r-2 border-violet-500' 
          : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
      } transition-all`}
      onClick={onClick}
    >
      <span className="h-5 w-5 mr-3">{icon}</span>
      {label}
    </a>
  );
};

// Recent Draft Component
const RecentDraft = ({
  date,
  title,
  category,
}: {
  date: string;
  title: string;
  category: string;
}) => {
  return (
    <div className="mb-3 bg-white/50 p-2 rounded-md hover:bg-violet-50 transition-all">
      <div className="text-xs text-gray-400">{date}</div>
      <a href="#" className="text-sm text-gray-600 hover:text-violet-700 line-clamp-1 font-medium">
        {title}
      </a>
      <div className="text-xs text-violet-600">{category}</div>
    </div>
  );
}; 