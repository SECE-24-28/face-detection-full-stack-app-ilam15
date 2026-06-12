'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Calendar, ClipboardCheck, Sparkles, Loader } from 'lucide-react';
import FaceViewer from '../../../components/FaceViewer';
import FaceAttributes from '../../../components/FaceAttributes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ScanResultPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = React.use(params);

  const [scan, setScan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchScanDetails() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/scans/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Scan record not found.');
          }
          throw new Error('Failed to retrieve scan details.');
        }
        const data = await res.json();
        setScan(data.scan);
      } catch (err: any) {
        console.error('Failed to load scan details:', err);
        setError(err.message || 'An error occurred while loading results.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchScanDetails();
    }
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-black text-white flex flex-col items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-violet-500 animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-zinc-300">Retrieving Scan Results</h2>
        <p className="text-xs text-zinc-500 mt-2">Loading facial vectors and model attributes...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex-1 bg-black text-white flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-950/30 border border-red-900 flex items-center justify-center text-red-500 mb-5">
          <ArrowLeft className="w-6 h-6 rotate-45" />
        </div>
        <h2 className="text-xl font-bold text-white">Analysis Retrieval Failed</h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-sm leading-relaxed">{error || 'This scan scan does not exist or has been deleted.'}</p>
        <Link
          href="/"
          className="mt-8 px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl hover:bg-zinc-850 hover:text-white transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const scanDate = new Date(scan.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex-1 bg-black text-white min-h-screen relative flex flex-col font-sans pb-16">
      {/* Background visual graphics */}
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] bg-fuchsia-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Details Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4.5 flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent hover:opacity-95 flex items-center gap-2">
            AuraFace AI
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white py-2 px-3 border border-zinc-850 hover:border-zinc-750 rounded-xl transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Results Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full flex flex-col gap-8">
        
        {/* Banner metadata */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Scan Completed
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 flex items-center gap-3">
              Biometric Analysis Report
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{scanDate}</span>
              {scan.user && (
                <>
                  <span className="mx-1">•</span>
                  <span>Analyzed for {scan.user.name}</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className={`w-full md:w-auto flex items-center justify-center gap-2.5 text-xs font-bold py-3 px-5 border rounded-xl transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-950/30 border-emerald-850 text-emerald-350 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <ClipboardCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Results Report</span>
              </>
            )}
          </button>
        </div>

        {/* Side-by-Side Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Image/Canvas Viewer */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-300 px-1">Biometric Keypoint Plotter</h3>
            <FaceViewer
              imageUrl={scan.imageUrl}
              faceRectangle={scan.faceRectangle}
              landmarks={scan.landmarks}
            />
          </div>

          {/* Right: Detailed Analytics Metrics */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-300 px-1">Biometric Diagnostic Metrics</h3>
            <FaceAttributes
              attributes={{
                gender: { value: scan.gender },
                age: { value: scan.age },
                smiling: { value: scan.smile, threshold: 50 },
                emotion: scan.emotion,
                beauty: scan.beautyScore,
                skinstatus: scan.skinStatus,
                eyestatus: scan.eyeStatus,
                mouthstatus: scan.mouthStatus,
                headpose: scan.headPose,
                facequality: { value: scan.age > 0 ? 88 : 0, threshold: 70 }, // fallback face quality metrics
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
