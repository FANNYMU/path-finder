import type { Grid } from './gridUtils';
import { createEmptyGrid } from './gridUtils';
import type { Position } from '../store/gridStore';

export const generateMaze = (rows: number, cols: number): Grid => {
  const grid = createEmptyGrid(rows, cols);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      grid[row][col] = 'wall';
    }
  }
  
  const startRow = Math.floor(Math.random() * Math.floor((rows - 1) / 2)) * 2 + 1;
  const startCol = Math.floor(Math.random() * Math.floor((cols - 1) / 2)) * 2 + 1;
  
  const stack: Position[] = [{ row: startRow, col: startCol }];
  grid[startRow][startCol] = 'empty';
  
  const directions = [
    { row: -2, col: 0 },
    { row: 2, col: 0 },
    { row: 0, col: -2 },
    { row: 0, col: 2 }
  ];
  
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
    let foundNeighbor = false;
    
    for (const direction of shuffledDirections) {
      const newRow = current.row + direction.row;
      const newCol = current.col + direction.col;
      
      if (
        newRow > 0 && newRow < rows - 1 &&
        newCol > 0 && newCol < cols - 1 &&
        grid[newRow][newCol] === 'wall'
      ) {
        grid[current.row + direction.row / 2][current.col + direction.col / 2] = 'empty';
        grid[newRow][newCol] = 'empty';
        stack.push({ row: newRow, col: newCol });
        foundNeighbor = true;
        break;
      }
    }
    
    if (!foundNeighbor) {
      stack.pop();
    }
  }
  
  return grid;
};

export const generateCave = (rows: number, cols: number, fillProbability = 0.4, iterations = 5): Grid => {
  const grid = createEmptyGrid(rows, cols);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (row === 0 || row === rows - 1 || col === 0 || col === cols - 1) {
        grid[row][col] = 'wall';
      } else {
        grid[row][col] = Math.random() < fillProbability ? 'wall' : 'empty';
      }
    }
  }
  
  for (let i = 0; i < iterations; i++) {
    const newGrid = createEmptyGrid(rows, cols);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (row === 0 || row === rows - 1 || col === 0 || col === cols - 1) {
          newGrid[row][col] = 'wall';
          continue;
        }
        
        let wallCount = 0;
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue;
            
            const neighborRow = row + r;
            const neighborCol = col + c;
            
            if (
              neighborRow >= 0 && neighborRow < rows &&
              neighborCol >= 0 && neighborCol < cols &&
              grid[neighborRow][neighborCol] === 'wall'
            ) {
              wallCount++;
            }
          }
        }
        
        if (grid[row][col] === 'wall') {
          newGrid[row][col] = wallCount >= 4 ? 'wall' : 'empty';
        } else {
          newGrid[row][col] = wallCount >= 5 ? 'wall' : 'empty';
        }
      }
    }
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        grid[row][col] = newGrid[row][col];
      }
    }
  }
  
  return grid;
};

export const generateRandomMap = (rows: number, cols: number, density = 0.3): Grid => {
  const grid = createEmptyGrid(rows, cols);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (row === 0 || row === rows - 1 || col === 0 || col === cols - 1) {
        continue;
      }
      
      if (Math.random() < density) {
        grid[row][col] = 'wall';
      }
    }
  }
  
  return grid;
};