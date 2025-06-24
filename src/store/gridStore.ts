import { create } from 'zustand';
import { createEmptyGrid } from '../utils/gridUtils';
import type { Grid, CellType } from '../utils/gridUtils';
import { generateMaze, generateCave, generateRandomMap } from '../utils/mapGenerators';

export interface Position {
  row: number;
  col: number;
}

export type MapGeneratorType = 'empty' | 'random' | 'maze' | 'cave';

export interface GridState {
  grid: Grid;
  rows: number;
  cols: number;
  startPosition: Position;
  endPosition: Position;
  selectedAlgorithm: string;
  animationSpeed: number;
  selectedMapGenerator: MapGeneratorType;
  setGrid: (grid: Grid) => void;
  setCellType: (row: number, col: number, cellType: CellType) => void;
  resetGrid: () => void;
  resetVisitedAndPath: () => void;
  setStartPosition: (position: Position) => void;
  setEndPosition: (position: Position) => void;
  setSelectedAlgorithm: (algorithm: string) => void;
  setAnimationSpeed: (speed: number) => void;
  setDimensions: (rows: number, cols: number) => void;
  setSelectedMapGenerator: (generator: MapGeneratorType) => void;
  generateMap: () => void;
}

export const useGridStore = create<GridState>((set) => ({
  grid: createEmptyGrid(15, 25),
  rows: 15,
  cols: 25,
  startPosition: { row: 7, col: 5 },
  endPosition: { row: 7, col: 20 },
  selectedAlgorithm: 'dijkstra',
  animationSpeed: 50,
  selectedMapGenerator: 'empty',
  
  setGrid: (grid) => set({ grid }),
  
  setCellType: (row, col, cellType) => set((state) => {
    const newGrid = [...state.grid];
    if (row >= 0 && row < state.rows && col >= 0 && col < state.cols) {
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = cellType;
    }
    return { grid: newGrid };
  }),
  
  resetGrid: () => set((state) => {
    const newGrid = createEmptyGrid(state.rows, state.cols);
    
    if (state.startPosition.row < state.rows && state.startPosition.col < state.cols) {
      newGrid[state.startPosition.row][state.startPosition.col] = 'start';
    }
    
    if (state.endPosition.row < state.rows && state.endPosition.col < state.cols) {
      newGrid[state.endPosition.row][state.endPosition.col] = 'end';
    }
    
    return { grid: newGrid };
  }),
  
  generateMap: () => set((state) => {
    let newGrid: Grid;
    
    switch (state.selectedMapGenerator) {
      case 'maze':
        newGrid = generateMaze(state.rows, state.cols);
        break;
      case 'cave':
        newGrid = generateCave(state.rows, state.cols);
        break;
      case 'random':
        newGrid = generateRandomMap(state.rows, state.cols);
        break;
      default:
        newGrid = createEmptyGrid(state.rows, state.cols);
    }
    
    let startPosition = { ...state.startPosition };
    let endPosition = { ...state.endPosition };
    
    if (newGrid[startPosition.row][startPosition.col] === 'wall') {
      let found = false;
      const visited = new Set<string>();
      const queue: Position[] = [startPosition];
      
      while (queue.length > 0 && !found) {
        const current = queue.shift()!;
        const key = `${current.row},${current.col}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        if (newGrid[current.row][current.col] !== 'wall') {
          startPosition = current;
          found = true;
        } else {
          const directions = [
            { row: -1, col: 0 }, { row: 1, col: 0 },
            { row: 0, col: -1 }, { row: 0, col: 1 }
          ];
          
          for (const direction of directions) {
            const newRow = current.row + direction.row;
            const newCol = current.col + direction.col;
            
            if (newRow >= 0 && newRow < state.rows && newCol >= 0 && newCol < state.cols) {
              queue.push({ row: newRow, col: newCol });
            }
          }
        }
      }
    }
    
    if (newGrid[endPosition.row][endPosition.col] === 'wall' ||
      (endPosition.row === startPosition.row && endPosition.col === startPosition.col)) {
      let found = false;
      const visited = new Set<string>();
      const queue: Position[] = [endPosition];
      
      while (queue.length > 0 && !found) {
        const current = queue.shift()!;
        const key = `${current.row},${current.col}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        if (newGrid[current.row][current.col] !== 'wall' &&
          !(current.row === startPosition.row && current.col === startPosition.col)) {
          endPosition = current;
          found = true;
        } else {
          const directions = [
            { row: -1, col: 0 }, { row: 1, col: 0 },
            { row: 0, col: -1 }, { row: 0, col: 1 }
          ];
          
          for (const direction of directions) {
            const newRow = current.row + direction.row;
            const newCol = current.col + direction.col;
            
            if (newRow >= 0 && newRow < state.rows && newCol >= 0 && newCol < state.cols) {
              queue.push({ row: newRow, col: newCol });
            }
          }
        }
      }
    }
    
    newGrid[startPosition.row][startPosition.col] = 'start';
    newGrid[endPosition.row][endPosition.col] = 'end';
    
    return { grid: newGrid, startPosition, endPosition };
  }),
  
  setStartPosition: (position) => set((state) => {
    const newGrid = [...state.grid];
    
    if (state.startPosition.row < state.rows && state.startPosition.col < state.cols) {
      newGrid[state.startPosition.row] = [...newGrid[state.startPosition.row]];
      newGrid[state.startPosition.row][state.startPosition.col] = 'empty';
    }
    
    if (position.row < state.rows && position.col < state.cols) {
      newGrid[position.row] = [...newGrid[position.row]];
      newGrid[position.row][position.col] = 'start';
    }
    
    return { grid: newGrid, startPosition: position };
  }),
  
  setEndPosition: (position) => set((state) => {
    const newGrid = [...state.grid];
    
    if (state.endPosition.row < state.rows && state.endPosition.col < state.cols) {
      newGrid[state.endPosition.row] = [...newGrid[state.endPosition.row]];
      newGrid[state.endPosition.row][state.endPosition.col] = 'empty';
    }
    
    if (position.row < state.rows && position.col < state.cols) {
      newGrid[position.row] = [...newGrid[position.row]];
      newGrid[position.row][position.col] = 'end';
    }
    
    return { grid: newGrid, endPosition: position };
  }),
  
  setSelectedAlgorithm: (algorithm) => set({ selectedAlgorithm: algorithm }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  setSelectedMapGenerator: (generator) => set({ selectedMapGenerator: generator }),
  
  setDimensions: (rows, cols) => set((state) => {
    const newGrid = createEmptyGrid(rows, cols);
    
    const startPosition = {
      row: Math.min(state.startPosition.row, rows - 1),
      col: Math.min(state.startPosition.col, cols - 1)
    };
    
    const endPosition = {
      row: Math.min(state.endPosition.row, rows - 1),
      col: Math.min(state.endPosition.col, cols - 1)
    };
    
    newGrid[startPosition.row][startPosition.col] = 'start';
    newGrid[endPosition.row][endPosition.col] = 'end';
    
    return { grid: newGrid, rows, cols, startPosition, endPosition };
  }),
  
  resetVisitedAndPath: () => set((state) => {
    const newGrid = [...state.grid];
    
    for (let row = 0; row < state.rows; row++) {
      newGrid[row] = [...newGrid[row]];
      for (let col = 0; col < state.cols; col++) {
        if (newGrid[row][col] === 'visited' || newGrid[row][col] === 'path') {
          newGrid[row][col] = 'empty';
        }
      }
    }
    
    if (state.startPosition.row < state.rows && state.startPosition.col < state.cols) {
      newGrid[state.startPosition.row][state.startPosition.col] = 'start';
    }
    
    if (state.endPosition.row < state.rows && state.endPosition.col < state.cols) {
      newGrid[state.endPosition.row][state.endPosition.col] = 'end';
    }
    
    return { grid: newGrid };
  }),
}));

useGridStore.getState().resetGrid();
