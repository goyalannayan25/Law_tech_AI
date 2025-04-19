import React, { useState, useEffect } from 'react';
import { Save, Download, ThumbsUp, ThumbsDown, FileText, Search, Bookmark, PenTool, Book, GitBranch, AlertTriangle, MessageSquare, Bold, Italic, Underline, List, AlignLeft, AlignCenter, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { generateLegalDraftWithAI, searchLegalPrecedentsWithAI, enhanceDraftWithAI } from '../services/draftIntegration';

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
        id: 'application-title',
        title: 'Application Title',
        description: 'The title of the application',
        required: true,
        placeholders: ['BNS_SECTION'],
        defaultText: 'APPLICATION FOR GRANT OF BAIL UNDER SECTION {BNS_SECTION} OF BHARATIYA NYAYA SANHITA'
      },
      {
        id: 'respect-clause',
        title: 'Respect Clause',
        description: 'Formal respect shown to the court',
        required: true,
        placeholders: [],
        defaultText: 'Respectfully Sheweth:'
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
      },
      {
        id: 'signature',
        title: 'Signature Block',
        description: 'Place, date and signature',
        required: true,
        placeholders: ['PLACE', 'DATE', 'APPLICANT_NAME'],
        defaultText: 'Place: {PLACE}\nDate: {DATE}\n\n{APPLICANT_NAME} (Applicant)'
      }
    ]
  },
  {
    id: 'slp-supreme-court',
    name: 'Special Leave Petition under Article 136',
    category: 'constitutional',
    structure: [
      {
        id: 'heading',
        title: 'Court Details',
        description: 'The heading of the petition',
        required: true,
        placeholders: [],
        defaultText: 'IN THE SUPREME COURT OF INDIA\nCIVIL/CRIMINAL APPELLATE JURISDICTION'
      },
      {
        id: 'petition-details',
        title: 'Petition Details',
        description: 'Details of the SLP and article of constitution',
        required: true,
        placeholders: ['CASE_TYPE', 'PETITION_NUMBER', 'YEAR'],
        defaultText: 'SPECIAL LEAVE PETITION (CIVIL/CRLJ NO. {PETITION_NUMBER} OF {YEAR})\n(Under Article 136 of the Constitution of India)'
      },
      {
        id: 'parties',
        title: 'Parties',
        description: 'Details of the petitioner and respondent',
        required: true,
        placeholders: ['PETITIONER_NAME', 'RESPONDENT_NAME'],
        defaultText: 'IN THE MATTER OF:\n{PETITIONER_NAME} ...PETITIONER(S)\nVERSUS\n{RESPONDENT_NAME} ...RESPONDENT(S)'
      },
      // More sections would be defined here
    ]
  },
  {
    id: 'curative-petition',
    name: 'Curative Petition',
    category: 'constitutional',
    structure: [
      // Define structure similar to other templates
      {
        id: 'heading',
        title: 'Court Details',
        description: 'The heading of the curative petition',
        required: true,
        placeholders: [],
        defaultText: 'IN THE SUPREME COURT OF INDIA\nCURAVITE JURISDICTION'
      },
      // More sections would be defined here
    ]
  },
  {
    id: 'plaint-civil',
    name: 'Civil Plaint',
    category: 'civil',
    structure: [
      // Define structure similar to other templates
      {
        id: 'heading',
        title: 'Court Details',
        description: 'The heading of the plaint',
        required: true,
        placeholders: ['COURT_NAME', 'COURT_LOCATION'],
        defaultText: 'IN THE COURT OF {COURT_NAME}\nAT {COURT_LOCATION}'
      },
      // More sections would be defined here
    ]
  },
  {
    id: 'written-statement',
    name: 'Written Statement',
    category: 'civil',
    structure: [
      // Define structure similar to other templates
      {
        id: 'heading',
        title: 'Court Details',
        description: 'The heading of the written statement',
        required: true,
        placeholders: ['COURT_NAME', 'COURT_LOCATION'],
        defaultText: 'IN THE COURT OF {COURT_NAME}\nAT {COURT_LOCATION}'
      },
      // More sections would be defined here
    ]
  },
  {
    id: 'memorial',
    name: 'Memorial (Moot Court)',
    category: 'other',
    structure: [
      // Define structure similar to other templates
      {
        id: 'cover-page',
        title: 'Cover Page',
        description: 'The cover page of the memorial',
        required: true,
        placeholders: ['COMPETITION_NAME', 'TEAM_CODE'],
        defaultText: '{COMPETITION_NAME}\n\nMEMORIAL FOR THE PETITIONER/RESPONDENT\n\nTEAM CODE: {TEAM_CODE}'
      },
      // More sections would be defined here
    ]
  }
];

// Main component for general purpose legal drafting
const LegalDraftingSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'draft' | 'research' | 'templates'>('draft');
  const [userInput, setUserInput] = useState<string>('');
  const [researchResults, setResearchResults] = useState<ResearchPoint[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [currentDraft, setCurrentDraft] = useState<DraftState | null>(null);
  const [draftText, setDraftText] = useState<string>('');
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Simulate research generation from LLM
  const generateResearch = async (query: string) => {
    setIsGenerating(true);
    
    try {
      // Call the actual AI API through our integration
      const results = await searchLegalPrecedentsWithAI(query);
      
      if (results.length > 0) {
        setResearchResults(results);
        setActiveTab('research');
      } else {
        // Fallback to mock data if the API fails or returns empty results
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
      // Show a fallback UI here if needed
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate draft based on template and research
  const generateDraft = async () => {
    if (!selectedTemplate) return;
    
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
          .map((r, i) => `${i+1}. ${r.content} ${r.category === 'precedent' ? `(${r.source})` : ''}`).join('\n');
        
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

  // Handle AI-powered editing through our integration
  const handleAIEdit = async () => {
    if (!draftText || !currentDraft) return;
    
    try {
      const instructions = "Improve the language, add more legal citations, and make the arguments more persuasive.";
      const enhancedContent = await enhanceDraftWithAI(draftText, instructions);
      
      if (enhancedContent && enhancedContent.trim()) {
        setDraftText(enhancedContent);
        currentDraft.content = enhancedContent;
        setCurrentDraft({...currentDraft});
      }
    } catch (error) {
      console.error('Error editing with AI:', error);
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

  // Process initial user request
  const processUserRequest = () => {
    if (!userInput.trim()) return;
    
    // In a real app, this would be processed by the LLM to determine:
    // 1. What type of document is needed
    // 2. What research needs to be done
    
    // For demonstration, we'll simulate this process
    generateResearch(userInput);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">AI Jurist</h1>
          <div className="flex items-center space-x-2">
            <button className="bg-blue-500 bg-opacity-30 hover:bg-opacity-40 px-3 py-1 rounded text-sm flex items-center">
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </button>
            <span className="text-sm">Last saved: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container mx-auto p-4">
        {/* Initial input form */}
        {!researchResults.length && !currentDraft && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">What legal document do you need?</h2>
            <div className="mb-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your legal requirements in detail. For example: 'I need to draft a bail application under the Bharatiya Nyaya Sanhita for my client who has been falsely accused in a domestic violence case with FIR No. 123/2024 at Kotwali Police Station, Delhi.'"
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Our AI will research relevant laws, precedents, and draft appropriate legal documents.
              </div>
              <button 
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded shadow hover:from-blue-700 hover:to-indigo-800 flex items-center"
                onClick={processUserRequest}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Begin Research
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Tabs navigation once we have research or drafts */}
        {(researchResults.length > 0 || currentDraft) && (
          <div className="mb-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <button 
                className={`py-2 px-4 font-medium ${activeTab === 'draft' ? 'text-blue-700 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('draft')}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Draft
              </button>
              <button 
                className={`py-2 px-4 font-medium ${activeTab === 'research' ? 'text-blue-700 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('research')}
              >
                <Search className="w-4 h-4 inline mr-1" />
                Research
              </button>
              <button 
                className={`py-2 px-4 font-medium ${activeTab === 'templates' ? 'text-blue-700 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('templates')}
              >
                <Book className="w-4 h-4 inline mr-1" />
                Templates
              </button>
            </div>
          </div>
        )}
        
        {/* Research tab content */}
        {activeTab === 'research' && researchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Research Results</h2>
              <button 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 px-3 py-1 rounded text-sm hover:bg-blue-100 flex items-center"
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
                      <p className="text-gray-800">{item.content}</p>
                      <p className="text-sm text-gray-600 mt-1">Source: {item.source}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Relevance:</span>
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
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                    <button className="text-xs text-blue-600 hover:underline flex items-center">
                      <Bookmark className="w-3 h-3 inline mr-1" />
                      Save to reference
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Templates tab content */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Select Document Template</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {legalTemplates.map(template => (
                <div 
                  key={template.id} 
                  className={`border rounded-lg p-4 cursor-pointer ${
                    selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <h3 className="font-medium mb-1 text-gray-800">{template.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 capitalize">
                    {template.category}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    {template.structure.length} sections
                  </p>
                </div>
              ))}
            </div>
            
            {selectedTemplate && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium mb-3 text-gray-800">Fill Template Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {getUniquePlaceholders().map(placeholder => (
                    <div key={placeholder}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Draft
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
            <div className="p-6">
              <textarea
                className="w-full min-h-[600px] p-4 font-serif text-gray-900 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                style={{ fontFamily: 'Times New Roman, serif' }}
              />
            </div>
            
            {/* Document actions */}
            <div className="border-t border-gray-200 p-3 flex justify-between items-center bg-gray-50">
              <div className="flex space-x-2">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1 px-3 rounded shadow hover:from-blue-700 hover:to-blue-800 flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                <button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-1 px-3 rounded shadow hover:from-indigo-700 hover:to-purple-700 flex items-center"
                  onClick={handleAIEdit}
                >
                  <PenTool className="h-4 w-4 mr-1" />
                  Edit with AI
                </button>
                <button className="text-blue-700 hover:underline flex items-center">
                  <GitBranch className="h-4 w-4 mr-1" />
                  Create Version
                </button>
              </div>
              <div className="flex space-x-2 items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-gray-600">Always review before submitting</span>
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