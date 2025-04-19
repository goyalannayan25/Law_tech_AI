'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import the Three.js component with no SSR
const ThreeBackground = dynamic(() => import('@/components/ui/polymind/ThreeBackground'), {
  ssr: false,
});

// Import a specialized login animation component
const LoginAnimation = dynamic(() => import('@/components/ui/polymind/LoginAnimation'), {
  ssr: false,
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login (in a real app, this would validate with a backend)
    setTimeout(() => {
      setLoading(false);
      // Redirect to the dashboard after login
      router.push('/login');
    }, 1500);
  };

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
      
      <div className="z-10 flex w-full max-w-5xl px-4 gap-8">
        {/* Left side - Information */}
        <div className="hidden lg:flex flex-col justify-center flex-1">
          <h2 className="text-3xl font-bold mb-6 text-violet-700">AI Jurist</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-md backdrop-blur-sm border border-black/5">
                <span className="material-icons text-violet-600">description</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-violet-700 mb-2">Smart Document Generation</h3>
                <p className="text-gray-700">Create legally sound documents with AI assistance tailored to Indian law</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-md backdrop-blur-sm border border-black/5">
                <span className="material-icons text-violet-600">gavel</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-violet-700 mb-2">Legal Compliance</h3>
                <p className="text-gray-700">Stay compliant with the latest Indian legal requirements and regulations</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-md backdrop-blur-sm border border-black/5">
                <span className="material-icons text-violet-600">security</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-violet-700 mb-2">Secure & Confidential</h3>
                <p className="text-gray-700">Your legal documents are protected with enterprise-grade security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1">
          <div 
            className="backdrop-blur-xl p-8 rounded-xl w-full max-w-md mx-auto shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(237, 233, 254, 0.7))',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="text-center mb-8">
              <h1 className="text-violet-700 text-3xl font-bold mb-2">Sign In</h1>
              <p className="text-violet-600">Access your legal document dashboard</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-violet-700 mb-2">
                  Professional Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-violet-600">email</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 p-3 bg-white/80 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 text-gray-700"
                    placeholder="name@firm.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-violet-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-violet-600">lock</span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 p-3 bg-white/80 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 text-gray-700"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-violet-700">
                  <input type="checkbox" className="mr-2 rounded border-violet-300 bg-white text-violet-500" />
                  Remember me
                </label>
                <a href="#" className="text-violet-600 hover:text-violet-800 hover:underline">
                  Forgot password?
                </a>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${
                  loading 
                    ? 'bg-violet-400 cursor-not-allowed' 
                    : 'bg-violet-500 hover:bg-violet-600'
                } text-white font-medium transition-all shadow-md hover:shadow-lg`}
              >
                {loading ? (
                  <>
                    <span className="material-icons animate-spin">refresh</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="material-icons">login</span>
                    Sign In
                  </>
                )}
              </button>
              
              <div className="text-center mt-6">
                <p className="text-violet-700 text-sm">
                  New to AI Jurist?{' '}
                  <a href="#" className="text-violet-600 hover:underline font-medium">
                    Create an account
                  </a>
                </p>
              </div>
            </form>
          </div>

          <div className="text-center mt-8 text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="text-violet-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-violet-600 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </main>
  );
} 