import { useMemo, useState } from 'react';
import { Theme } from '../types';
import { getTaskLibrary, saveTaskLibrary } from '../data/taskLibrary';
import { Plus, Trash2, LogOut, Save } from 'lucide-react';

const LOGIN_CODE = 'admin2026';

export function AdminApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [themes, setThemes] = useState<Theme[]>(() => getTaskLibrary());

  const surprise = useMemo(() => themes.find(t => t.id === 'surprise')!, [themes]);
  const trap = useMemo(() => themes.find(t => t.id === 'trap')!, [themes]);

  const updateThemeTasks = (themeId: string, tasks: string[]) => {
    setThemes(prev => prev.map(theme => (theme.id === themeId ? { ...theme, tasks } : theme)));
  };

  const addTask = (themeId: string) => {
    const text = prompt('输入新任务内容');
    if (!text?.trim()) return;
    setThemes(prev =>
      prev.map(theme =>
        theme.id === themeId ? { ...theme, tasks: [...theme.tasks, text.trim()] } : theme
      )
    );
  };

  const editTask = (themeId: string, index: number) => {
    const theme = themes.find(t => t.id === themeId);
    const current = theme?.tasks[index] || '';
    const text = prompt('修改任务内容', current);
    if (!text?.trim()) return;
    setThemes(prev =>
      prev.map(theme =>
        theme.id === themeId
          ? { ...theme, tasks: theme.tasks.map((task, i) => (i === index ? text.trim() : task)) }
          : theme
      )
    );
  };

  const removeTask = (themeId: string, index: number) => {
    setThemes(prev =>
      prev.map(theme =>
        theme.id === themeId ? { ...theme, tasks: theme.tasks.filter((_, i) => i !== index) } : theme
      )
    );
  };

  const handleSave = () => {
    saveTaskLibrary(themes);
    alert('已保存任务库');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#fffafb_0%,_#fff4f7_58%,_#fffaf5_100%)] flex items-center justify-center px-6">
        <div className="w-full max-w-md ios-card p-8">
          <h1 className="text-2xl font-bold text-rose-950 text-center mb-2">任务管理端</h1>
          <p className="text-sm text-rose-400 text-center mb-6">输入登录码进入任务后台</p>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="请输入登录码"
            className="w-full h-12 px-4 rounded-2xl bg-white/90 text-rose-950 outline-none border border-rose-100 focus:border-rose-300"
          />
          {error && <div className="text-sm text-rose-500 mt-3">{error}</div>}
          <button
            className="w-full mt-4 h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-semibold"
            onClick={() => {
              if (code === LOGIN_CODE) {
                setAuthenticated(true);
                setError('');
              } else {
                setError('登录码错误');
              }
            }}
          >
            登录
          </button>
        </div>
      </div>
    );
  }

  const renderThemeSection = (theme: Theme, titleColor: string) => (
    <section className="ios-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${titleColor}`}>{theme.name}</h2>
          <p className="text-sm text-rose-400 mt-1">{theme.desc}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="h-10 px-4 rounded-2xl bg-white/90 border border-rose-100 text-rose-500 font-semibold flex items-center gap-2"
            onClick={() => addTask(theme.id)}
          >
            <Plus size={16} /> 添加
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {theme.tasks.map((task, index) => (
          <div key={`${theme.id}-${index}`} className="bg-white/90 border border-rose-100 rounded-2xl p-4 flex gap-3 items-start">
            <div className="text-xs text-rose-300 mt-1">{index + 1}</div>
            <button className="flex-1 text-left text-sm text-rose-950 leading-relaxed" onClick={() => editTask(theme.id, index)}>
              {task}
            </button>
            <button
              className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center"
              onClick={() => removeTask(theme.id, index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fffafb_0%,_#fff4f7_58%,_#fffaf5_100%)] px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="ios-card p-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-rose-950">情侣飞行棋 · 任务管理端</h1>
            <p className="text-sm text-rose-400 mt-1">这里只保留两类任务：惊喜 / 惩罚。点击任务文本即可直接修改。</p>
          </div>
          <div className="flex gap-2">
            <button
              className="h-11 px-4 rounded-2xl bg-white/90 border border-rose-100 text-rose-500 font-semibold flex items-center gap-2"
              onClick={handleSave}
            >
              <Save size={16} /> 保存
            </button>
            <button
              className="h-11 px-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 font-semibold flex items-center gap-2"
              onClick={() => setAuthenticated(false)}
            >
              <LogOut size={16} /> 退出
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderThemeSection(surprise, 'text-rose-600')}
          {renderThemeSection(trap, 'text-violet-600')}
        </div>
      </div>
    </div>
  );
}
