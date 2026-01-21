'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Logo } from '@/components/logo';
import {
  Home,
  ArrowLeft,
  Search,
  Smile,
  Frown,
  RotateCcw,
} from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [mood, setMood] = useState<'happy' | 'sad'>('happy');
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useEffect(() => {
    // Random mood
    setMood(Math.random() > 0.5 ? 'happy' : 'sad');
  }, []);

  const handleLogoClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowEasterEgg(true);
        setTimeout(() => setShowEasterEgg(false), 3000);
      }
      return newCount;
    });
  };

  const messages = [
    'Oops! Looks like this page went on vacation 🏖️',
    '404: The page you&apos;re looking for is playing hide and seek 🫥',
    'This page doesn&apos;t exist, but your curiosity does! 🧐',
    'Lost? Don&apos;t worry, even the best explorers get lost sometimes 🗺️',
    '404: Page not found, but we found your sense of adventure! ⚡',
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Logo with click easter egg */}
        <div className="mb-8 flex justify-center">
          <button
            type="button"
            onClick={handleLogoClick}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Logo href="/" size="lg" />
          </button>
        </div>

        {/* Easter Egg */}
        {showEasterEgg && (
          <div className="mb-4 animate-bounce rounded-lg bg-yellow-200 p-4 text-yellow-900">
            🎉 You found the easter egg! You clicked the logo {clickCount} times!
          </div>
        )}

        {/* Animated 404 */}
        <div className="mb-6">
          <h1 className="mb-2 text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 text-4xl">
            {mood === 'happy' ? (
              <Smile className="animate-bounce text-yellow-500" />
            ) : (
              <Frown className="animate-bounce text-blue-500" />
            )}
            <span className="text-2xl font-semibold text-gray-700">
              {randomMessage}
            </span>
          </div>
        </div>

        {/* Fun illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="h-48 w-48 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 opacity-20 blur-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-spin-slow">🌀</div>
            </div>
          </div>
        </div>

        {/* Helpful message */}
        <p className="mb-8 text-lg text-gray-600">
          Don&apos;t worry, it happens to the best of us! Let&apos;s get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            onClick={() => router.push('/')}
            size="lg"
            className="gap-2"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Try Again
          </Button>
        </div>

        {/* Fun facts */}
        <div className="mt-12 rounded-lg border border-gray-200 bg-white/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Did you know? 🤔
          </h3>
          <p className="text-sm text-gray-600">
            The 404 error got its name from room 404 at CERN, where the web was born.
            The room was used to store the web&apos;s first server, and when pages weren&apos;t
            found, people would say &quot;check room 404&quot;!
          </p>
        </div>

        {/* Search suggestion */}
        <div className="mt-6">
          <p className="mb-2 text-sm text-gray-500">
            Looking for something specific?
          </p>
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Search our site
          </Button>
        </div>
      </div>

      {/* Floating particles animation */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 animate-float rounded-full bg-blue-300 opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

