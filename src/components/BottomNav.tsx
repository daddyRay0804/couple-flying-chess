import { GamepadIcon } from 'lucide-react';

interface BottomNavProps {
  activeView: 'home' | 'game' | 'themes';
  onNavigate: (view: 'home' | 'themes') => void;
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  return (
    <nav className="h-[84px] ios-glass border-t border-rose-100 flex items-start justify-center pt-3 shrink-0 z-50 rounded-t-[28px]">
      <button
        className={`group flex flex-col items-center gap-1 w-20 transition-opacity ${
          activeView === 'home' || activeView === 'game' ? 'opacity-100' : 'opacity-50'
        }`}
        onClick={() => onNavigate('home')}
      >
        <GamepadIcon
          className={`transition-colors ${
            activeView === 'home' || activeView === 'game'
              ? 'text-rose-500'
              : 'text-rose-300 group-hover:text-rose-500'
          }`}
          size={26}
        />
        <span
          className={`text-[10px] font-medium transition-colors ${
            activeView === 'home' || activeView === 'game'
              ? 'text-rose-500'
              : 'text-rose-300 group-hover:text-rose-500'
          }`}
        >
          游戏
        </span>
      </button>
    </nav>
  );
}
