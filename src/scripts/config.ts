export interface Car {
  id: number;
  name: string;
  color: string;
}

export const CARS: Car[] = [
  { id: 0, name: "Red", color: "#EF4444" },
  { id: 1, name: "Blue", color: "#3B82F6" },
  { id: 2, name: "Green", color: "#22C55E" },
  { id: 3, name: "Purple", color: "#A855F7" },
  { id: 4, name: "Orange", color: "#F97316" },
  { id: 5, name: "Cyan", color: "#06B6D4" },
  { id: 6, name: "Pink", color: "#EC4899" },
  { id: 7, name: "Yellow", color: "#EAB308" },
  { id: 8, name: "Lime", color: "#84CC16" },
  { id: 9, name: "White", color: "#E5E7EB" },
];

export const TOTAL_LAPS = 5;
export const SPEED_MIN = 0.15;
export const SPEED_MAX = 0.4;
export const DOT_RADIUS = 6;
export const START_STAGGER = 0.015; // % of path length between each car's start position
