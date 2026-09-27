export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Preserve header space */}
      <div className="h-20" />

      {/* Centered subtle loading indicator */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 animate-pulse" />
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)",
                animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
              }}
            />
          </div>
          <span className="text-xs font-medium text-slate-500 tracking-widest uppercase animate-pulse">
            Loading
          </span>
        </div>
      </div>
    </div>
  );
}
