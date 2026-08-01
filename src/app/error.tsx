'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0401] text-white p-4">
      <div className="text-center bg-[#1A0A02] p-10 rounded-3xl border border-white/10 max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-serif text-[#D4A373] mb-4 font-bold">Something went wrong!</h2>
        <p className="text-white/60 mb-8 text-sm">We apologize for the inconvenience. Our technical team has been notified.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#D4A373] text-[#1A0A02] font-bold rounded-xl hover:bg-[#b45309] transition-colors"
          >
            Try again
          </button>
          <Link href="/" className="px-6 py-3 bg-[#0D0501] border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors font-medium">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
