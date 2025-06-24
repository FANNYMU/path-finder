import type { GridState } from '../store/gridStore';
import type { Grid } from './gridUtils';
import { createEmptyGrid } from './gridUtils';

export const compressGrid = (grid: Grid): string => {
  let compressed = '';
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      switch (grid[row][col]) {
        case 'empty':
          compressed += '0';
          break;
        case 'wall':
          compressed += '1';
          break;
        case 'start':
          compressed += 'S';
          break;
        case 'end':
          compressed += 'E';
          break;
        case 'visited':
          compressed += '2';
          break;
        case 'path':
          compressed += '3';
          break;
        default:
          compressed += '0';
      }
    }
  }
  
  return compressed;
};

export const decompressGrid = (compressed: string, rows: number, cols: number): Grid => {
  const grid = createEmptyGrid(rows, cols);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      
      if (index < compressed.length) {
        const char = compressed[index];
        
        switch (char) {
          case '0':
            grid[row][col] = 'empty';
            break;
          case '1':
            grid[row][col] = 'wall';
            break;
          case 'S':
            grid[row][col] = 'start';
            break;
          case 'E':
            grid[row][col] = 'end';
            break;
          case '2':
            grid[row][col] = 'visited';
            break;
          case '3':
            grid[row][col] = 'path';
            break;
          default:
            grid[row][col] = 'empty';
        }
      }
    }
  }
  
  return grid;
};

export const getStateFromUrl = (): Partial<GridState> => {
  const params = new URLSearchParams(window.location.search);
  const state: Partial<GridState> = {};
  
  const rows = parseInt(params.get('rows') || '0');
  const cols = parseInt(params.get('cols') || '0');
  
  if (rows > 0 && cols > 0) {
    state.rows = rows;
    state.cols = cols;
  }
  
  const startRow = parseInt(params.get('startRow') || '0');
  const startCol = parseInt(params.get('startCol') || '0');
  
  if (startRow >= 0 && startCol >= 0) {
    state.startPosition = { row: startRow, col: startCol };
  }
  
  const endRow = parseInt(params.get('endRow') || '0');
  const endCol = parseInt(params.get('endCol') || '0');
  
  if (endRow >= 0 && endCol >= 0) {
    state.endPosition = { row: endRow, col: endCol };
  }
  
  const algorithm = params.get('algorithm');
  if (algorithm) {
    state.selectedAlgorithm = algorithm;
  }
  
  const mapGenerator = params.get('mapGenerator');
  if (mapGenerator) {
    state.selectedMapGenerator = mapGenerator as any;
  }
  
  const gridData = params.get('grid');
  if (gridData && rows > 0 && cols > 0) {
    state.grid = decompressGrid(gridData, rows, cols);
  }
  
  return state;
};

export const setStateToUrl = (state: Partial<GridState>): void => {
  const params = new URLSearchParams();
  
  if (state.rows && state.cols) {
    params.set('rows', state.rows.toString());
    params.set('cols', state.cols.toString());
  }
  
  if (state.startPosition) {
    params.set('startRow', state.startPosition.row.toString());
    params.set('startCol', state.startPosition.col.toString());
  }
  
  if (state.endPosition) {
    params.set('endRow', state.endPosition.row.toString());
    params.set('endCol', state.endPosition.col.toString());
  }
  
  if (state.selectedAlgorithm) {
    params.set('algorithm', state.selectedAlgorithm);
  }
  
  if (state.selectedMapGenerator) {
    params.set('mapGenerator', state.selectedMapGenerator);
  }
  
  if (state.grid) {
    params.set('grid', compressGrid(state.grid));
  }
  
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
};

export const saveGridToLocalStorage = (name: string, grid: Grid, rows: number, cols: number): void => {
  const savedGrids = JSON.parse(localStorage.getItem('pathfinder-grids') || '{}');
  
  savedGrids[name] = {
    grid: compressGrid(grid),
    rows,
    cols,
    timestamp: Date.now()
  };
  
  localStorage.setItem('pathfinder-grids', JSON.stringify(savedGrids));
};

export interface SavedGrid {
  name: string;
  rows: number;
  cols: number;
  timestamp: number;
}

export const getSavedGrids = (): SavedGrid[] => {
  const savedGrids = JSON.parse(localStorage.getItem('pathfinder-grids') || '{}');
  
  return Object.keys(savedGrids).map(name => ({
    name,
    rows: savedGrids[name].rows,
    cols: savedGrids[name].cols,
    timestamp: savedGrids[name].timestamp
  }));
};

export const loadGridFromLocalStorage = (name: string): { grid: Grid; rows: number; cols: number } | null => {
  const savedGrids = JSON.parse(localStorage.getItem('pathfinder-grids') || '{}');
  
  if (!savedGrids[name]) {
    return null;
  }
  
  const { grid: compressedGrid, rows, cols } = savedGrids[name];
  
  return {
    grid: decompressGrid(compressedGrid, rows, cols),
    rows,
    cols
  };
};