import { useEffect, useRef, useState } from 'react';
import { useGridStore } from '../store/gridStore';

const CELL_SIZE = 25;

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    grid, 
    rows, 
    cols, 
    setCellType, 
    setStartPosition, 
    setEndPosition,
    startPosition,
    endPosition
  } = useGridStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'start' | 'end' | 'wall' | null>(null);
  const [lastCell, setLastCell] = useState<{ row: number, col: number } | null>(null);
  
  useEffect(() => {
    console.log('Redrawing canvas grid...');
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    canvas.width = cols * CELL_SIZE;
    canvas.height = rows * CELL_SIZE;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellType = grid[row][col];
        
        switch (cellType) {
          case 'empty':
            ctx.fillStyle = '#FFFFFF';
            break;
          case 'wall':
            ctx.fillStyle = '#333333';
            break;
          case 'start':
            ctx.fillStyle = '#4CAF50';
            break;
          case 'end':
            ctx.fillStyle = '#F44336';
            break;
          case 'visited':
            ctx.fillStyle = '#90CAF9';
            break;
          case 'path':
            ctx.fillStyle = '#FFC107';
            break;
          default:
            ctx.fillStyle = '#FFFFFF';
        }
        
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        
        ctx.strokeStyle = '#DDDDDD';
        ctx.lineWidth = 1;
        ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        
        if (cellType === 'start') {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(
            col * CELL_SIZE + CELL_SIZE / 2,
            row * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 3,
            0,
            2 * Math.PI
          );
          ctx.fill();
        } else if (cellType === 'end') {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 4);
          ctx.lineTo(col * CELL_SIZE + CELL_SIZE * 3/4, row * CELL_SIZE + CELL_SIZE * 3/4);
          ctx.lineTo(col * CELL_SIZE + CELL_SIZE / 4, row * CELL_SIZE + CELL_SIZE * 3/4);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }, [grid, rows, cols]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    
    setIsDragging(true);
    setLastCell({ row, col });
    
    const cellType = grid[row][col];
    if (cellType === 'start') {
      setDragType('start');
    } else if (cellType === 'end') {
      setDragType('end');
    } else {
      setDragType('wall');
      setCellType(row, col, cellType === 'wall' ? 'empty' : 'wall');
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragType) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    
    if (lastCell && lastCell.row === row && lastCell.col === col) return;
    
    setLastCell({ row, col });
    
    if (dragType === 'start') {
      const oldRow = startPosition.row;
      const oldCol = startPosition.col;
      
      if (grid[row][col] !== 'end') {
        setCellType(oldRow, oldCol, 'empty');
        setCellType(row, col, 'start');
        setStartPosition({ row, col });
      }
    } else if (dragType === 'end') {
      const oldRow = endPosition.row;
      const oldCol = endPosition.col;
      
      if (grid[row][col] !== 'start') {
        setCellType(oldRow, oldCol, 'empty');
        setCellType(row, col, 'end');
        setEndPosition({ row, col });
      }
    } else if (dragType === 'wall') {
      if (grid[row][col] === 'empty' || grid[row][col] === 'visited' || grid[row][col] === 'path') {
        setCellType(row, col, 'wall');
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
    setLastCell(null);
  };
  
  return (
    <div className="canvas-container flex justify-center my-4">
      <canvas
        ref={canvasRef}
        className="border border-gray-300"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      ></canvas>
    </div>
  );
}; 