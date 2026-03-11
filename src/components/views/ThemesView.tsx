import { Theme } from '../../types';

interface ThemesViewProps {
  themes: Theme[];
  onCreateTheme: () => void;
  onEditTheme: (themeId: string) => void;
}

const audienceLabel: Record<Theme['audience'], string> = {
  common: '通用',
  male: '仅男方',
  female: '仅女方'
};

export function ThemesView({ themes, onCreateTheme, onEditTheme }: ThemesViewProps) {
  return (
    <div className="flex-1 flex flex-col min-h-max pb-24 pt-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-rose-950">任务主题库</h2>
        <button
          className="h-9 px-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white text-sm font-semibold ios-btn shadow-[0_10px_24px_rgba(236,111,152,0.22)]"
          onClick={onCreateTheme}
        >
          新建主题
        </button>
      </div>
      <div className="space-y-3 pb-8">
        {themes.map(theme => (
          <div
            key={theme.id}
            className="ios-card p-4 ios-btn cursor-pointer hover:shadow-[0_18px_36px_rgba(236,111,152,0.12)] transition-shadow"
            onClick={() => onEditTheme(theme.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-rose-950 font-semibold">{theme.name}</div>
                <div className="text-xs text-rose-400 mt-1">{theme.desc}</div>
                <div className="mt-2 inline-flex items-center gap-2">
                  <div className="bg-rose-50 px-2 py-1 rounded-full text-[10px] text-rose-500 border border-rose-100">
                    {audienceLabel[theme.audience]}
                  </div>
                </div>
              </div>
              <div className="bg-pink-50 px-2 py-1 rounded-full text-[10px] text-pink-500 border border-pink-100">
                {theme.tasks.length}卡
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
