import { useState, useEffect } from 'react';
import { TaskEventData } from '../../types';
import { Heart, Lock, HandshakeIcon, Users, Flame } from 'lucide-react';

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

const modeLabel: Record<TaskEventData['mode'], string> = {
  self: '个人执行',
  target: '指定目标',
  duel: '双人互动',
  all: '全场参与'
};

const intensityLabel: Record<TaskEventData['intensity'], string> = {
  warm: '升温',
  hot: '刺激',
  extreme: '放开玩'
};

const targetRuleLabel: Record<TaskEventData['targetRule'], string> = {
  self: '当前玩家',
  'chosen-player': '需指定目标',
  'collision-player': '碰撞对象',
  'all-players': '全员参与'
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
  const intensityColor =
    taskData.intensity === 'warm'
      ? 'text-amber-500 bg-amber-50 border-amber-100'
      : taskData.intensity === 'hot'
        ? 'text-rose-500 bg-rose-50 border-rose-100'
        : 'text-fuchsia-500 bg-fuchsia-50 border-fuchsia-100';

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
            <div className="flex flex-wrap justify-center gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${intensityColor}`}>
                <Flame size={12} />
                {intensityLabel[taskData.intensity]}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-rose-100 bg-white/80 text-xs font-semibold text-rose-500">
                <Users size={12} />
                {modeLabel[taskData.mode]}
              </span>
            </div>
          </div>

          <div className="flip-card-back border border-rose-100 p-6 shadow-[0_22px_48px_rgba(236,111,152,0.14)]">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className={taskData.color}>{iconMap[taskData.icon] || iconMap.favorite}</div>
              <h3 className="text-xl font-bold text-rose-950 mb-4 mt-4">{taskData.title}</h3>
              <div className="text-xs text-rose-400 text-center leading-relaxed mb-5 space-y-1">
                <div>{taskData.subtitle}</div>
                <div>
                  发起者：<span className="text-rose-600 font-semibold">{taskData.initiatorPlayerName}</span>
                </div>
                <div>
                  执行者：<span className="text-rose-600 font-semibold">{taskData.executorPlayerName}</span>
                </div>
              </div>

              <div className="w-full flex flex-wrap justify-center gap-2 mb-5">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${intensityColor}`}>
                  <Flame size={12} />
                  强度：{intensityLabel[taskData.intensity]}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-rose-100 bg-white/80 text-xs font-semibold text-rose-500">
                  <Users size={12} />
                  形式：{modeLabel[taskData.mode]}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-rose-100 bg-white/80 text-xs font-semibold text-rose-500">
                  接触等级：L{taskData.contactLevel}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-rose-100 bg-white/80 text-xs font-semibold text-rose-500">
                  目标：{targetRuleLabel[taskData.targetRule]}
                </span>
              </div>

              <div className="w-full bg-white/90 rounded-2xl p-6 min-h-[130px] flex flex-col items-center justify-center border border-rose-100 mb-6 shadow-sm">
                <p className="text-lg font-medium text-rose-950 text-center leading-relaxed">{taskData.task}</p>
                {taskData.targetRule === 'chosen-player' && (
                  <div className="mt-4 text-xs font-semibold text-rose-400">接受后需要先选择一位目标玩家</div>
                )}
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
