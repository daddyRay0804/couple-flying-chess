export type TileType = 'blank' | 'lucky' | 'trap';

export type PlayerRole = 'male' | 'female';

export interface Player {
  id: number;
  name: string;
  color: string;
  role: PlayerRole;
  step: number;
  themeId: string | null;
}

export type ThemeAudience = 'common' | 'male' | 'female';

export type TaskMode = 'self' | 'target' | 'duel' | 'all';
export type TaskIntensity = 'warm' | 'hot' | 'extreme';
export type TargetRule = 'self' | 'chosen-player' | 'collision-player' | 'all-players';
export type GameIntensity = 'warm' | 'hot' | 'extreme';

export interface Theme {
  id: string;
  name: string;
  desc: string;
  audience: ThemeAudience;
  tasks: string[];
}

export interface PathCoord {
  r: number;
  c: number;
}

export interface GameState {
  view: 'home' | 'game' | 'themes';
  turn: number;
  players: Player[];
  themes: Theme[];
  boardMap: TileType[];
  pathCoords: PathCoord[];
  isRolling: boolean;
  gameIntensity: GameIntensity;
  roundThemeTasks?: {
    surprise: string[];
    trap: string[];
  };
}

export interface TaskEventData {
  type: 'collision' | 'lucky' | 'trap';
  initiatorPlayerId: number;
  initiatorPlayerName: string;
  executorPlayerId: number;
  executorPlayerName: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  task: string;
  taskSourceId: string;
  mode: TaskMode;
  intensity: TaskIntensity;
  targetRule: TargetRule;
  contactLevel: 1 | 2 | 3;
}
