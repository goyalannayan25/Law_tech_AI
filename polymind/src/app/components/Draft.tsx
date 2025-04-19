import { RefreshCw, FileText, X, Download, BookText, Bookmark, Edit, Bold, Italic, Underline } from 'lucide-react';
import { useState, useRef } from 'react';

interface DraftProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
}

export default function Draft({ isOpen, onClose, initialPrompt }: DraftProps) {
  const [activeTab, setActiveTab] = useState('draft');
  const [draftText, setDraftText] = useState('');
  const [formDetails, setFormDetails] = useState({
    judgeName: '',
    courtLocation: '',
    caseNumber: '',
    petitionerName: '',
    respondentName: '',
    clientName: '',
    advocateName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchResults, setResearchResults] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle form detail changes
  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDetails(prev => ({ ...prev, [name]: value }));
  };

  // Generate draft using LangChain and LangGraph agents
  const generateDraft = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with actual LangChain agent call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Placeholder for the LangChain agent response
      const draftSample = `IN THE HIGH COURT OF DELHI AT NEW DELHI
EXTRAORDINARY CIVIL WRIT JURISDICTION
CIVIL WRIT PETITION NO. _________ OF 2023
IN THE MATTER OF:
Khan Gul                                              ... PETITIONER
                                VERSUS
Lakha Singh                                        ... RESPONDENT

MEMORIAL ON BEHALF OF THE PETITIONER

MOST RESPECTFULLY SHOWETH:

1. That the present petition under Article 226 of the Constitution of India is being filed by the petitioner against the illegal and unauthorized actions of the respondent in respect of the property bearing No. 123, Block A, Model Town, Delhi-110009 (hereinafter referred to as the "Suit Property").

2. The petitioner is the rightful owner of the Suit Property having purchased the same through a registered Sale Deed dated 15.04.2010 from the previous owner, Mr. Harpal Singh. The petitioner has been in peaceful possession of the property since the date of purchase.

3. The respondent, without any legal right or title, has recently started claiming ownership over the Suit Property based on an alleged Will dated 10.01.2009, purportedly executed by Mr. Harpal Singh in favor of the respondent.

4. The alleged Will is patently fabricated, as Mr. Harpal Singh had already executed a registered Sale Deed in favor of the petitioner, clearly indicating his intention to transfer absolute ownership rights to the petitioner.

5. Despite having no legal basis for his claim, the respondent has threatened to forcibly take possession of the Suit Property and has been harassing the petitioner and his family members.

GROUNDS

A. BECAUSE the petitioner is the lawful owner of the Suit Property by virtue of a registered Sale Deed dated 15.04.2010.

B. BECAUSE the alleged Will dated 10.01.2009 produced by the respondent is fabricated and has never been probated as required under Section 213 of the Indian Succession Act, 1925.

C. BECAUSE the actions of the respondent amount to an attempt to dispossess the petitioner from his legally owned property, which violates the petitioner's constitutional right to property under Article 300A of the Constitution of India.

D. BECAUSE the respondent's actions have created a cloud over the petitioner's title to the Suit Property, necessitating immediate intervention by this Hon'ble Court.

PRAYER

In view of the facts and circumstances mentioned above, it is most respectfully prayed that this Hon'ble Court may be pleased to:

a) Issue a writ in the nature of mandamus or any other appropriate writ, order or direction declaring that the petitioner is the rightful owner of the Suit Property;

b) Issue a permanent injunction restraining the respondent from interfering with the petitioner's peaceful possession and enjoyment of the Suit Property;

c) Direct the concerned authorities to maintain status quo with respect to the Suit Property pending the disposal of this petition;

d) Pass any other order or direction as this Hon'ble Court may deem fit and proper in the facts and circumstances of the case.

AND FOR THIS ACT OF KINDNESS, THE PETITIONER AS IN DUTY BOUND SHALL EVER PRAY.

DRAWN & FILED BY:
[ADVOCATE NAME]
Counsel for the Petitioner
Dated: [DATE]
Place: New Delhi`;

      setDraftText(draftSample);
    } catch (error) {
      console.error('Error generating draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Research relevant case laws using Exa API
  const researchCaseLaws = async () => {
    setIsResearching(true);
    try {
      // This would be replaced with actual Exa API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Placeholder for research results
      setResearchResults(`# Relevant Case Laws for Property Dispute (Memorial)

1. **Suraj Lamp & Industries Pvt. Ltd. v. State of Haryana (2012) 1 SCC 656**
   - Supreme Court held that immovable property can be legally and lawfully transferred/conveyed only by a registered deed of conveyance
   - Emphasized that transactions of the nature of 'General Power of Attorney sales' or 'GPA/SA/Will transfers' do not convey title and do not amount to transfer

2. **Vidyadhar v. Manikrao (1999) 3 SCC 573**
   - Supreme Court affirmed that registration of a sale deed is conclusive proof of transfer of property
   - Held that unregistered will cannot override a registered sale deed

3. **T. Arivandandam v. T.V. Satyapal (1977) 4 SCC 467**
   - Supreme Court observed that a cloud on title to property is a serious matter
   - Emphasized the jurisdiction of High Courts to remove cloud over title under Article 226

4. **Chandrabhan v. Narayan (2012) 4 MHLJ 859**
   - Competing claims between a Will and Sale Deed were examined
   - Court prioritized registered sale deed over an unregistered will

5. **R. Murugaiah v. Addl. Commissioner (2002) 2 MLJ 598**
   - Discussed relevance of possession in property disputes
   - Held that peaceful possession coupled with a registered deed provides strongest claim to property

## Legal Principles Applicable

1. A registered sale deed takes precedence over an unregistered will
2. Will requires probate under Section 213 of Indian Succession Act before it can be acted upon
3. Right to property is a constitutional right under Article 300A
4. Peaceful possession coupled with legal title provides strongest claim in property disputes`);
      
      setActiveTab('research');
    } catch (error) {
      console.error('Error researching case laws:', error);
    } finally {
      setIsResearching(false);
    }
  };

  // Download draft as Word document
  const downloadDraft = () => {
    // Logic to download the draft as a Word document
    alert('Downloading draft as Word document...');
  };

  // Initialize draft when component mounts
  if (isOpen && !draftText && !isLoading) {
    generateDraft();
  }

  // Format toolbar functionality
  const formatDoc = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-lg flex flex-col overflow-hidden shadow-2xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            <h2 className="font-medium">AI Draft Assistant</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'draft'
                ? 'border-b-2 border-blue-600 text-blue-700 bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('draft')}
          >
            <div className="flex items-center">
              <Edit className="h-4 w-4 mr-1" />
              Draft
            </div>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'research'
                ? 'border-b-2 border-blue-600 text-blue-700 bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('research')}
          >
            <div className="flex items-center">
              <BookText className="h-4 w-4 mr-1" />
              Research
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'draft' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Editor Area */}
              <div className="flex-1 overflow-auto p-4 bg-gray-50">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-700">Generating draft using AI agents...</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-md h-full">
                    {/* Simple editor toolbar */}
                    <div className="flex items-center p-2 border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-200">
                      <div className="flex space-x-1">
                        <button className="p-1 rounded hover:bg-blue-100" onClick={() => formatDoc('bold')}>
                          <Bold className="h-4 w-4 text-gray-700" />
                        </button>
                        <button className="p-1 rounded hover:bg-blue-100" onClick={() => formatDoc('italic')}>
                          <Italic className="h-4 w-4 text-gray-700" />
                        </button>
                        <button className="p-1 rounded hover:bg-blue-100" onClick={() => formatDoc('underline')}>
                          <Underline className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Editable content area */}
                    <div 
                      ref={editorRef}
                      className="p-6 h-full focus:outline-none font-serif text-gray-900 overflow-auto" 
                      contentEditable={true}
                      dangerouslySetInnerHTML={{ __html: draftText }}
                      onInput={(e) => setDraftText(e.currentTarget.innerHTML)}
                      suppressContentEditableWarning={true}
                    />
                  </div>
                )}
              </div>
              
              {/* Form Details */}
              <div className="p-4 bg-gray-100 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Document Details</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Judge Name</label>
                    <input
                      type="text"
                      name="judgeName"
                      value={formDetails.judgeName}
                      onChange={handleDetailChange}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded shadow-sm bg-white text-gray-900"
                      placeholder="Hon'ble Justice..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Court Location</label>
                    <input
                      type="text"
                      name="courtLocation"
                      value={formDetails.courtLocation}
                      onChange={handleDetailChange}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded shadow-sm bg-white text-gray-900"
                      placeholder="Delhi High Court"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Case Number</label>
                    <input
                      type="text"
                      name="caseNumber"
                      value={formDetails.caseNumber}
                      onChange={handleDetailChange}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded shadow-sm bg-white text-gray-900"
                      placeholder="WP(C) 1234/2023"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Petitioner Name</label>
                    <input
                      type="text"
                      name="petitionerName"
                      value={formDetails.petitionerName}
                      onChange={handleDetailChange}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded shadow-sm bg-white text-gray-900"
                      placeholder="Khan Gul"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Respondent Name</label>
                    <input
                      type="text"
                      name="respondentName"
                      value={formDetails.respondentName}
                      onChange={handleDetailChange}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded shadow-sm bg-white text-gray-900"
                      placeholder="Lakha Singh"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Client Name</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formDetails.clientName}
                      onChange={handleDetailChange}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded shadow-sm bg-white text-gray-900"
                      placeholder="Khan Gul"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Advocate Name</label>
                    <input
                      type="text"
                      name="advocateName"
                      value={formDetails.advocateName}
                      onChange={handleDetailChange}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded shadow-sm bg-white text-gray-900"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-auto bg-gray-50">
              {isResearching ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-700">Researching relevant case laws...</p>
                </div>
              ) : (
                <div className="prose max-w-none bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  {researchResults ? (
                    <div className="text-gray-900" dangerouslySetInnerHTML={{ __html: researchResults.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-800">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/^#{1,6}\s+(.*?)$/gm, '<h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-3">$1</h3>') }} />
                  ) : (
                    <div className="text-center py-12">
                      <BookText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No research results yet</h3>
                      <p className="text-gray-600 mb-6">Click the "See Relevant Case Laws" button to research related cases</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <button
              onClick={researchCaseLaws}
              disabled={isResearching}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-indigo-800 shadow-sm"
            >
              {isResearching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  See Relevant Case Laws / Research
                </>
              )}
            </button>
          </div>
          <div>
            <button
              onClick={generateDraft}
              disabled={isLoading}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center mr-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              )}
            </button>
            <button
              onClick={downloadDraft}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:from-blue-700 hover:to-blue-800 shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 