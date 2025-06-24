export type CellType = "empty" | "wall" | "start" | "end" | "visited" | "path";

export type Grid = CellType[][];

export const createEmptyGrid = (rows: number, cols: number): Grid => {
  return Array(rows).fill(null).map(() => 
    Array(cols).fill("empty")
  );
};
