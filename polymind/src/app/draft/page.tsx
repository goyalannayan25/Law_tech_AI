'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  ArrowLeft,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Copy
} from 'lucide-react';

interface DraftItem {
  id: string;
  title: string;
  type: string;
  date: string;
  status: 'completed' | 'in-progress' | 'draft';
}

export default function DraftsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for drafts
  const [drafts, setDrafts] = useState<DraftItem[]>([
    {
      id: '1',
      title: 'Bail Application for 498A',
      type: 'Bail Application',
      date: 'Apr 17, 2023',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Employment Contract for Software Engineer',
      type: 'Employment Contract',
      date: 'Apr 15, 2023',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Non-Disclosure Agreement for Startup',
      type: 'NDA',
      date: 'Apr 10, 2023',
      status: 'in-progress'
    },
    {
      id: '4',
      title: 'Property Sale Agreement',
      type: 'Sale Deed',
      date: 'Apr 5, 2023',
      status: 'draft'
    }
  ]);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  const filteredDrafts = drafts.filter(draft => 
    draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteDraft = (id: string) => {
    setDrafts(drafts.filter(draft => draft.id !== id));
    setActiveDropdown(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/agents" className="text-gray-600 hover:text-gray-800 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">My Drafts</h1>
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
            onClick={() => router.push('/draft/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Draft
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto p-4 w-full">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search drafts..."
            className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Drafts List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrafts.length > 0 ? (
                filteredDrafts.map(draft => (
                  <tr key={draft.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{draft.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{draft.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {draft.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${draft.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            draft.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}`}
                      >
                        {draft.status === 'completed' ? 'Completed' : 
                          draft.status === 'in-progress' ? 'In Progress' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium relative">
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => toggleDropdown(draft.id)}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {activeDropdown === draft.id && (
                        <div className="absolute right-8 top-10 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              onClick={() => router.push(`/draft/create?id=${draft.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                              onClick={() => deleteDraft(draft.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No drafts found. Create a new draft to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
} 