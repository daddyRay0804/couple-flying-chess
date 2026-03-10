import { Player, Theme } from '../../types';
import { ChevronRight, User, UserRound } from 'lucide-react';

interface HomeViewProps {
  players: Player[];
  themes: Theme[];
  gameIntensity: 'warm' | 'hot' | 'extreme';
  onSelectTheme: (playerId: number) => void;
  onStartGame: () => void;
  onSetPlayerCount: (count: number) => void;
  onSetPlayerRole: (playerId: number, role: Player['role']) => void;
  onSetGameIntensity: (intensity: 'warm' | 'hot' | 'extreme') => void;
}

export function HomeView({
  players,
  themes,
  gameIntensity,
  onSelectTheme,
  onStartGame,
  onSetPlayerCount,
  onSetPlayerRole,
  onSetGameIntensity
}: HomeViewProps) {
  return (
    <div className="flex-1 flex flex-col justify-start space-y-8 mt-10">
      <div className="text-center mb-4">
        <h2 className="text-xl text-rose-900 font-semibold">配置游戏角色</h2>
        <p className="text-sm text-rose-400 mt-2">支持 2~4 人，自由组合男生女生玩家</p>
      </div>

      <div className="ios-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-rose-900">玩家人数</div>
            <div className="text-xs text-rose-400 mt-1">最多 4 人，自动命名为男1/女1等</div>
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

      <div className="ios-card p-4 space-y-3">
        <div>
          <div className="text-sm font-semibold text-rose-900">成人互动强度</div>
          <div className="text-xs text-rose-400 mt-1">决定任务的默认刺激等级与接触边界</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'warm', label: '升温' },
            { value: 'hot', label: '刺激' },
            { value: 'extreme', label: '放开玩' }
          ].map(item => {
            const active = gameIntensity === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onSetGameIntensity(item.value as 'warm' | 'hot' | 'extreme')}
                className={`h-11 rounded-2xl text-sm font-semibold ios-btn border transition-all ${
                  active
                    ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white border-transparent shadow-[0_12px_24px_rgba(236,111,152,0.2)]'
                    : 'bg-white/80 text-rose-500 border-rose-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {players.map(player => {
          const theme = themes.find(t => t.id === player.themeId);
          const isMale = player.role === 'male';

          return (
            <div key={player.id} className="ios-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shrink-0"
                    style={{
                      backgroundColor: player.color,
                      boxShadow: `0 10px 15px -3px ${player.color}30`
                    }}
                  >
                    {isMale ? <User className="text-white" size={24} /> : <UserRound className="text-white" size={24} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-rose-950 truncate">{player.name}</div>
                    <div className="text-sm font-medium text-rose-500 mt-0.5 truncate">
                      {theme?.name || '未选择主题'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="shrink-0 rounded-full bg-rose-50 border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-500 ios-btn"
                  onClick={() => onSelectTheme(player.id)}
                >
                  选主题
                </button>
              </div>

              <div className="flex items-center gap-2">
                {(['male', 'female'] as const).map(role => {
                  const active = player.role === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => onSetPlayerRole(player.id, role)}
                      className={`flex-1 h-10 rounded-2xl text-sm font-semibold border ios-btn transition-all ${
                        active
                          ? role === 'male'
                            ? 'bg-[#6d8ef7] text-white border-transparent'
                            : 'bg-[#ec6f98] text-white border-transparent'
                          : 'bg-white/80 text-rose-400 border-rose-100'
                      }`}
                    >
                      {role === 'male' ? '男生' : '女生'}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1" />

      <button
        className="w-full h-14 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-orange-300 text-white font-semibold text-lg shadow-[0_14px_30px_rgba(236,111,152,0.28)] ios-btn flex items-center justify-center gap-2 mb-8"
        onClick={onStartGame}
      >
        <span>开始游戏</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
