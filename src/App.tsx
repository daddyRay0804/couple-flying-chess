import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { TaskEventData } from './types';
import { HomeView } from './components/views/HomeView';
import { GameView } from './components/views/GameView';
import { TaskCardModal } from './components/modals/TaskCardModal';
import { WinModal } from './components/modals/WinModal';
import { BottomNav } from './components/BottomNav';

function App() {
  const {
    state,
    switchView,
    setPlayerCount,
    setPlayerRole,
    startGame,
    movePlayer,
    endTurn,
    setIsRolling,
    checkTile,
    resolveTask,
    resetGame
  } = useGameState();

  const [taskData, setTaskData] = useState<TaskEventData | null>(null);
  const [winnerId, setWinnerId] = useState<number | null>(null);

  const handleStartGame = () => {
    const success = startGame();
    if (!success) {
      alert('初始化游戏失败，请重试');
    }
  };

  const handleTaskTrigger = (data: TaskEventData) => {
    setTaskData(data);
  };

  const handleTaskAccept = () => {
    if (!taskData) return;
    setTaskData(null);
    resolveTask(taskData, 'accept');
  };

  const handleTaskReject = () => {
    if (!taskData) return;
    setTaskData(null);
    resolveTask(taskData, 'reject');
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
          <div className="flex flex-col items-end gap-1 mt-1 text-right">
            <div className="text-[11px] font-semibold text-rose-300 uppercase tracking-[0.2em]">
              Telegram
            </div>
            <a
              href="https://t.me/atpaylove6699"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-rose-500 hover:text-rose-700 transition-colors font-semibold"
            >
              @atpaylove6699
            </a>
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden">
          <div
            className={`absolute inset-0 flex flex-col px-6 pt-10 pb-10 overflow-y-auto no-scrollbar transition-all duration-500 ease-in-out ${
              state.view === 'home'
                ? 'translate-x-0 opacity-100'
                : 'opacity-0 pointer-events-none -translate-x-full'
            }`}
          >
            <HomeView
              players={state.players}
              onStartGame={handleStartGame}
              onSetPlayerCount={setPlayerCount}
              onSetPlayerRole={setPlayerRole}
            />
          </div>

        </main>

        <BottomNav activeView={state.view} onNavigate={handleNavigate} />
      </div>

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
