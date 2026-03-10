import { useState, useCallback } from 'react';
import { Player, PathCoord, TileType, TaskEventData } from '../../types';
import { GameBoard } from '../GameBoard';
import { Dice } from '../Dice';
import { calculateNewPosition, rollDice } from '../../utils/gameLogic';
import { User, UserRound, ArrowLeft } from 'lucide-react';

interface GameViewProps {
  players: Player[];
  boardMap: TileType[];
  pathCoords: PathCoord[];
  currentTurn: number;
  isRolling: boolean;
  onMove: (steps: number) => void;
  onCheckTile: (landingStep: number) => TaskEventData | 'win' | null;
  onEndTurn: () => void;
  onSetRolling: (rolling: boolean) => void;
  onWin: (winnerId: number) => void;
  onTaskTrigger: (data: TaskEventData) => void;
  onBack: () => void;
}

export function GameView({
  players,
  boardMap,
  pathCoords,
  currentTurn,
  isRolling,
  onMove,
  onCheckTile,
  onEndTurn,
  onSetRolling,
  onWin,
  onTaskTrigger,
  onBack
}: GameViewProps) {
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const handleRoll = useCallback(() => {
    if (isRolling || isMoving || diceResult) return;

    onSetRolling(true);
    const result = rollDice();

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }

    setTimeout(() => {
      setDiceResult(result);
      onSetRolling(false);
    }, 1000);
  }, [isRolling, isMoving, diceResult, onSetRolling]);

  const handleRollComplete = useCallback(() => {
    if (diceResult) {
      const landingStep = calculateNewPosition(players[currentTurn].step, diceResult);
      setIsMoving(true);

      const moveDelayMs = 220;
      let movedSteps = 0;

      const stepOnce = () => {
        onMove(1);
        movedSteps += 1;

        if (movedSteps < diceResult) {
          setTimeout(stepOnce, moveDelayMs);
          return;
        }

        setTimeout(() => {
          const tileCheck = onCheckTile(landingStep);

          if (tileCheck === 'win') {
            onWin(currentTurn);
          } else if (tileCheck) {
            onTaskTrigger(tileCheck);
          } else {
            onEndTurn();
          }

          setDiceResult(null);
          setIsMoving(false);
        }, moveDelayMs);
      };

      setTimeout(stepOnce, moveDelayMs);
    }
  }, [diceResult, players, currentTurn, onMove, onCheckTile, onWin, onTaskTrigger, onEndTurn]);

  const activePlayer = players[currentTurn];
  const leadingStep = Math.max(...players.map(p => p.step));
  const turnNumber = Math.floor(leadingStep / 4) + 1;

  return (
    <div className="fixed inset-0 z-50 bg-[#fff7f8] flex flex-col">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,_rgba(255,214,230,0.95),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(220,232,255,0.9),_transparent_30%),linear-gradient(180deg,_#fffafb_0%,_#fff4f7_58%,_#fffaf5_100%)]" />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[3px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-[430px] mx-auto w-full">
        <header className="pt-12 pb-2 px-4 flex items-center gap-4 shrink-0">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center ios-btn border border-rose-100 shadow-sm"
          >
            <ArrowLeft className="text-rose-500" size={20} />
          </button>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-2 bg-white/80 rounded-full border border-rose-100 shadow-sm text-center">
              <div className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Turn {turnNumber}</div>
              <div className="mt-1 text-sm font-semibold text-rose-900 flex items-center justify-center gap-2">
                {activePlayer.role === 'male' ? <User size={14} /> : <UserRound size={14} />}
                <span>{activePlayer.name} 回合</span>
              </div>
            </div>
          </div>
          <div className="w-10" />
        </header>

        <div className="px-4 mt-2 mb-2 flex flex-wrap justify-center gap-2">
          {players.map(player => {
            const active = player.id === currentTurn;
            return (
              <div
                key={player.id}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  active ? 'text-white border-transparent shadow-sm' : 'bg-white/75 text-rose-400 border-rose-100'
                }`}
                style={active ? { backgroundColor: player.color } : {}}
              >
                {player.name}
              </div>
            );
          })}
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-2">
          <GameBoard
            boardMap={boardMap}
            pathCoords={pathCoords}
            players={players}
            currentTurn={currentTurn}
          />
        </div>

        <div className="h-[260px] w-full ios-glass rounded-t-[32px] flex flex-col items-center pt-8 pb-8 px-6 border-t border-rose-100 shadow-[0_-16px_36px_rgba(236,111,152,0.12)] shrink-0">
          <div className="text-sm font-medium mb-6 text-center" style={{ color: activePlayer.color }}>
            {activePlayer.name}：点击骰子开始本回合
          </div>
          <div onClick={handleRoll}>
            <Dice isRolling={isRolling} result={diceResult} onRollComplete={handleRollComplete} />
          </div>
        </div>
      </div>
    </div>
  );
}
