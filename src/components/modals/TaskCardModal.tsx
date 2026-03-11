import { useState, useEffect } from 'react';
import { TaskEventData } from '../../types';
import { Heart, Lock, HandshakeIcon } from 'lucide-react';

interface TaskCardModalProps {
  isOpen: boolean;
  taskData: TaskEventData | null;
  onAccept: () => void;
  onReject: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  favorite: <Heart size={40} fill="currentColor" />,
  lock: <Lock size={40} />,
  handshake: <HandshakeIcon size={40} />
};

export function TaskCardModal({ isOpen, taskData, onAccept, onReject }: TaskCardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsFlipped(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !taskData) return null;

  const rejectLabel = taskData.type === 'collision' ? '拒绝（回到起点）' : '拒绝（倒退1~3格）';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-white/45 backdrop-blur-md" />

      <div className="relative w-full max-w-sm h-[460px] perspective-1000">
        <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
          <div
            className="flip-card-front bg-[linear-gradient(180deg,_#fffdfd_0%,_#fff4f7_100%)] border border-rose-100 p-6 flex flex-col items-center justify-center shadow-[0_22px_48px_rgba(236,111,152,0.14)] cursor-pointer"
            onClick={() => setIsFlipped(true)}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center mb-6 animate-pulse shadow-inner">
              <div className={taskData.color}>{iconMap[taskData.icon] || iconMap.favorite}</div>
            </div>
            <h3 className="text-2xl font-bold text-rose-950 mb-2">{taskData.title}</h3>
            <p className="text-sm text-rose-300 uppercase tracking-widest mb-4">点击翻转查看任务</p>
          </div>

          <div className="flip-card-back border border-rose-100 p-6 shadow-[0_22px_48px_rgba(236,111,152,0.14)]">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className={taskData.color}>{iconMap[taskData.icon] || iconMap.favorite}</div>
              <h3 className="text-xl font-bold text-rose-950 mb-4 mt-4">{taskData.title}</h3>
              <div className="text-sm text-rose-400 text-center leading-relaxed mb-5 space-y-2">
                <div>{taskData.subtitle}</div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-2xl border border-rose-100 bg-white/90 px-4 py-4 text-center shadow-sm">
                  <div className="text-xs text-rose-300 mb-1">发起者</div>
                  <div className="text-xl font-bold text-rose-700">{taskData.initiatorPlayerName}</div>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-white/90 px-4 py-4 text-center shadow-sm">
                  <div className="text-xs text-rose-300 mb-1">参与者</div>
                  <div className="text-xl font-bold text-rose-700">{taskData.executorPlayerName}</div>
                </div>
              </div>

              <div className="w-full bg-white/90 rounded-2xl p-6 min-h-[130px] flex flex-col items-center justify-center border border-rose-100 mb-6 shadow-sm">
                <p className="text-lg font-medium text-rose-950 text-center leading-relaxed">{taskData.task}</p>
              </div>
            </div>

            <div className="w-full flex gap-3 mt-auto">
              <button
                className="flex-1 h-12 rounded-full bg-rose-50 text-rose-500 font-bold text-sm ios-btn border border-rose-100 hover:border-rose-300"
                onClick={onReject}
              >
                {rejectLabel}
              </button>
              <button
                className="flex-1 h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold text-sm ios-btn shadow-[0_12px_28px_rgba(236,111,152,0.24)]"
                onClick={onAccept}
              >
                接受任务
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
