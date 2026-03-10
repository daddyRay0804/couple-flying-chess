import { Player } from '../../types';
import { User, UserRound } from 'lucide-react';

interface TargetPlayerModalProps {
  isOpen: boolean;
  players: Player[];
  initiatorPlayerId: number;
  onSelect: (playerId: number) => void;
  onClose: () => void;
}

export function TargetPlayerModal({ isOpen, players, initiatorPlayerId, onSelect, onClose }: TargetPlayerModalProps) {
  if (!isOpen) return null;

  const candidates = players.filter(player => player.id !== initiatorPlayerId);

  return (
    <div className="fixed inset-0 z-[150] flex items-end">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-[linear-gradient(180deg,_#fffdfd_0%,_#fff3f6_100%)] rounded-t-[32px] p-6 border-t border-rose-100 shadow-[0_-18px_40px_rgba(236,111,152,0.12)]">
        <div className="w-12 h-1 bg-rose-200 rounded-full mx-auto mb-6" />
        <h3 className="text-xl font-bold text-rose-950 mb-2 text-center">选择目标玩家</h3>
        <p className="text-sm text-rose-400 text-center mb-6">这张任务需要先指定一位互动对象</p>

        <div className="space-y-3 pb-4">
          {candidates.map(player => (
            <button
              key={player.id}
              type="button"
              onClick={() => onSelect(player.id)}
              className="w-full ios-card p-4 flex items-center gap-4 ios-btn text-left"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
                style={{ backgroundColor: player.color }}
              >
                {player.role === 'male' ? <User className="text-white" size={20} /> : <UserRound className="text-white" size={20} />}
              </div>
              <div>
                <div className="text-sm font-semibold text-rose-950">{player.name}</div>
                <div className="text-xs text-rose-400">点击指定为本轮互动对象</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
