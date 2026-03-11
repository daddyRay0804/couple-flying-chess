import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { Theme } from '../../types';

interface ThemeEditorModalProps {
  isOpen: boolean;
  theme: Theme | null;
  onClose: () => void;
  onSaveMeta: (themeId: string, patch: Partial<Pick<Theme, 'name' | 'desc' | 'audience'>>) => void;
  onAddTask: (themeId: string, taskText: string) => void;
  onRemoveTask: (themeId: string, index: number) => void;
  onOpenAiImport: (themeId: string) => void;
}

const audienceOptions: Array<{ value: Theme['audience']; label: string }> = [
  { value: 'common', label: '通用' },
  { value: 'male', label: '仅限男生' },
  { value: 'female', label: '仅限女生' }
];

export function ThemeEditorModal({
  isOpen,
  theme,
  onClose,
  onSaveMeta,
  onAddTask,
  onRemoveTask,
  onOpenAiImport
}: ThemeEditorModalProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [audience, setAudience] = useState<Theme['audience']>('common');
  const [taskText, setTaskText] = useState('');

  useEffect(() => {
    if (!isOpen || !theme) return;
    setName(theme.name);
    setDesc(theme.desc);
    setAudience(theme.audience);
    setTaskText('');
  }, [isOpen, theme]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  if (!isOpen || !theme) return null;

  return (
    <div className="fixed inset-0 z-[130]">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(180deg,_#fffdfd_0%,_#fff3f6_100%)] rounded-t-[32px] p-6 border-t border-rose-100 shadow-[0_-18px_40px_rgba(236,111,152,0.12)]">
        <div className="w-12 h-1 bg-rose-200 rounded-full mx-auto mb-6" />
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-rose-950">编辑主题</h3>
          <button
            className="h-9 px-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white text-sm font-semibold ios-btn shadow-[0_10px_24px_rgba(236,111,152,0.22)] disabled:opacity-40"
            disabled={!canSave}
            onClick={() => {
              onSaveMeta(theme.id, { name: name.trim(), desc: desc.trim(), audience });
              onClose();
            }}
          >
            保存
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar pb-10">
          <div className="space-y-2">
            <div className="text-xs text-rose-400">主题名称</div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl bg-white/90 text-rose-950 outline-none border border-rose-100 focus:border-rose-300"
              maxLength={24}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-rose-400">描述</div>
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl bg-white/90 text-rose-950 outline-none border border-rose-100 focus:border-rose-300"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-rose-400">适用对象</div>
            <div className="grid grid-cols-3 gap-2">
              {audienceOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`h-10 rounded-2xl text-sm font-semibold ios-btn border ${
                    audience === opt.value
                      ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white border-transparent'
                      : 'bg-white/90 text-rose-500 border-rose-100'
                  }`}
                  onClick={() => setAudience(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#BF5AF2] via-[#FF375F] to-[#FF9F0A] text-white font-bold ios-btn shadow-[0_0_15px_rgba(255,55,95,0.22)] flex items-center justify-center gap-2 border-none"
              onClick={() => onOpenAiImport(theme.id)}
            >
              <Wand2 size={18} className="animate-pulse" />
              <span>AI 导入任务卡</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-rose-400">新增任务卡</div>
            <div className="flex gap-2">
              <input
                value={taskText}
                onChange={e => setTaskText(e.target.value)}
                className="flex-1 h-11 px-4 rounded-2xl bg-white/90 text-rose-950 outline-none border border-rose-100 focus:border-rose-300"
                placeholder="输入一句可执行的小任务"
                maxLength={80}
              />
              <button
                className="h-11 px-4 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold ios-btn disabled:opacity-40 flex items-center justify-center gap-1"
                disabled={!taskText.trim()}
                onClick={() => {
                  onAddTask(theme.id, taskText);
                  setTaskText('');
                }}
              >
                <Plus size={18} />
                添加
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-rose-400">任务卡列表</div>
              <div className="text-[10px] text-rose-300">{theme.tasks.length} 卡</div>
            </div>
            <div className="space-y-2">
              {theme.tasks.map((t, idx) => (
                <div
                  key={`${theme.id}_${idx}`}
                  className="p-3 bg-white/90 rounded-2xl flex gap-3 items-start border border-rose-100 shadow-sm"
                >
                  <div className="text-[11px] text-rose-300 mt-0.5">{idx + 1}</div>
                  <div className="flex-1 text-sm text-rose-950 leading-relaxed">{t}</div>
                  <button
                    className="h-8 w-8 rounded-xl bg-rose-50 text-rose-500 ios-btn flex items-center justify-center border border-rose-100"
                    onClick={() => onRemoveTask(theme.id, idx)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {theme.tasks.length === 0 && (
                <div className="text-sm text-rose-400 bg-white/90 rounded-2xl p-4 border border-rose-100">
                  还没有任务卡，先添加几条吧
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
