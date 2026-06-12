'use client';

import React, { useState } from 'react';
import { User, Activity, Smile, BarChart3, Heart, Percent } from 'lucide-react';

interface FaceAttributesProps {
  attributes: {
    gender: { value: 'Male' | 'Female' };
    age: { value: number };
    smiling: { value: number; threshold: number };
    emotion: {
      anger: number;
      disgust: number;
      fear: number;
      happiness: number;
      neutral: number;
      sadness: number;
      surprise: number;
    };
    beauty: { male_score: number; female_score: number };
    skinstatus: { health: number; stain: number; acne: number; dark_circle: number };
    eyestatus: { left_eye_status: Record<string, number>; right_eye_status: Record<string, number> };
    mouthstatus: { close: number; open_mouth_no_surgical_mask: number; surgical_mask_or_respirator: number };
    headpose: { pitch_angle: number; roll_angle: number; yaw_angle: number };
    facequality: { value: number; threshold: number };
  };
}

type TabType = 'overview' | 'emotions' | 'beauty' | 'biometrics';

export default function FaceAttributes({ attributes }: FaceAttributesProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const {
    gender,
    age,
    smiling,
    emotion,
    beauty,
    skinstatus,
    eyestatus,
    mouthstatus,
    headpose,
    facequality,
  } = attributes;

  // Find dominant emotion
  const dominantEmotion = Object.entries(emotion).reduce(
    (max, [key, val]) => (val > max[1] ? [key, val] : max),
    ['neutral', 0]
  );

  const emotionColors: Record<string, { fill: string; track: string; bg: string }> = {
    happiness: { fill: 'bg-yellow-500', track: 'bg-yellow-950/30', bg: 'text-yellow-400' },
    neutral: { fill: 'bg-zinc-400', track: 'bg-zinc-800/30', bg: 'text-zinc-400' },
    sadness: { fill: 'bg-sky-500', track: 'bg-sky-950/30', bg: 'text-sky-400' },
    anger: { fill: 'bg-red-500', track: 'bg-red-950/30', bg: 'text-red-400' },
    surprise: { fill: 'bg-purple-500', track: 'bg-purple-950/30', bg: 'text-purple-400' },
    disgust: { fill: 'bg-emerald-600', track: 'bg-emerald-950/30', bg: 'text-emerald-500' },
    fear: { fill: 'bg-orange-500', track: 'bg-orange-950/30', bg: 'text-orange-400' },
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-lg">
      {/* Dynamic Tab Switcher */}
      <div className="flex gap-1 border-b border-zinc-850 pb-3 overflow-x-auto scrollbar-none">
        {(
          [
            { id: 'overview', label: 'Biometric Metrics', icon: User },
            { id: 'emotions', label: 'Emotion Profile', icon: Smile },
            { id: 'beauty', label: 'Beauty & Skin', icon: Heart },
            { id: 'biometrics', label: 'Technical Data', icon: Activity },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-4 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-violet-950/40 border-violet-800 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                  : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[300px]">
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            {/* Primary Attributes Card */}
            <div className="bg-zinc-950/40 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Estimated Profile</span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">{age.value}</span>
                  <span className="text-zinc-400 text-sm font-semibold">years old</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-violet-400 font-semibold text-lg">
                  <span className="capitalize">{gender.value}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-850">
                <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1.5">
                  <span>Confidence Level (Quality)</span>
                  <span>{facequality.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-850 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                    style={{ width: `${facequality.value}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Smile Score Card */}
            <div className="bg-zinc-950/40 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Expression</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{smiling.value.toFixed(1)}</span>
                  <Percent className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="mt-4 text-sm text-zinc-400 font-medium leading-relaxed">
                  {smiling.value > 70
                    ? 'Radiant smile detected. Expression is highly positive.'
                    : smiling.value > 30
                    ? 'Subtle or friendly smile detected.'
                    : 'Serene/Neutral expression. No smile detected.'}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-850">
                <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1.5">
                  <span>Smile Intensity</span>
                  <span>{smiling.value.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-850 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${smiling.value}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Dominant Emotion Summary */}
            <div className="sm:col-span-2 bg-zinc-950/40 border border-zinc-850 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-950/30 border border-violet-900/50 flex items-center justify-center flex-shrink-0 text-violet-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Dominant Emotion</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  The primary emotion expressed on the face is{' '}
                  <span className="font-semibold text-violet-300 capitalize">{dominantEmotion[0]}</span> with a{' '}
                  <span className="font-semibold text-white">{(dominantEmotion[1] as number).toFixed(1)}%</span> confidence rating.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EMOTIONS PANEL */}
        {activeTab === 'emotions' && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Micro-Expressions Breakdown</h4>
            <div className="space-y-3">
              {Object.entries(emotion)
                .sort((a, b) => b[1] - a[1]) // Sort desc
                .map(([name, score]) => {
                  const percent = score as number;
                  const palette = emotionColors[name] || { fill: 'bg-zinc-400', track: 'bg-zinc-800/30', bg: 'text-zinc-400' };
                  return (
                    <div key={name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="capitalize text-zinc-350">{name}</span>
                        <span className={palette.bg}>{percent.toFixed(1)}%</span>
                      </div>
                      <div className={`h-2 w-full ${palette.track} rounded-full overflow-hidden`}>
                        <div
                          className={`h-full ${palette.fill} rounded-full transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* BEAUTY & SKIN PANEL */}
        {activeTab === 'beauty' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
            {/* Beauty Standard Scores */}
            <div className="bg-zinc-950/40 border border-zinc-850 p-5 rounded-2xl flex flex-col gap-4">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Aesthetic Quality</span>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1.5">
                    <span>Female Standard Score</span>
                    <span className="text-pink-400 font-bold">{beauty.female_score} / 100</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-850 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${beauty.female_score}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1.5">
                    <span>Male Standard Score</span>
                    <span className="text-cyan-400 font-bold">{beauty.male_score} / 100</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-850 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${beauty.male_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <p className="text-[10px] text-zinc-500 italic mt-auto pt-2 border-t border-zinc-850">
                * Beauty scores reflect general symmetric metrics compiled by Face++ AI standards.
              </p>
            </div>

            {/* Skin Status */}
            <div className="bg-zinc-950/40 border border-zinc-850 p-5 rounded-2xl flex flex-col gap-3">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Dermatological Estimate</span>
              
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850 text-center">
                  <div className="text-2xl font-extrabold text-emerald-400">{skinstatus.health}%</div>
                  <div className="text-[10px] text-zinc-400 font-semibold mt-1">Skin Health</div>
                </div>

                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850 text-center">
                  <div className="text-2xl font-extrabold text-yellow-500">{skinstatus.stain.toFixed(0)}%</div>
                  <div className="text-[10px] text-zinc-400 font-semibold mt-1">Stain Index</div>
                </div>

                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850 text-center">
                  <div className="text-2xl font-extrabold text-orange-500">{skinstatus.acne.toFixed(0)}%</div>
                  <div className="text-[10px] text-zinc-400 font-semibold mt-1">Acne Index</div>
                </div>

                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850 text-center">
                  <div className="text-2xl font-extrabold text-purple-400">{skinstatus.dark_circle.toFixed(0)}%</div>
                  <div className="text-[10px] text-zinc-400 font-semibold mt-1">Dark Circle</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BIOMETRICS PANEL */}
        {activeTab === 'biometrics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            {/* Eye Status Card */}
            <div className="bg-zinc-950/40 border border-zinc-850 p-4.5 rounded-2xl">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Ocular Status</span>
              
              <div className="mt-3.5 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <span>Left Eye Open Status:</span>
                  <span className="text-white">
                    {(eyestatus.left_eye_status?.no_glass_eye_open || 
                      eyestatus.left_eye_status?.normal_glass_eye_open || 99).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <span>Right Eye Open Status:</span>
                  <span className="text-white">
                    {(eyestatus.right_eye_status?.no_glass_eye_open || 
                      eyestatus.right_eye_status?.normal_glass_eye_open || 99).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <span>Prescription Glasses:</span>
                  <span className="text-violet-400 font-bold">
                    {(eyestatus.left_eye_status?.normal_glass_eye_open || 0) > 20 ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mouth / Facial Mask */}
            <div className="bg-zinc-950/40 border border-zinc-850 p-4.5 rounded-2xl">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Facial Cover & Lips</span>
              
              <div className="mt-3.5 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <span>Mouth Status Close:</span>
                  <span className="text-white">{(mouthstatus.close || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <span>Surgical Mask:</span>
                  <span className="text-emerald-400 font-bold">
                    {(mouthstatus.surgical_mask_or_respirator || 0) > 30 ? 'Detected' : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Head Pose angles */}
            <div className="sm:col-span-2 bg-zinc-950/40 border border-zinc-850 p-4.5 rounded-2xl">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Head Rotation Angles</span>
              
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-850/60">
                  <div className="text-sm font-extrabold text-white">{headpose.pitch_angle}°</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Pitch (Nod)</div>
                </div>

                <div className="bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-850/60">
                  <div className="text-sm font-extrabold text-white">{headpose.roll_angle}°</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Roll (Tilt)</div>
                </div>

                <div className="bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-850/60">
                  <div className="text-sm font-extrabold text-white">{headpose.yaw_angle}°</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Yaw (Turn)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
