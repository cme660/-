
export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface OrnamentData {
  id: number;
  chaosPosition: [number, number, number];
  targetPosition: [number, number, number];
  weight: number; // For physics-like lag in interpolation
  color: string;
}

export interface FrameData {
  id: number;
  position: [number, number, number];
  imageUrl: string | null;
}
