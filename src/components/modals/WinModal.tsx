interface WinModalProps {
  isOpen: boolean;
  winnerName: string;
  onRestart: () => void;
}

export function WinModal({ isOpen, winnerName, onRestart }: WinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/65 backdrop-blur-md">
      <div className="text-center animate-pulse bg-[linear-gradient(180deg,_#fffdfd_0%,_#fff3f6_100%)] px-10 py-12 rounded-[32px] border border-rose-100 shadow-[0_24px_56px_rgba(236,111,152,0.18)] max-w-md mx-6">
        <div className="text-7xl mb-6">👑</div>
        <h2 className="text-5xl font-bold text-rose-950 mb-2">{winnerName}</h2>
        <p className="text-rose-400 mb-4">第一个抵达终点，赢下本局</p>
        <div className="rounded-2xl bg-white/90 border border-rose-100 px-5 py-4 text-left mb-8 shadow-sm">
          <div className="text-xs font-semibold text-rose-300 uppercase tracking-[0.2em] mb-2">终点奖励</div>
          <div className="text-base font-semibold text-rose-700 leading-relaxed">
            由一名异性为冠军口交 3 分钟
          </div>
        </div>
        <button
          className="px-10 py-4 bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold text-lg rounded-full ios-btn shadow-[0_14px_30px_rgba(236,111,152,0.24)]"
          onClick={onRestart}
        >
          再来一局
        </button>
      </div>
    </div>
  );
}
