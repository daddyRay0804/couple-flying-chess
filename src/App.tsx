import { useState } from 'react';
import { Github } from 'lucide-react';
import { useGameState } from './hooks/useGameState';
import { TaskEventData } from './types';
import { HomeView } from './components/views/HomeView';
import { GameView } from './components/views/GameView';
import { ThemesView } from './components/views/ThemesView';
import { ThemeSelectorModal } from './components/modals/ThemeSelectorModal';
import { TaskCardModal } from './components/modals/TaskCardModal';
import { WinModal } from './components/modals/WinModal';
import { BottomNav } from './components/BottomNav';
import { ThemeCreateModal } from './components/modals/ThemeCreateModal';
import { ThemeEditorModal } from './components/modals/ThemeEditorModal';
import { AiImportModal } from './components/modals/AiImportModal';
import { TargetPlayerModal } from './components/modals/TargetPlayerModal';

function App() {
  const {
    state,
    switchView,
    setGameIntensity,
    setPlayerCount,
    setPlayerRole,
    selectTheme,
    createTheme,
    updateThemeMeta,
    addThemeTask,
    removeThemeTask,
    importThemeTasks,
    startGame,
    movePlayer,
    endTurn,
    setIsRolling,
    checkTile,
    resolveTask,
    resetGame
  } = useGameState();

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(0);
  const [taskData, setTaskData] = useState<TaskEventData | null>(null);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [pendingTargetTask, setPendingTargetTask] = useState<TaskEventData | null>(null);
  const [isCreateThemeModalOpen, setIsCreateThemeModalOpen] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [aiImportThemeId, setAiImportThemeId] = useState<string | null>(null);

  const handleSelectTheme = (playerId: number) => {
    setSelectedPlayerId(playerId);
    setIsThemeModalOpen(true);
  };

  const handleThemeSelect = (themeId: string) => {
    selectTheme(selectedPlayerId, themeId);
  };

  const selectedPlayer = state.players.find(p => p.id === selectedPlayerId) || state.players[0];
  const selectableThemes = state.themes.filter(
    t => t.audience === 'common' || t.audience === selectedPlayer.role
  );

  const handleStartGame = () => {
    const success = startGame();
    if (!success) {
      alert('请先为双方选择任务包');
    }
  };

  const handleTaskTrigger = (data: TaskEventData) => {
    setTaskData(data);
  };

  const handleTaskAccept = () => {
    if (!taskData) return;
    if (taskData.targetRule === 'chosen-player') {
      setPendingTargetTask(taskData);
      setTaskData(null);
      return;
    }
    setTaskData(null);
    resolveTask(taskData, 'accept');
  };

  const handleTaskReject = () => {
    if (!taskData) return;
    setTaskData(null);
    resolveTask(taskData, 'reject');
  };

  const handleTargetSelect = (playerId: number) => {
    if (!pendingTargetTask) return;
    resolveTask(pendingTargetTask, 'accept', playerId);
    setPendingTargetTask(null);
  };

  const handleWin = (id: number) => {
    setWinnerId(id);
  };

  const handleNavigate = (view: 'home' | 'themes') => {
    switchView(view);
  };

  const handleBackFromGame = () => {
    if (confirm('离开游戏？进度不会保存')) {
      resetGame();
      switchView('home');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex justify-center bg-[#fff7f8]">
      <div className="fixed inset-0 z-0">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,_rgba(255,214,230,0.95),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(220,232,255,0.9),_transparent_30%),linear-gradient(180deg,_#fffafb_0%,_#fff4f7_58%,_#fffaf5_100%)]" />
        <div className="absolute inset-0 bg-white/25 backdrop-blur-[3px]" />
      </div>

      <div className="relative z-10 w-full max-w-[430px] h-full flex flex-col bg-white/10">
        <header className="pt-12 pb-2 px-6 shrink-0 flex justify-between items-start">
          <div>
            <div className="text-[11px] font-semibold text-rose-300 uppercase tracking-[0.25em] mb-1">
              Couple's Game
            </div>
            <h1 className="text-3xl font-bold text-rose-950 tracking-tight">情侣飞行棋</h1>
          </div>
          <div className="flex flex-col items-end gap-2 mt-1">
            <a
              href="https://github.com/woniu9524/couple-flying-chess"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-300 hover:text-rose-500 transition-colors"
              title="GitHub Repository"
            >
              <Github size={24} />
            </a>
            <a
              href="mailto:ikun@gmx.cn"
              className="text-xs text-rose-300/80 hover:text-rose-500 transition-colors"
            >
              问题反馈：ikun@gmx.cn
            </a>
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden">
          <div
            className={`absolute inset-0 flex flex-col px-6 pt-10 pb-10 transition-all duration-500 ease-in-out ${
              state.view === 'home'
                ? 'translate-x-0 opacity-100'
                : 'opacity-0 pointer-events-none -translate-x-full'
            }`}
          >
            <HomeView
              players={state.players}
              themes={state.themes}
              gameIntensity={state.gameIntensity}
              onSelectTheme={handleSelectTheme}
              onStartGame={handleStartGame}
              onSetPlayerCount={setPlayerCount}
              onSetPlayerRole={setPlayerRole}
              onSetGameIntensity={setGameIntensity}
            />
          </div>

          <div
            className={`absolute inset-0 px-6 pt-4 transition-all duration-500 ease-in-out ${
              state.view === 'themes'
                ? 'translate-x-0 opacity-100'
                : 'opacity-0 pointer-events-none translate-x-full'
            }`}
          >
            <ThemesView
              themes={state.themes}
              onCreateTheme={() => setIsCreateThemeModalOpen(true)}
              onEditTheme={themeId => setEditingThemeId(themeId)}
            />
          </div>
        </main>

        <BottomNav activeView={state.view} onNavigate={handleNavigate} />
      </div>

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        themes={selectableThemes}
        selectedThemeId={selectedPlayer?.themeId || null}
        onSelect={handleThemeSelect}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <TaskCardModal
        isOpen={!!taskData}
        taskData={taskData}
        onAccept={handleTaskAccept}
        onReject={handleTaskReject}
      />

      <WinModal
        isOpen={!!winnerId}
        winnerName={winnerId !== null ? state.players[winnerId].name : ''}
        onRestart={() => {
          resetGame();
          setWinnerId(null);
        }}
      />

      <TargetPlayerModal
        isOpen={!!pendingTargetTask}
        players={state.players}
        initiatorPlayerId={pendingTargetTask?.initiatorPlayerId ?? -1}
        onSelect={handleTargetSelect}
        onClose={() => setPendingTargetTask(null)}
      />

      <ThemeCreateModal
        isOpen={isCreateThemeModalOpen}
        onClose={() => setIsCreateThemeModalOpen(false)}
        onCreate={input => {
          const id = createTheme(input);
          setIsCreateThemeModalOpen(false);
          if (id) setEditingThemeId(id);
        }}
      />

      <ThemeEditorModal
        isOpen={!!editingThemeId}
        theme={editingThemeId ? state.themes.find(t => t.id === editingThemeId) || null : null}
        onClose={() => {
          setEditingThemeId(null);
          setAiImportThemeId(null);
        }}
        onSaveMeta={(themeId, patch) => updateThemeMeta(themeId, patch)}
        onAddTask={(themeId, taskText) => addThemeTask(themeId, taskText)}
        onRemoveTask={(themeId, index) => removeThemeTask(themeId, index)}
        onOpenAiImport={themeId => setAiImportThemeId(themeId)}
      />

      <AiImportModal
        isOpen={!!aiImportThemeId}
        themeName={aiImportThemeId ? state.themes.find(t => t.id === aiImportThemeId)?.name || '' : ''}
        onClose={() => setAiImportThemeId(null)}
        onImport={(tasks, mode) => {
          if (!aiImportThemeId) return;
          importThemeTasks(aiImportThemeId, tasks, mode);
        }}
      />

      {state.view === 'game' && (
        <GameView
          players={state.players}
          boardMap={state.boardMap}
          pathCoords={state.pathCoords}
          currentTurn={state.turn}
          isRolling={state.isRolling}
          onMove={movePlayer}
          onCheckTile={checkTile}
          onEndTurn={endTurn}
          onSetRolling={setIsRolling}
          onWin={handleWin}
          onTaskTrigger={handleTaskTrigger}
          onBack={handleBackFromGame}
        />
      )}
    </div>
  );
}

export default App;
