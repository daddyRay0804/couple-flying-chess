import { Player } from '../../types';
import { ChevronRight } from 'lucide-react';

interface HomeViewProps {
  players: Player[];
  onStartGame: () => void;
  onSetPlayerCount: (count: number) => void;
  onSetPlayerRole: (playerId: number, role: Player['role']) => void;
}

export function HomeView({ players, onStartGame, onSetPlayerCount, onSetPlayerRole }: HomeViewProps) {
  return (
    <div className="flex-1 flex flex-col justify-start space-y-8 mt-2 min-h-max pb-24">
      <div className="text-center mb-4">
        <h2 className="text-xl text-rose-900 font-semibold">设置玩家后直接开玩</h2>
        <p className="text-sm text-rose-400 mt-2">系统自动使用多人惊喜 / 陷阱任务，不再需要手动选题库</p>
      </div>

      <div className="ios-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-rose-900">玩家人数</div>
            <div className="text-xs text-rose-400 mt-1">支持 2~4 人，多人规则已自动匹配</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[2, 3, 4].map(count => {
            const isActive = players.length === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onSetPlayerCount(count)}
                className={`h-11 rounded-2xl text-sm font-semibold ios-btn border transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white border-transparent shadow-[0_12px_24px_rgba(236,111,152,0.2)]'
                    : 'bg-white/80 text-rose-500 border-rose-100'
                }`}
              >
                {count} 人
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {players.map(player => {
          const isMale = player.role === 'male';

          return (
            <div key={player.id} className="ios-card p-5 space-y-4">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg shrink-0 text-white text-2xl font-bold"
                  style={{
                    backgroundColor: player.color,
                    boxShadow: `0 10px 15px -3px ${player.color}30`
                  }}
                >
                  {isMale ? '♂' : '♀'}
                </div>
                <div className="min-w-0">
                  <div className="text-base font-semibold text-rose-950 truncate">{player.name}</div>
                  <div className="text-sm font-medium text-rose-500 mt-0.5 truncate">
                    {isMale ? '男玩家棋子' : '女玩家棋子'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {([
                  { role: 'male', label: '男', symbol: '♂' },
                  { role: 'female', label: '女', symbol: '♀' }
                ] as const).map(item => {
                  const active = player.role === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => onSetPlayerRole(player.id, item.role)}
                      className={`flex-1 h-11 rounded-2xl text-sm font-semibold border ios-btn transition-all flex items-center justify-center gap-2 ${
                        active
                          ? item.role === 'male'
                            ? 'bg-[#6d8ef7] text-white border-transparent'
                            : 'bg-[#ec6f98] text-white border-transparent'
                          : 'bg-white/80 text-rose-400 border-rose-100'
                      }`}
                    >
                      <span className="text-base leading-none">{item.symbol}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ios-card p-4 space-y-2">
        <div className="text-sm font-semibold text-rose-900">棋盘规则</div>
        <div className="text-sm text-rose-500">✨ 惊喜：当前玩家获得主动权，指定对象或发起互动</div>
        <div className="text-sm text-violet-500">💣 陷阱：当前玩家进入被动惩罚或被他人指定互动</div>
      </div>

      <button
        className="w-full h-14 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-orange-300 text-white font-semibold text-lg shadow-[0_14px_30px_rgba(236,111,152,0.28)] ios-btn flex items-center justify-center gap-2 mb-8"
        onClick={onStartGame}
      >
        <span>直接开始</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
