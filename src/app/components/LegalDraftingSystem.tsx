import React, { useState, useEffect } from 'react';
import { Save, Download, ThumbsUp, ThumbsDown, FileText, Search, Bookmark, PenTool, Book, GitBranch, AlertTriangle, MessageSquare, Bold, Italic, Underline, List, AlignLeft, AlignCenter, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { generateLegalDraftWithAI, searchLegalPrecedentsWithAI, enhanceDraftWithAI } from '../services/draftIntegration';
import { useRouter } from 'next/navigation';

// Types for the legal drafting system
export interface ResearchPoint {
  id: string;
  content: string;
  source: string;
  relevance: number; // 1-5 scale
  category: 'statute' | 'precedent' | 'commentary' | 'fact';
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: 'criminal' | 'civil' | 'constitutional' | 'other';
  structure: TemplateSection[];
}

export interface TemplateSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  placeholders: string[];
  defaultText: string;
}

export interface DraftState {
  id: string;
  title: string;
  templateId: string | null;
  content: string;
  sections: Record<string, string>;
  metadata: Record<string, string>;
  lastEdited: Date;
}

// Mock data for Indian legal templates
export const legalTemplates: DocumentTemplate[] = [
  {
    id: 'bail-application-bns',
    name: 'Bail Application under Bharatiya Nyaya Sanhita',
    category: 'criminal',
    structure: [
      {
        id: 'heading',
        title: 'Court Details',
        description: 'The heading of the application including court name and location',
        required: true,
        placeholders: ['COURT_NAME', 'COURT_LOCATION'],
        defaultText: 'IN THE COURT OF {COURT_NAME}\nAT {COURT_LOCATION}'
      },
      {
        id: 'case-details',
        title: 'Case Reference',
        description: 'Details of the case number and relevant section',
        required: true,
        placeholders: ['CASE_NUMBER', 'YEAR', 'BNS_SECTION'],
        defaultText: 'CRIMINAL MISC. BAIL APPLICATION NO. {CASE_NUMBER} OF {YEAR}\nUNDER SECTION {BNS_SECTION} OF THE BHARATIYA NYAYA SANHITA'
      },
      {
        id: 'parties',
        title: 'Parties',
        description: 'Details of the applicant and respondent',
        required: true,
        placeholders: ['APPLICANT_NAME', 'STATE_NAME'],
        defaultText: 'IN THE MATTER OF:\n{APPLICANT_NAME} (Applicant)\nVs.\nState of {STATE_NAME} (Respondent)'
      },
      {
        id: 'facts',
        title: 'Facts and Grounds',
        description: 'Details of the case and grounds for bail',
        required: true,
        placeholders: ['FACTS_AND_GROUNDS'],
        defaultText: '{FACTS_AND_GROUNDS}'
      },
      {
        id: 'prayer',
        title: 'Prayer',
        description: 'The specific request to the court',
        required: true,
        placeholders: ['BNS_SECTION'],
        defaultText: 'PRAYER:\nIt is, therefore, most respectfully prayed that this Honorable Court may kindly grant bail to the applicant under Section {BNS_SECTION} of the Bharatiya Nyaya Sanhita.'
      }
    ]
  },
  {
    id: 'memorial',
    name: 'Memorial (Moot Court)',
    category: 'other',
    structure: [
      {
        id: 'cover-page',
        title: 'Cover Page',
        description: 'The cover page of the memorial',
        required: true,
        placeholders: ['COMPETITION_NAME', 'TEAM_CODE'],
        defaultText: '{COMPETITION_NAME}\n\nMEMORIAL FOR THE PETITIONER/RESPONDENT\n\nTEAM CODE: {TEAM_CODE}'
      },
      {
        id: 'facts',
        title: 'Statement of Facts',
        description: 'Facts of the case',
        required: true,
        placeholders: ['FACTS'],
        defaultText: 'STATEMENT OF FACTS\n\n{FACTS}'
      }
    ]
  },
  {
    id: 'plaint-civil',
    name: 'Civil Plaint',
    category: 'civil',
    structure: [
      {
        id: 'heading',
        title: 'Court Details',
        description: 'The heading of the plaint',
        required: true,
        placeholders: ['COURT_NAME', 'COURT_LOCATION'],
        defaultText: 'IN THE COURT OF {COURT_NAME}\nAT {COURT_LOCATION}'
      },
      {
        id: 'parties',
        title: 'Parties',
        description: 'Details of the plaintiff and defendant',
        required: true,
        placeholders: ['PLAINTIFF_NAME', 'DEFENDANT_NAME'],
        defaultText: 'IN THE MATTER OF:\n{PLAINTIFF_NAME} ...PLAINTIFF\nVERSUS\n{DEFENDANT_NAME} ...DEFENDANT'
      }
    ]
  }
];

const LegalDraftingSystem: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'draft' | 'research' | 'templates'>('templates');
  const [userInput, setUserInput] = useState<string>('');
  const [researchResults, setResearchResults] = useState<ResearchPoint[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [currentDraft, setCurrentDraft] = useState<DraftState | null>(null);
  const [draftText, setDraftText] = useState<string>('');
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [isIntegratingResearch, setIsIntegratingResearch] = useState<boolean>(false);
  const [enhanceWithResearch, setEnhanceWithResearch] = useState<boolean>(true);
  const [researchReport, setResearchReport] = useState<string>('');
  
  // Update the time client-side only to avoid hydration mismatch
  useEffect(() => {
    setLastSavedTime(new Date().toLocaleTimeString());
  }, []);
  
  // Update the research integration to use the new API with more iterations
  const generateResearch = async (query: string) => {
    setIsGenerating(true);
    
    try {
      // Add an indicator that we want comprehensive research with 4 iterations
      const results = await searchLegalPrecedentsWithAI(query, { comprehensive: true, iterations: 4 });
      
      if (results.length > 0) {
        setResearchResults(results);
        
        // Check if there's a full report available
        const reportItem = results.find(item => item.category === 'report');
        if (reportItem) {
          setResearchReport(reportItem.content);
        }
        
        setActiveTab('research');
      } else {
        // Fallback to mock data if API fails
        setTimeout(() => {
          const mockResearch: ResearchPoint[] = [
            {
              id: 'res1',
              content: 'Section 436 of the Bharatiya Nyaya Sanhita provides for bail in case of bailable offences.',
              source: 'Bharatiya Nyaya Sanhita, 2023',
              relevance: 5,
              category: 'statute'
            },
            {
              id: 'res2',
              content: 'In Arnesh Kumar v. State of Bihar, the Supreme Court provided guidelines for arrest in cases under Section 498A IPC (now corresponding section in BNS).',
              source: 'AIR 2014 SC 2756',
              relevance: 4,
              category: 'precedent'
            },
            {
              id: 'res3',
              content: 'The accused has no prior criminal record and is a respected member of the community.',
              source: 'Case Facts',
              relevance: 4,
              category: 'fact'
            },
            {
              id: 'res4',
              content: 'Bail is the rule and jail is the exception - this principle has been consistently upheld by Indian courts.',
              source: 'State of Rajasthan v. Balchand, AIR 1977 SC 2447',
              relevance: 3,
              category: 'precedent'
            },
            {
              id: 'res5',
              content: 'The BNS has introduced stricter provisions for certain offences while maintaining the principles of natural justice.',
              source: 'Commentary on BNS by Justice (Retd.) Raveendran',
              relevance: 3,
              category: 'commentary'
            }
          ];
          
          setResearchResults(mockResearch);
          setActiveTab('research');
        }, 1500);
      }
    } catch (error) {
      console.error('Error researching legal precedents:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate draft directly based on template and research
  const generateDraft = async () => {
    if (!selectedTemplate) return;
    
    // Auto-research if no research has been done
    if (researchResults.length === 0) {
      setIsGenerating(true);
      // Automatically create a research query based on template type
      const researchQuery = `Legal analysis for ${selectedTemplate.name} with relevant precedents and statutes`;
      await generateResearch(researchQuery);
      setIsGenerating(false);
    }
    
    let newDraft: DraftState = {
      id: `draft-${Date.now()}`,
      title: `New ${selectedTemplate.name}`,
      templateId: selectedTemplate.id,
      content: '',
      sections: {},
      metadata: {},
      lastEdited: new Date()
    };
    
    // Initialize content with default template text
    let draftContent = '';
    selectedTemplate.structure.forEach(section => {
      let sectionText = section.defaultText;
      
      // Replace placeholders with values if available
      section.placeholders.forEach(placeholder => {
        const value = templateValues[placeholder] || `{${placeholder}}`;
        sectionText = sectionText.replace(new RegExp(`{${placeholder}}`, 'g'), value);
      });
      
      // Special handling for facts and grounds - incorporate research
      if (section.id === 'facts') {
        const relevantFacts = researchResults
          .filter(r => r.relevance >= 3)
          .map((r, i) => `${i+1}. ${r.content} ${r.category === 'precedent' ? `(${r.source})` : ''}`).join('\n\n');
        
        sectionText = sectionText.replace('{FACTS_AND_GROUNDS}', relevantFacts);
      }
      
      newDraft.sections[section.id] = sectionText;
      draftContent += sectionText + '\n\n';
    });
    
    newDraft.content = draftContent;
    setCurrentDraft(newDraft);
    setDraftText(draftContent);
    setActiveTab('draft');
    
    // Try to enhance the draft with AI if the template is ready
    try {
      // Create a prompt and details for AI enhancement
      const prompt = `Please enhance this ${selectedTemplate.name}`;
      const caseDetails = { 
        ...templateValues, 
        documentType: selectedTemplate.id,
        researchPoints: researchResults.map(r => ({ content: r.content, source: r.source, category: r.category }))
      };
      
      // Call the AI to improve the draft
      const enhancedContent = await generateLegalDraftWithAI(prompt, caseDetails);
      if (enhancedContent && enhancedContent.trim()) {
        setDraftText(enhancedContent);
        newDraft.content = enhancedContent;
        setCurrentDraft(newDraft);
      }
    } catch (error) {
      console.error('Error enhancing draft with AI:', error);
      // We still have the template-based draft as a fallback
    }
  };

  // Handle AI-powered editing with LangChain multi-agent framework and research integration
  const handleAIEdit = async () => {
    if (!draftText || !currentDraft) return;
    
    setIsEnhancing(true);
    try {
      let enhancedContent = '';
      
      if (enhanceWithResearch && researchReport) {
        // If we have research report and integration is enabled, use it for enhancement
        enhancedContent = await enhanceDraftWithAI(draftText, 
          `Using LangChain multi-agent framework, improve this draft by incorporating insights from the following research:\n\n${researchReport}\n\nEnsure formal legal language, proper citations, and comprehensive coverage of all relevant points.`
        );
      } else if (isIntegratingResearch) {
        // Navigate to research page to get more research data
        router.push('/research?query=' + encodeURIComponent(currentDraft.title));
        setIsEnhancing(false);
        return;
      } else {
        // Standard enhancement without research
        enhancedContent = await enhanceDraftWithAI(draftText, 
          "Using LangChain multi-agent framework, improve the language, add more legal citations from Exa search, incorporate the latest legal precedents, and make the arguments more persuasive. Ensure formal legal language and proper formatting."
        );
      }
      
      if (enhancedContent && enhancedContent.trim()) {
        setDraftText(enhancedContent);
        currentDraft.content = enhancedContent;
        setCurrentDraft({...currentDraft});
      }
    } catch (error) {
      console.error('Error editing with AI:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Update template values from input
  const handleTemplateValueChange = (placeholder: string, value: string) => {
    setTemplateValues(prev => ({
      ...prev,
      [placeholder]: value
    }));
  };

  // Collect all unique placeholders from selected template
  const getUniquePlaceholders = (): string[] => {
    if (!selectedTemplate) return [];
    
    const placeholdersSet = new Set<string>();
    selectedTemplate.structure.forEach(section => {
      section.placeholders.forEach(placeholder => {
        placeholdersSet.add(placeholder);
      });
    });
    
    return Array.from(placeholdersSet);
  };

  // Functions for the research tab to display comprehensive reports
  const renderResearchReport = () => {
    if (!researchReport) return null;
    
    return (
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comprehensive Research Report</h3>
        <div className="prose max-w-none">
          {/* Display report in formatted markdown */}
          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(researchReport) }} />
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded shadow hover:from-green-700 hover:to-emerald-700 flex items-center"
            onClick={() => {
              setEnhanceWithResearch(true);
              setActiveTab('draft');
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Use in Draft
          </button>
        </div>
      </div>
    );
  };
  
  // Helper function to convert markdown to HTML (simplified version)
  const formatMarkdown = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mt-3 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^\> (.*$)/gim, '<blockquote class="pl-4 border-l-4 border-gray-200 italic">$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li class="ml-6">$1</li>')
      .replace(/<\/li>\n<li>/g, '</li><li>')
      .replace(/^((?:<li>.*<\/li>)+)$/gim, '<ul class="list-disc mb-4">$1</ul>');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">AI Jurist</h1>
          <div className="flex items-center space-x-2">
            <button className="bg-blue-500 bg-opacity-30 hover:bg-opacity-40 px-3 py-1 rounded text-sm flex items-center">
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </button>
            <span className="text-sm">Last saved: {lastSavedTime}</span>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container mx-auto p-4">
        {/* Tabs navigation */}
        <div className="mb-4 border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
          <div className="flex space-x-4">
            <button 
              className={`py-3 px-6 font-medium text-base ${activeTab === 'draft' ? 'text-blue-700 border-b-2 border-blue-600 bg-white' : 'text-gray-800 hover:text-gray-900 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('draft')}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Draft
            </button>
            <button 
              className={`py-3 px-6 font-medium text-base ${activeTab === 'research' ? 'text-blue-700 border-b-2 border-blue-600 bg-white' : 'text-gray-800 hover:text-gray-900 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('research')}
            >
              <Search className="w-5 h-5 inline mr-2" />
              Research
            </button>
            <button 
              className={`py-3 px-6 font-medium text-base ${activeTab === 'templates' ? 'text-blue-700 border-b-2 border-blue-600 bg-white' : 'text-gray-800 hover:text-gray-900 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('templates')}
            >
              <Book className="w-5 h-5 inline mr-2" />
              Templates
            </button>
          </div>
        </div>
        
        {/* Research tab content */}
        {activeTab === 'research' && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Research Results</h2>
              <button 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 px-4 py-2 rounded text-sm hover:bg-blue-100 flex items-center font-medium"
                onClick={() => setActiveTab('templates')}
              >
                Choose Template →
              </button>
            </div>
            
            <div className="space-y-4">
              {researchResults.map(item => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    item.category === 'statute' ? 'border-blue-500 bg-blue-50' :
                    item.category === 'precedent' ? 'border-purple-500 bg-purple-50' :
                    item.category === 'commentary' ? 'border-green-500 bg-green-50' :
                    'border-gray-500 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-900 text-base leading-relaxed">{item.content}</p>
                      <p className="text-sm text-gray-700 mt-1">Source: {item.source}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-700 mr-2">Relevance:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className={`h-2 w-2 rounded-full mx-0.5 ${star <= item.relevance ? 'bg-blue-600' : 'bg-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                    <button className="text-xs text-blue-700 hover:underline flex items-center">
                      <Bookmark className="w-3 h-3 inline mr-1" />
                      Save to reference
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Render comprehensive research report */}
            {renderResearchReport()}
          </div>
        )}
        
        {/* Templates tab content */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Select Document Template</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {legalTemplates.map(template => (
                <div 
                  key={template.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <h3 className="font-medium mb-1 text-gray-900">{template.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800 capitalize">
                    {template.category}
                  </span>
                  <p className="text-sm text-gray-700 mt-2">
                    {template.structure.length} sections
                  </p>
                </div>
              ))}
            </div>
            
            {selectedTemplate && (
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h3 className="font-medium mb-3 text-gray-900">Fill Template Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {getUniquePlaceholders().map(placeholder => (
                    <div key={placeholder}>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        {placeholder.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        value={templateValues[placeholder] || ''}
                        onChange={(e) => handleTemplateValueChange(placeholder, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded shadow hover:from-blue-700 hover:to-indigo-800 flex items-center"
                    onClick={generateDraft}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 mr-2" />
                        Generate Draft
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Draft tab content */}
        {activeTab === 'draft' && currentDraft && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            {/* Editor toolbar */}
            <div className="border-b border-gray-200 p-2 flex items-center bg-gradient-to-r from-gray-100 to-gray-200">
              <select className="mr-2 border border-gray-300 rounded px-2 py-1 bg-white text-gray-800">
                <option>Normal</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
              </select>
              <select className="mr-2 border border-gray-300 rounded px-2 py-1 bg-white text-gray-800">
                <option>Times New Roman</option>
                <option>Arial</option>
                <option>Calibri</option>
              </select>
              <div className="flex space-x-1 border-l border-gray-300 ml-2 pl-2">
                <button className="p-1 hover:bg-blue-100 rounded">
                  <Bold className="h-4 w-4 text-gray-700" />
                </button>
                <button className="p-1 hover:bg-blue-100 rounded">
                  <Italic className="h-4 w-4 text-gray-700" />
                </button>
                <button className="p-1 hover:bg-blue-100 rounded">
                  <Underline className="h-4 w-4 text-gray-700" />
                </button>
              </div>
              <div className="flex space-x-1 border-l border-gray-300 ml-2 pl-2">
                <button className="p-1 hover:bg-blue-100 rounded">
                  <List className="h-4 w-4 text-gray-700" />
                </button>
                <button className="p-1 hover:bg-blue-100 rounded">
                  <AlignLeft className="h-4 w-4 text-gray-700" />
                </button>
                <button className="p-1 hover:bg-blue-100 rounded">
                  <AlignCenter className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            </div>
            
            {/* Document content */}
            <div className="p-6 bg-white">
              <div className="max-w-4xl mx-auto">
                <textarea
                  className="w-full min-h-[600px] p-6 font-serif text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base leading-relaxed"
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                />
              </div>
            </div>
            
            {/* Document actions */}
            <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-gray-50">
              <div className="flex space-x-3">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded shadow hover:from-blue-700 hover:to-blue-800 flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded shadow hover:from-indigo-700 hover:to-purple-700 flex items-center"
                  onClick={handleAIEdit}
                  disabled={isEnhancing}
                >
                  {isEnhancing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enhance with AI
                    </>
                  )}
                </button>
                
                {/* Research integration options */}
                <div className="flex items-center space-x-2">
                  <button 
                    className={`text-gray-800 py-2 px-4 rounded border ${isIntegratingResearch ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:bg-gray-100'} flex items-center`}
                    onClick={() => setIsIntegratingResearch(!isIntegratingResearch)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Get Research
                  </button>
                  
                  {researchReport && (
                    <button 
                      className={`text-gray-800 py-2 px-4 rounded border ${enhanceWithResearch ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:bg-gray-100'} flex items-center`}
                      onClick={() => setEnhanceWithResearch(!enhanceWithResearch)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {enhanceWithResearch ? 'Using Research' : 'Use Research'}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-gray-700">Always review before submitting</span>
                <button className="ml-4 p-1 hover:bg-gray-100 rounded">
                  <ThumbsUp className="h-5 w-5 text-gray-500 hover:text-green-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ThumbsDown className="h-5 w-5 text-gray-500 hover:text-red-600" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Agent Information Banner */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg flex items-center shadow-sm">
          <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-2 mr-3">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800">LangChain Multi-Agent Powered Drafting</h3>
            <p className="text-blue-700 text-sm">
              Using LangChain agents with OpenRouter and Exa API to deliver intelligent legal drafts with latest precedents and {enhanceWithResearch ? 'in-depth' : 'standard'} research ({enhanceWithResearch ? '4' : '2'} iterations)
            </p>
          </div>
        </div>
      </div>
      
      {/* Assistance chat button */}
      <div className="fixed bottom-4 right-4">
        <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full p-3 shadow-lg hover:from-blue-700 hover:to-indigo-800">
          <MessageSquare className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default LegalDraftingSystem; 