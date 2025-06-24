import { useState, useRef, useEffect } from 'react';
import type { Position } from '../store/gridStore';
import { useGridStore } from '../store/gridStore';

interface AnimationState {
  isAnimating: boolean;
  isPaused: boolean;
  currentStepIndex: number;
  visitedNodes: Position[];
  pathNodes: Position[];
  timeElapsed: number;
}

interface AnimationHookResult {
  isAnimating: boolean;
  isPaused: boolean;
  currentStepIndex: number;
  timeElapsed: number;
  startAnimation: (visitedNodes: Position[], pathNodes: Position[]) => void;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

export const usePathfindingAnimation = (): AnimationHookResult => {
  const [state, setState] = useState<AnimationState>({
    isAnimating: false,
    isPaused: false,
    currentStepIndex: 0,
    visitedNodes: [],
    pathNodes: [],
    timeElapsed: 0
  });
  
  const animationFrameIdRef = useRef<number>(0);
  
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!state.isAnimating || state.isPaused) return;
    
    const processNextFrame = () => {
      const { currentStepIndex, visitedNodes, pathNodes } = state;
      const { grid, setCellType } = useGridStore.getState();
      
      if (currentStepIndex < visitedNodes.length) {
        const node = visitedNodes[currentStepIndex];
        if (grid[node.row][node.col] !== 'start' && grid[node.row][node.col] !== 'end') {
          setCellType(node.row, node.col, 'visited');
        }
        
        setState(prevState => ({
          ...prevState,
          currentStepIndex: currentStepIndex + 1
        }));
      } 
      else if (currentStepIndex < visitedNodes.length + pathNodes.length) {
        const pathIdx = currentStepIndex - visitedNodes.length;
        const node = pathNodes[pathIdx];
        if (grid[node.row][node.col] !== 'start' && grid[node.row][node.col] !== 'end') {
          setCellType(node.row, node.col, 'path');
        }
        
        setState(prevState => ({
          ...prevState,
          currentStepIndex: currentStepIndex + 1
        }));
      } 
      else {
        setState(prevState => ({
          ...prevState,
          isAnimating: false
        }));
      }
    };
    
    const timer = setTimeout(processNextFrame, 1000 / useGridStore.getState().animationSpeed);
    return () => clearTimeout(timer);
  }, [state.isAnimating, state.isPaused, state.currentStepIndex]);
  
  const resetAnimation = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    
    setState({
      isAnimating: false,
      isPaused: false,
      currentStepIndex: 0,
      visitedNodes: [],
      pathNodes: [],
      timeElapsed: 0
    });
  };
  
  const startAnimation = (visitedNodes: Position[], pathNodes: Position[]) => {
    resetAnimation();
    const { resetVisitedAndPath } = useGridStore.getState();
    resetVisitedAndPath();
    
    if (visitedNodes.length === 0) return;
    
    setState({
      isAnimating: true,
      isPaused: false,
      currentStepIndex: 0,
      visitedNodes,
      pathNodes,
      timeElapsed: 0
    });
  };
  
  const pauseAnimation = () => {
    setState(prevState => ({ ...prevState, isPaused: true }));
  };
  
  const resumeAnimation = () => {
    setState(prevState => ({ ...prevState, isPaused: false }));
  };
  
  const stopAnimation = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    
    setState(prevState => ({ 
      ...prevState, 
      isAnimating: false,
      isPaused: false
    }));
  };
  
  return {
    isAnimating: state.isAnimating,
    isPaused: state.isPaused,
    currentStepIndex: state.currentStepIndex,
    timeElapsed: state.timeElapsed,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    stopAnimation,
    resetAnimation
  };
}; 