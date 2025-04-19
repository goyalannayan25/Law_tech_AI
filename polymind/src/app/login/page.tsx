'use client'; // Add this at the top to mark as a Client Component

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the Three.js component with no SSR
const ThreeBackground = dynamic(() => import('@/components/ui/polymind/ThreeBackground'), {
  ssr: false,
});

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100">
      {/* Dynamic Canvas Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30">
        <ThreeBackground />
      </div>
      
      {/* Decorative Elements */}
      <div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none -z-5"
        style={{
          backgroundImage: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(147, 51, 234, 0.1) 0%, rgba(237, 233, 254, 0) 70%)`,
        }}
      />
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-black/5 to-transparent rounded-full blur-3xl -z-5 transform translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-white/50 to-transparent rounded-full blur-3xl -z-5 transform -translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-1/3 left-1/4 w-1/4 h-1/4 bg-gradient-to-br from-purple-300/10 to-transparent rounded-full blur-3xl -z-5" />
      <div className="absolute bottom-1/3 right-1/4 w-1/4 h-1/4 bg-gradient-to-tl from-violet-300/10 to-transparent rounded-full blur-3xl -z-5" />
      
      {/* Content */}
      <div className="z-10 flex flex-col items-center gap-8 px-4 text-center max-w-5xl w-full">
        <div className="text-violet-700 text-[3rem] md:text-[5rem] font-bold">
          AI Jurist
        </div>
        
        <div className="text-violet-600 text-xl md:text-2xl mb-4">
          Your virtual drafting assistant for Indian Laws
        </div>

        <div 
          className="max-w-3xl text-gray-700 text-lg mb-8 p-6 backdrop-blur-md rounded-xl shadow-md"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(237, 233, 254, 0.7))',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          Seamlessly draft accurate and customized legal documents with the power of AI. 
          Specialized in Indian law, we help you create precise legal documents while ensuring 
          compliance with the latest regulations.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
          <div 
            className="p-6 rounded-xl backdrop-blur-sm border border-black/5 shadow-lg transition-all duration-300 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(237, 233, 254, 0.5))'
            }}
          >
            <div className="bg-white p-3 rounded-lg shadow-md backdrop-blur-sm inline-block mb-3 border border-black/5">
              <span className="material-icons text-violet-600">description</span>
            </div>
            <h3 className="text-violet-700 text-lg font-semibold mb-2">Document Templates</h3>
            <p className="text-gray-700">Access a wide range of pre-built templates for contracts, agreements, and legal notices</p>
          </div>
          <div 
            className="p-6 rounded-xl backdrop-blur-sm border border-black/5 shadow-lg transition-all duration-300 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(237, 233, 254, 0.5))'
            }}
          >
            <div className="bg-white p-3 rounded-lg shadow-md backdrop-blur-sm inline-block mb-3 border border-black/5">
              <span className="material-icons text-violet-600">gavel</span>
            </div>
            <h3 className="text-violet-700 text-lg font-semibold mb-2">Legal Compliance</h3>
            <p className="text-gray-700">Stay compliant with the latest Indian laws and regulations</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/agents" 
            className="bg-violet-500 hover:bg-violet-600 text-white py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            <span className="material-icons">description</span>
            Start Drafting
          </Link>
          
          <Link 
            href="/explore" 
            className="border border-violet-400 text-violet-700 hover:bg-violet-50 py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold backdrop-blur-sm"
          >
            <span className="material-icons">library_books</span>
            Browse Templates
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          Powered by advanced AI technology and up-to-date Indian legal knowledge
        </div>
      </div>
    </main>
  );
}
