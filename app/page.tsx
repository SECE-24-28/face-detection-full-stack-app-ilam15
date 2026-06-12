'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, LogOut, Clock, Calendar, ArrowRight, User as UserIcon, HelpCircle } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

interface ScanHistoryItem {
  id: string;
  imageUrl: string;
  age: number;
  gender: string;
  smile: number;
  createdAt: string;
  emotion: any;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch scans history
  useEffect(() => {
    async function fetchScans() {
      setLoadingHistory(true);
      try {
        const res = await fetch('/api/scans');
        if (res.ok) {
          const data = await res.json();
          setScans(data.scans || []);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    
    if (!checkingAuth) {
      fetchScans();
    }
  }, [checkingAuth]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/me', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.refresh();
        // Trigger history reload for guest
        setScans([]);
        const scansRes = await fetch('/api/scans');
        if (scansRes.ok) {
          const data = await scansRes.json();
          setScans(data.scans || []);
        }
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleUploadSuccess = (newScan: any) => {
    router.push(`/scan/${newScan.id}`);
  };

  return (
    <div className="flex-1 bg-black text-white min-h-screen relative flex flex-col font-sans">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4.5 flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent hover:opacity-95 flex items-center gap-2">
            AuraFace AI
          </Link>

          <div className="flex items-center gap-4">
            {checkingAuth ? (
              <div className="w-8 h-8 rounded-full border border-zinc-800 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-violet-500/50 bg-zinc-900"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-zinc-300">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-red-400 py-2 px-3 border border-zinc-850 hover:border-red-950/50 rounded-xl hover:bg-red-950/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-xs font-bold text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 flex flex-col gap-16 w-full">
        
        {/* Hero Introduction */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Analyze Facial Biometrics with{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
              Precision AI
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Upload portrait snapshots or capture from webcam. Detect key facial structures, extract micro-expressions, skin health, age estimates, and plot 83 landmark vectors in real-time.
          </p>
        </section>

        {/* Image Uploader Interface */}
        <section className="w-full">
          <ImageUploader onUploadSuccess={handleUploadSuccess} />
        </section>

        {/* Demo Notification if applicable */}
        <div className="bg-zinc-950/45 border border-zinc-900 p-4.5 rounded-2xl flex gap-3 text-xs text-zinc-400 max-w-xl mx-auto">
          <HelpCircle className="w-5 h-5 flex-shrink-0 text-violet-400" />
          <p className="leading-relaxed">
            <span className="font-semibold text-white">Running out of the box?</span> By default, this app includes a robust Mock Engine. If you haven&apos;t added Face++ API keys to your <code className="text-violet-300 font-mono">.env</code>, it automatically serves realistic biometric estimates so you can explore all features immediately.
          </p>
        </div>

        {/* Past Scans History Library */}
        <section className="w-full border-t border-zinc-900 pt-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">
                {user ? 'Your Scan History' : 'Recent Anonymous Scans'}
              </h2>
            </div>
            {!user && scans.length > 0 && (
              <span className="text-[10px] text-zinc-500 italic">Sign in to sync scans to your account</span>
            )}
          </div>

          {loadingHistory ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-zinc-950/40 border border-zinc-900 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-12 bg-zinc-950/20 border border-zinc-900 border-dashed rounded-2xl">
              <Clock className="w-8 h-8 text-zinc-650 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-400">No scans available</h3>
              <p className="text-xs text-zinc-650 mt-1 max-w-xs mx-auto">
                Any face scans analyzed will be cataloged here. Try uploading a photo above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {scans.map((scan) => {
                const date = new Date(scan.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <Link
                    key={scan.id}
                    href={`/scan/${scan.id}`}
                    className="group flex flex-col bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                  >
                    {/* Image Preview Container */}
                    <div className="aspect-[4/3] w-full relative bg-zinc-900 overflow-hidden border-b border-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={scan.imageUrl}
                        alt="Scan preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Information Summary */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                      <div>
                        <div className="flex justify-between items-baseline gap-1">
                          <span className="text-sm font-extrabold text-white">{scan.age} yrs</span>
                          <span className="text-[10px] text-violet-400 font-semibold">{scan.gender}</span>
                        </div>
                        
                        {scan.emotion && Object.keys(scan.emotion).length > 0 && (
                          <p className="text-[10px] text-zinc-450 mt-1 capitalize font-medium">
                            Dominant: {
                              Object.entries(scan.emotion).reduce(
                                (max: any, [k, v]: any) => (v > max[1] ? [k, v] : max),
                                ['Neutral', 0]
                              )[0]
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-zinc-550 pt-2 border-t border-zinc-900/50 mt-auto">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{date}</span>
                        </div>
                        <div className="text-zinc-400 group-hover:text-white transition-colors flex items-center gap-0.5 font-bold">
                          <span>View</span>
                          <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 bg-zinc-950/20 text-center text-[10px] text-zinc-600 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 AuraFace AI - Premium Face Analyze Diagnostics Dashboard</p>
        </div>
      </footer>
    </div>
  );
}
