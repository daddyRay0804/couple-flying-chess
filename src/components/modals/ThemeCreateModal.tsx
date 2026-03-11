import { useEffect, useMemo, useState } from 'react';
import { Theme } from '../../types';

interface ThemeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: { name: string; desc: string; audience: Theme['audience'] }) => void;
}

const audienceOptions: Array<{ value: Theme['audience']; label: string }> = [
  { value: 'common', label: '通用' },
  { value: 'male', label: '仅限男生' },
  { value: 'female', label: '仅限女生' }
];

export function ThemeCreateModal({ isOpen, onClose, onCreate }: ThemeCreateModalProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [audience, setAudience] = useState<Theme['audience']>('common');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setDesc('');
    setAudience('common');
    setError('');
  }, [isOpen]);

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

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(180deg,_#fffdfd_0%,_#fff3f6_100%)] rounded-t-[32px] p-6 border-t border-rose-100 shadow-[0_-18px_40px_rgba(236,111,152,0.12)]">
        <div className="w-12 h-1 bg-rose-200 rounded-full mx-auto mb-6" />
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-rose-950">新建主题</h3>
        </div>

        <div className="space-y-4 pb-8">
          <div className="space-y-2">
            <div className="text-xs text-rose-400">主题名称</div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl bg-white/90 text-rose-950 outline-none border border-rose-100 focus:border-rose-300"
              placeholder="例如：甜蜜互动"
              maxLength={24}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-rose-400">描述（可选）</div>
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl bg-white/90 text-rose-950 outline-none border border-rose-100 focus:border-rose-300"
              placeholder="例如：日常小甜饼、轻量互动"
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

          {error && <div className="text-sm text-rose-500">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 h-12 rounded-full bg-rose-50 text-rose-500 font-bold text-sm ios-btn border border-rose-100"
              onClick={onClose}
            >
              取消
            </button>
            <button
              className="flex-1 h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold text-sm ios-btn shadow-[0_12px_28px_rgba(236,111,152,0.24)] disabled:opacity-40"
              disabled={!canSubmit}
              onClick={() => {
                if (!name.trim()) {
                  setError('请输入主题名称');
                  return;
                }
                onCreate({ name: name.trim(), desc: desc.trim(), audience });
              }}
            >
              创建并编辑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
