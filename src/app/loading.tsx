export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0401]">
      <div className="flex flex-col items-center gap-4">
        {/* Simple elegant spinner using the brand color */}
        <div className="w-12 h-12 border-4 border-[#D4A373]/30 border-t-[#D4A373] rounded-full animate-spin"></div>
        <p className="text-white/60 font-serif text-lg tracking-widest uppercase animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
