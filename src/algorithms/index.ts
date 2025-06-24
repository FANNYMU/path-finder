import type { Position } from '../store/gridStore';
import type { Grid } from '../utils/gridUtils';

export interface PathfindingResult {
  visitedNodesInOrder: Position[];
  shortestPath: Position[];
}

// Helper function to check if a position is valid
// const isValid = (grid: Grid, row: number, col: number, startPos: Position, endPos: Position): boolean => {
//   if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
//     return false;
//   }
  
//   if (grid[row][col] === 'wall') {
//     return false;
//   }
  
//   if ((row === startPos.row && col === startPos.col) || 
//       (row === endPos.row && col === endPos.col)) {
//     return true;
//   }
  
//   return true;
// };

// const getNeighbors = (grid: Grid, row: number, col: number, startPos: Position, endPos: Position): Position[] => {
//   const neighbors: Position[] = [];
//   const directions = [
//     { row: -1, col: 0 },
//     { row: 1, col: 0 },
//     { row: 0, col: -1 },
//     { row: 0, col: 1 }
//   ];
  
//   for (const direction of directions) {
//     const newRow = row + direction.row;
//     const newCol = col + direction.col;
    
//     if (isValid(grid, newRow, newCol, startPos, endPos)) {
//       neighbors.push({ row: newRow, col: newCol });
//     }
//   }
  
//   return neighbors;
// };

// const getManhattanDistance = (pos1: Position, pos2: Position): number => {
//   return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
// };

export const bfs = (
  grid: Grid,
  startPos: Position,
  endPos: Position
): PathfindingResult => {
  console.log('Running BFS with:', { startPos, endPos, gridSize: `${grid.length}x${grid[0]?.length}` });
  
  const visitedNodesInOrder: Position[] = [];
  const queue: Position[] = [startPos];
  const visited = new Set<string>();
  const previous: Record<string, string | null> = {};
  
  const startKey = `${startPos.row},${startPos.col}`;
  visited.add(startKey);
  previous[startKey] = null;
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = `${current.row},${current.col}`;
    
    visitedNodesInOrder.push(current);
    
    if (current.row === endPos.row && current.col === endPos.col) {
      console.log('BFS found the end node!');
      break;
    }
    
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 }
    ];
    
    for (const direction of directions) {
      const newRow = current.row + direction.row;
      const newCol = current.col + direction.col;
      const neighborKey = `${newRow},${newCol}`;
      
      if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
        continue;
      }
      
      if (grid[newRow][newCol] === 'wall' && 
          !(newRow === endPos.row && newCol === endPos.col)) {
        continue;
      }
      
      if (visited.has(neighborKey)) {
        continue;
      }
      
      visited.add(neighborKey);
      previous[neighborKey] = currentKey;
      queue.push({ row: newRow, col: newCol });
    }
  }
  
  const shortestPath: Position[] = [];
  let currentKey = `${endPos.row},${endPos.col}`;
  
  if (visited.has(currentKey)) {
    while (currentKey && previous[currentKey] !== null) {
      const [row, col] = currentKey.split(',').map(Number);
      shortestPath.unshift({ row, col });
      currentKey = previous[currentKey] || '';
    }
    
    if (currentKey) {
      const [row, col] = currentKey.split(',').map(Number);
      shortestPath.unshift({ row, col });
    }
  }
  
  console.log('BFS results:', { 
    visitedCount: visitedNodesInOrder.length,
    pathLength: shortestPath.length,
    path: shortestPath.length > 0 ? 'Found' : 'Not found'
  });
  
  return {
    visitedNodesInOrder,
    shortestPath
  };
};

export const dfs = (
  grid: Grid,
  startPos: Position,
  endPos: Position
): PathfindingResult => {
  console.log('Running DFS with:', { startPos, endPos, gridSize: `${grid.length}x${grid[0]?.length}` });
  
  const visitedNodesInOrder: Position[] = [];
  const stack: Position[] = [startPos];
  const visited = new Set<string>();
  const previous: Record<string, string | null> = {};
  
  const startKey = `${startPos.row},${startPos.col}`;
  visited.add(startKey);
  previous[startKey] = null;
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    const currentKey = `${current.row},${current.col}`;
    
    if (!visitedNodesInOrder.some(node => node.row === current.row && node.col === current.col)) {
      visitedNodesInOrder.push(current);
    }
    
    if (current.row === endPos.row && current.col === endPos.col) {
      console.log('DFS found the end node!');
      break;
    }
    
    const directions = [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: -1, col: 0 }
    ];
    
    for (const direction of directions) {
      const newRow = current.row + direction.row;
      const newCol = current.col + direction.col;
      const neighborKey = `${newRow},${newCol}`;
      
      if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
        continue;
      }
      
      if (grid[newRow][newCol] === 'wall' && 
          !(newRow === endPos.row && newCol === endPos.col)) {
        continue;
      }
      
      if (visited.has(neighborKey)) {
        continue;
      }
      
      visited.add(neighborKey);
      previous[neighborKey] = currentKey;
      stack.push({ row: newRow, col: newCol });
    }
  }
  
  const shortestPath: Position[] = [];
  let currentKey = `${endPos.row},${endPos.col}`;
  
  if (visited.has(currentKey)) {
    while (currentKey && previous[currentKey] !== null) {
      const [row, col] = currentKey.split(',').map(Number);
      shortestPath.unshift({ row, col });
      currentKey = previous[currentKey] || '';
    }
    
    if (currentKey) {
      const [row, col] = currentKey.split(',').map(Number);
      shortestPath.unshift({ row, col });
    }
  }
  
  console.log('DFS results:', { 
    visitedCount: visitedNodesInOrder.length,
    pathLength: shortestPath.length,
    path: shortestPath.length > 0 ? 'Found' : 'Not found'
  });
  
  return {
    visitedNodesInOrder,
    shortestPath
  };
};

export const dijkstra = (
  grid: Grid,
  startPos: Position,
  endPos: Position
): PathfindingResult => {
  console.log('Running Dijkstra with:', { startPos, endPos, gridSize: `${grid.length}x${grid[0]?.length}` });
  
  const visitedNodesInOrder: Position[] = [];
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited: Set<string> = new Set();
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const key = `${row},${col}`;
      
      if (grid[row][col] === 'wall' && 
          !(row === startPos.row && col === startPos.col) && 
          !(row === endPos.row && col === endPos.col)) {
        continue;
      }
      
      distances[key] = Infinity;
      previous[key] = null;
      unvisited.add(key);
    }
  }
  
  const startKey = `${startPos.row},${startPos.col}`;
  distances[startKey] = 0;
  
  while (unvisited.size > 0) {
    let currentKey: string | null = null;
    let smallestDistance = Infinity;
    
    for (const key of unvisited) {
      if (distances[key] < smallestDistance) {
        smallestDistance = distances[key];
        currentKey = key;
      }
    }
    
    if (!currentKey || smallestDistance === Infinity) {
      break;
    }
    
    const [row, col] = currentKey.split(',').map(Number);
    const current: Position = { row, col };
    
    unvisited.delete(currentKey);
    
    visitedNodesInOrder.push(current);
    
    if (row === endPos.row && col === endPos.col) {
      console.log('Found path to end node!');
      break;
    }
    
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 }
    ];
    
    for (const direction of directions) {
      const newRow = row + direction.row;
      const newCol = col + direction.col;
      const neighborKey = `${newRow},${newCol}`;
      
      if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
        continue;
      }
      
      if (grid[newRow][newCol] === 'wall' && 
          !(newRow === endPos.row && newCol === endPos.col)) {
        continue;
      }
      
      if (!unvisited.has(neighborKey)) {
        continue;
      }
      
      const newDistance = distances[currentKey] + 1;
      
      if (newDistance < distances[neighborKey]) {
        distances[neighborKey] = newDistance;
        previous[neighborKey] = currentKey;
      }
    }
  }
  
  const shortestPath: Position[] = [];
  let currentKey = `${endPos.row},${endPos.col}`;
  
  if (previous[currentKey] !== undefined) {
    while (currentKey && previous[currentKey] !== null) {
      const [row, col] = currentKey.split(',').map(Number);
      shortestPath.unshift({ row, col });
      currentKey = previous[currentKey] || '';
    }
    
    if (currentKey) {
      const [row, col] = currentKey.split(',').map(Number);
      shortestPath.unshift({ row, col });
    }
  }
  
  console.log('Dijkstra results:', { 
    visitedCount: visitedNodesInOrder.length,
    pathLength: shortestPath.length,
    path: shortestPath.length > 0 ? 'Found' : 'Not found'
  });
  
  return {
    visitedNodesInOrder,
    shortestPath: shortestPath
  };
};

export const astar = (
  grid: Grid,
  startPos: Position,
  endPos: Position
): PathfindingResult => {
  console.log('Running A* with:', { startPos, endPos, gridSize: `${grid.length}x${grid[0]?.length}` });
  
  const visitedNodesInOrder: Position[] = [];
  const openSet: Set<string> = new Set();
  const closedSet: Set<string> = new Set();
  
  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const key = `${row},${col}`;
      gScore[key] = Infinity;
      fScore[key] = Infinity;
      previous[key] = null;
    }
  }
  
  const startKey = `${startPos.row},${startPos.col}`;
  gScore[startKey] = 0;
  fScore[startKey] = heuristic(startPos, endPos);
  openSet.add(startKey);
  
  while (openSet.size > 0) {
    let currentKey: string | null = null;
    let lowestFScore = Infinity;
    
    for (const key of openSet) {
      if (fScore[key] < lowestFScore) {
        lowestFScore = fScore[key];
        currentKey = key;
      }
    }
    
    if (!currentKey) break;
    
    const [row, col] = currentKey.split(',').map(Number);
    const current: Position = { row, col };
    
    visitedNodesInOrder.push(current);
    
    if (row === endPos.row && col === endPos.col) {
      console.log('A* found the end node!');
      break;
    }
    
    openSet.delete(currentKey);
    closedSet.add(currentKey);
    
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 }
    ];
    
    for (const direction of directions) {
      const newRow = row + direction.row;
      const newCol = col + direction.col;
      const neighborKey = `${newRow},${newCol}`;
      
      if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
        continue;
      }
      
      if (grid[newRow][newCol] === 'wall' && 
          !(newRow === endPos.row && newCol === endPos.col)) {
        continue;
      }
      
      if (closedSet.has(neighborKey)) {
        continue;
      }
      
      const tentativeGScore = gScore[currentKey] + 1;
      
      if (!openSet.has(neighborKey)) {
        openSet.add(neighborKey);
      } 
      else if (tentativeGScore >= gScore[neighborKey]) {
        continue;
      }
      
      previous[neighborKey] = currentKey;
      gScore[neighborKey] = tentativeGScore;
      fScore[neighborKey] = gScore[neighborKey] + heuristic({ row: newRow, col: newCol }, endPos);
    }
  }
  
  const shortestPath: Position[] = [];
  let currentKey = `${endPos.row},${endPos.col}`;
  
  if (previous[currentKey] !== undefined) {
    while (currentKey && previous[currentKey] !== null) {
      const [row, col] = currentKey.split(',').map(Number);
      shortestPath.unshift({ row, col });
      currentKey = previous[currentKey] || '';
    }
    
    if (currentKey) {
      const [row, col] = currentKey.split(',').map(Number);
      shortestPath.unshift({ row, col });
    }
  }
  
  console.log('A* results:', { 
    visitedCount: visitedNodesInOrder.length,
    pathLength: shortestPath.length,
    path: shortestPath.length > 0 ? 'Found' : 'Not found'
  });
  
  return {
    visitedNodesInOrder,
    shortestPath
  };
};

const heuristic = (a: Position, b: Position): number => {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
};
