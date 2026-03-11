import { useState, useEffect, useCallback } from 'react';
import { GameIntensity, GameState, Player, TargetRule, TaskEventData, TaskIntensity, TaskMode, Theme } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import { generateSpiralPath, generateBoardMap, calculateNewPosition } from '../utils/gameLogic';
import { getTaskLibrary } from '../data/taskLibrary';

const STORAGE_KEY = 'couples-ludo-game-state';
const PLAYER_COLORS = ['#6D8EF7', '#EC6F98', '#56C1A7', '#F3A65A'];

function createDefaultPlayers(count = 2): Player[] {
  const safeCount = Math.min(4, Math.max(2, count));
  const rolePattern: Player['role'][] = ['male', 'female', 'male', 'female'];
  const roleCounters: Record<Player['role'], number> = { male: 0, female: 0 };

  return Array.from({ length: safeCount }, (_, idx) => {
    const role = rolePattern[idx];
    roleCounters[role] += 1;
    return {
      id: idx,
      name: role === 'male' ? `男${roleCounters[role]}` : `女${roleCounters[role]}`,
      color: PLAYER_COLORS[idx],
      role,
      step: 0,
      themeId: null
    };
  });
}

function renamePlayersByRole(players: Player[]): Player[] {
  const counters: Record<Player['role'], number> = { male: 0, female: 0 };
  return players.map(player => {
    counters[player.role] += 1;
    return {
      ...player,
      name: player.role === 'male' ? `男${counters[player.role]}` : `女${counters[player.role]}`
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

const SURPRISE_THEME_ID = 'surprise';
const TRAP_THEME_ID = 'trap';

function isThemeAllowedForRole(theme: Theme, role: Player['role']) {
  return theme.audience === 'common' || theme.audience === role;
}

function normalizePlayers(input: unknown): Player[] {
  const incoming = Array.isArray(input) ? input : [];
  const count = Math.min(4, Math.max(2, incoming.length || 2));
  const basePlayers = createDefaultPlayers(count);

  const players = basePlayers.map(base => {
    const found = incoming.find(p => isRecord(p) && typeof p.id === 'number' && p.id === base.id);
    const record = isRecord(found) ? found : {};
    const roleValue = record.role;
    const themeIdValue = record.themeId;

    return {
      id: base.id,
      name: typeof record.name === 'string' ? record.name : base.name,
      color: typeof record.color === 'string' ? record.color : base.color,
      role: roleValue === 'male' || roleValue === 'female' ? roleValue : base.role,
      step: typeof record.step === 'number' ? record.step : 0,
      themeId: typeof themeIdValue === 'string' || themeIdValue === null ? themeIdValue : null
    };
  });

  return renamePlayersByRole(players);
}

function normalizeThemes(input: unknown): Theme[] {
  const incoming = Array.isArray(input) ? input : [];
  const source = [...getTaskLibrary(), ...incoming];

  return source
    .map(t => {
      const record = isRecord(t) ? t : {};
      const tasksValue = record.tasks;
      const tasks = Array.isArray(tasksValue)
        ? tasksValue
            .map(x => (typeof x === 'string' ? x.trim() : ''))
            .filter((x): x is string => x.length > 0)
        : [];

      const audienceValue = record.audience;

      return {
        id: typeof record.id === 'string' ? record.id : `theme_${Date.now()}`,
        name: typeof record.name === 'string' ? record.name : '未命名主题',
        desc: typeof record.desc === 'string' ? record.desc : '',
        audience:
          audienceValue === 'common' || audienceValue === 'male' || audienceValue === 'female'
            ? audienceValue
            : 'common',
        tasks
      } satisfies Theme;
    })
    .reduce<Theme[]>((acc, theme) => {
      const existingIndex = acc.findIndex(t => t.id === theme.id);
      if (existingIndex >= 0) {
        acc[existingIndex] = theme;
        return acc;
      }
      acc.push(theme);
      return acc;
    }, []);
}

function normalizeGameState(saved: unknown): GameState | null {
  if (!isRecord(saved)) return null;
  const s = saved;

  const themes = normalizeThemes(s.themes);
  const players = normalizePlayers(s.players).map(p => {
    if (p.themeId === null) return p;
    const theme = themes.find(t => t.id === p.themeId);
    if (!theme) return { ...p, themeId: null };
    if (!isThemeAllowedForRole(theme, p.role)) return { ...p, themeId: null };
    return p;
  });

  const incomingTurn = typeof s.turn === 'number' ? s.turn : 0;

  return {
    view: s.view === 'home' || s.view === 'game' || s.view === 'themes' ? s.view : 'home',
    turn: incomingTurn >= 0 && incomingTurn < players.length ? incomingTurn : 0,
    players,
    themes,
    boardMap: Array.isArray(s.boardMap) ? s.boardMap : generateBoardMap(),
    pathCoords: Array.isArray(s.pathCoords) ? s.pathCoords : generateSpiralPath(),
    isRolling: !!s.isRolling,
    gameIntensity: s.gameIntensity === 'warm' || s.gameIntensity === 'hot' || s.gameIntensity === 'extreme' ? s.gameIntensity : 'hot'
  };
}

function createThemeId(existingIds: Set<string>) {
  const base =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as Crypto).randomUUID()
      : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  let id = `user_${base}`;
  while (existingIds.has(id)) {
    id = `user_${base}_${Math.random().toString(36).slice(2, 6)}`;
  }
  return id;
}

function getNextTurnIndex(players: Player[], currentTurn: number) {
  return (currentTurn + 1) % players.length;
}

function pickRandomTargetByPreference(activePlayer: Player, others: Player[]): Player {
  const oppositeGender = others.filter(player => player.role !== activePlayer.role);
  const pool = oppositeGender.length > 0 ? oppositeGender : others;
  return pool[Math.floor(Math.random() * pool.length)];
}

function inferTaskMeta(taskText: string, gameIntensity: GameIntensity): {
  mode: TaskMode;
  intensity: TaskIntensity;
  targetRule: TargetRule;
  contactLevel: 1 | 2 | 3;
} {
  const text = taskText.toLowerCase();

  let mode: TaskMode = 'self';
  let targetRule: TargetRule = 'self';
  let contactLevel: 1 | 2 | 3 = gameIntensity === 'warm' ? 1 : gameIntensity === 'hot' ? 2 : 3;

  if (/(互相|一起|双方|两人)/.test(taskText)) {
    mode = 'duel';
    targetRule = 'chosen-player';
    contactLevel = Math.max(2, contactLevel) as 1 | 2 | 3;
  }
  if (/(全员|所有人|大家)/.test(taskText)) {
    mode = 'all';
    targetRule = 'all-players';
  }
  if (/(指定|选择|挑一个|点一名)/.test(taskText)) {
    mode = 'target';
    targetRule = 'chosen-player';
  }

  let intensity: TaskIntensity = gameIntensity;
  if (/(拥抱|贴贴|牵手|亲吻|抚摸|接吻)/.test(taskText)) {
    intensity = gameIntensity === 'extreme' ? 'extreme' : 'hot';
    contactLevel = Math.max(contactLevel, 2) as 1 | 2 | 3;
  }
  if (/(脱|裸体|口交|私密|高潮|做爱|抽插)/.test(taskText)) {
    intensity = 'extreme';
    contactLevel = 3;
  }

  return { mode, intensity, targetRule, contactLevel };
}

function buildTaskEvent(params: {
  type: 'collision' | 'lucky' | 'trap';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  task: string;
  taskSourceId: string;
  initiator: Player;
  executor: Player;
  gameIntensity: GameIntensity;
  targetRule?: TargetRule;
  modeOverride?: TaskMode;
}) : TaskEventData {
  const inferred = inferTaskMeta(params.task, params.gameIntensity);
  return {
    type: params.type,
    initiatorPlayerId: params.initiator.id,
    initiatorPlayerName: params.initiator.name,
    executorPlayerId: params.executor.id,
    executorPlayerName: params.executor.name,
    title: params.title,
    subtitle: params.subtitle,
    icon: params.icon,
    color: params.color,
    task: params.task,
    taskSourceId: params.taskSourceId,
    mode: params.modeOverride || inferred.mode,
    intensity: inferred.intensity,
    targetRule: params.targetRule || inferred.targetRule,
    contactLevel: inferred.contactLevel
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadFromStorage<GameState | null>(STORAGE_KEY, null);
    const normalized = normalizeGameState(saved);

    if (normalized) {
      return normalized;
    }

    return {
      view: 'home',
      turn: 0,
      players: createDefaultPlayers(2),
      themes: getTaskLibrary(),
      boardMap: generateBoardMap(),
      pathCoords: generateSpiralPath(),
      isRolling: false,
      gameIntensity: 'hot'
    };
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEY, state);
  }, [state]);

  const switchView = useCallback((view: GameState['view']) => {
    setState(prev => ({ ...prev, view }));
  }, []);

  const setPlayerCount = useCallback((count: number) => {
    setState(prev => {
      const safeCount = Math.min(4, Math.max(2, count));
      const basePlayers = createDefaultPlayers(safeCount);
      const merged = basePlayers.map(base => {
        const existing = prev.players.find(p => p.id === base.id);
        return existing
          ? { ...base, role: existing.role, step: 0, themeId: existing.themeId }
          : base;
      });

      return {
        ...prev,
        turn: 0,
        players: renamePlayersByRole(merged),
        isRolling: false
      };
    });
  }, []);

  const setPlayerRole = useCallback((playerId: number, role: Player['role']) => {
    setState(prev => {
      const nextPlayers = renamePlayersByRole(
        prev.players.map(player => {
          if (player.id !== playerId) return player;
          const nextTheme = player.themeId
            ? prev.themes.find(t => t.id === player.themeId && isThemeAllowedForRole(t, role))?.id || null
            : null;
          return { ...player, role, themeId: nextTheme };
        })
      );

      return {
        ...prev,
        players: nextPlayers
      };
    });
  }, []);

  const startGame = useCallback(() => {
    const surpriseTheme = state.themes.find(t => t.id === SURPRISE_THEME_ID);
    const trapTheme = state.themes.find(t => t.id === TRAP_THEME_ID);
    if (!surpriseTheme || !trapTheme) return false;
    if (surpriseTheme.tasks.length === 0 || trapTheme.tasks.length === 0) return false;

    setState(prev => ({
      ...prev,
      view: 'game',
      turn: Math.floor(Math.random() * prev.players.length),
      players: prev.players.map(p => ({ ...p, themeId: SURPRISE_THEME_ID, step: 0 }))
    }));
    return true;
  }, [state.themes]);

  const movePlayer = useCallback((steps: number) => {
    setState(prev => {
      const activePlayer = prev.players[prev.turn];
      const newStep = calculateNewPosition(activePlayer.step, steps);

      return {
        ...prev,
        players: prev.players.map(p => (p.id === activePlayer.id ? { ...p, step: newStep } : p))
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    setState(prev => ({
      ...prev,
      turn: getNextTurnIndex(prev.players, prev.turn),
      isRolling: false
    }));
  }, []);

  const setIsRolling = useCallback((rolling: boolean) => {
    setState(prev => ({ ...prev, isRolling: rolling }));
  }, []);

  const checkTile = useCallback((landingStep: number): TaskEventData | 'win' | null => {
    const activePlayer = state.players[state.turn];
    const otherPlayers = state.players.filter(p => p.id !== activePlayer.id);
    const collisionTarget = otherPlayers.find(p => landingStep !== 0 && p.step === landingStep);

    if (landingStep === 48) {
      return 'win';
    }

    if (collisionTarget) {
      const theme = state.themes.find(t => t.id === SURPRISE_THEME_ID);
      const task = theme?.tasks[Math.floor(Math.random() * theme.tasks.length)] || '';

      return buildTaskEvent({
        type: 'collision',
        initiator: activePlayer,
        executor: collisionTarget,
        title: '相遇事件',
        subtitle: `${activePlayer.name} 撞上了 ${collisionTarget.name}，触发双人互动`,
        icon: 'handshake',
        color: 'text-yellow-400',
        task,
        taskSourceId: SURPRISE_THEME_ID,
        gameIntensity: state.gameIntensity,
        targetRule: 'collision-player',
        modeOverride: 'duel'
      });
    }

    const tileType = state.boardMap[landingStep];

    if (tileType === 'lucky') {
      const theme = state.themes.find(t => t.id === SURPRISE_THEME_ID);
      const task = theme?.tasks[Math.floor(Math.random() * theme.tasks.length)] || '';
      const targetPlayer = otherPlayers.length > 0 ? pickRandomTargetByPreference(activePlayer, otherPlayers) : activePlayer;

      return buildTaskEvent({
        type: 'lucky',
        initiator: activePlayer,
        executor: targetPlayer,
        title: '惊喜时刻',
        subtitle: `${activePlayer.name} 获得主动权，系统已随机选中 ${targetPlayer.name}`,
        icon: 'favorite',
        color: 'text-[#FF375F]',
        task,
        taskSourceId: SURPRISE_THEME_ID,
        gameIntensity: state.gameIntensity,
        targetRule: otherPlayers.length > 0 ? 'chosen-player' : 'self'
      });
    }

    if (tileType === 'trap') {
      const sourcePlayer = otherPlayers.length > 0 ? pickRandomTargetByPreference(activePlayer, otherPlayers) : activePlayer;
      const theme = state.themes.find(t => t.id === TRAP_THEME_ID);
      const task = theme?.tasks[Math.floor(Math.random() * theme.tasks.length)] || '';

      return buildTaskEvent({
        type: 'trap',
        initiator: sourcePlayer,
        executor: activePlayer,
        title: '意外陷阱',
        subtitle: `${activePlayer.name} 进入被动回合，系统随机由 ${sourcePlayer.name} 发起惩罚`,
        icon: 'lock',
        color: 'text-[#BF5AF2]',
        task,
        taskSourceId: TRAP_THEME_ID,
        gameIntensity: state.gameIntensity,
        targetRule: 'self'
      });
    }

    return null;
  }, [state.players, state.turn, state.themes, state.boardMap, state.gameIntensity]);

  const resolveTask = useCallback((task: TaskEventData, outcome: 'accept' | 'reject', chosenTargetId?: number) => {
    setState(prev => {
      let nextPlayers = prev.players;
      const effectiveExecutorId = chosenTargetId ?? task.executorPlayerId;

      if (outcome === 'reject') {
        const backSteps = Math.floor(Math.random() * 3) + 1;
        nextPlayers = prev.players.map(p => {
          if (p.id !== effectiveExecutorId) return p;

          if (task.type === 'collision') {
            return { ...p, step: 0 };
          }

          return { ...p, step: Math.max(0, p.step - backSteps) };
        });
      }

      return {
        ...prev,
        players: nextPlayers,
        turn: getNextTurnIndex(prev.players, prev.turn),
        isRolling: false
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      view: 'home',
      turn: 0,
      players: prev.players.map(p => ({ ...p, step: 0, themeId: null })),
      boardMap: generateBoardMap(),
      pathCoords: generateSpiralPath(),
      isRolling: false,
      gameIntensity: prev.gameIntensity
    }));
  }, []);

  return {
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
  };
}
