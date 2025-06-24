import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useGridStore } from '../store/gridStore';
import type { MapGeneratorType } from '../store/gridStore';
import { dijkstra, astar, bfs, dfs } from '../algorithms';
import { usePathfindingAnimation } from '../utils/usePathfindingAnimation';
import { saveGridToLocalStorage, getSavedGrids, loadGridFromLocalStorage } from '../utils/urlUtils';
import type { SavedGrid } from '../utils/urlUtils';

const ControlPanel: FC = () => {
  const {
    grid,
    rows,
    cols,
    startPosition,
    endPosition,
    selectedAlgorithm,
    animationSpeed,
    selectedMapGenerator,
    setSelectedAlgorithm,
    setAnimationSpeed,
    setDimensions,
    resetGrid,
    setSelectedMapGenerator,
    generateMap,
    setGrid
  } = useGridStore();
  
  const [metrics, setMetrics] = useState({
    nodesVisited: 0,
    pathLength: 0
  });
  
  const [savedGrids, setSavedGrids] = useState<SavedGrid[]>([]);
  const [mapName, setMapName] = useState('');
  const [selectedSavedGrid, setSelectedSavedGrid] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  const {
    isAnimating,
    isPaused,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    stopAnimation,
    resetAnimation,
    timeElapsed
  } = usePathfindingAnimation();

  const algorithms = [
    { id: 'dijkstra', name: 'Dijkstra\'s Algorithm' },
    { id: 'astar', name: 'A* Search' },
    { id: 'bfs', name: 'Breadth-First Search' },
    { id: 'dfs', name: 'Depth-First Search' }
  ];
  
  const mapGenerators = [
    { id: 'empty', name: 'Empty Grid' },
    { id: 'random', name: 'Random Walls' },
    { id: 'maze', name: 'Maze' },
    { id: 'cave', name: 'Cave' }
  ];
  
  useEffect(() => {
    setSavedGrids(getSavedGrids());
  }, []);
  
  const runAlgorithm = () => {
    resetAnimation();
    
    let algorithmFunction;
    switch (selectedAlgorithm) {
      case 'dijkstra':
        algorithmFunction = dijkstra;
        break;
      case 'astar':
        algorithmFunction = astar;
        break;
      case 'bfs':
        algorithmFunction = bfs;
        break;
      case 'dfs':
        algorithmFunction = dfs;
        break;
      default:
        algorithmFunction = dijkstra;
    }
    
    console.log('Running algorithm:', selectedAlgorithm);
    console.log('Start position:', startPosition);
    console.log('End position:', endPosition);
    
    const result = algorithmFunction(grid, startPosition, endPosition);
    
    console.log('Algorithm result:', {
      visitedNodes: result.visitedNodesInOrder.length,
      pathLength: result.shortestPath.length
    });
    
    setMetrics({
      nodesVisited: result.visitedNodesInOrder.length,
      pathLength: result.shortestPath.length
    });
    
    if (result.shortestPath.length === 0 && result.visitedNodesInOrder.length > 0) {
      alert('No path found! Try creating a different maze or moving start/end points.');
    } else if (result.visitedNodesInOrder.length === 0) {
      alert('Could not run algorithm. Check start and end positions.');
      return;
    }
    
    startAnimation(result.visitedNodesInOrder, result.shortestPath);
  };
  
  const handleResetGrid = () => {
    resetGrid();
    resetAnimation();
    setMetrics({
      nodesVisited: 0,
      pathLength: 0
    });
  };
  
  const handleGenerateMap = () => {
    generateMap();
    resetAnimation();
    setMetrics({
      nodesVisited: 0,
      pathLength: 0
    });
  };
  
  const handleSaveGrid = () => {
    if (!mapName.trim()) return;
    
    saveGridToLocalStorage(mapName, grid, rows, cols);
    setSavedGrids(getSavedGrids());
    setMapName('');
  };
  
  const handleLoadGrid = () => {
    if (!selectedSavedGrid) return;
    
    const loadedGrid = loadGridFromLocalStorage(selectedSavedGrid);
    if (loadedGrid) {
      setDimensions(loadedGrid.rows, loadedGrid.cols);
      setGrid(loadedGrid.grid);
      resetAnimation();
      setMetrics({
        nodesVisited: 0,
        pathLength: 0
      });
    }
  };
  
  const handleShareGrid = () => {
    setShareUrl(window.location.href);
    setShowShareModal(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md overflow-y-auto max-h-full">
      <h2 className="text-xl font-bold mb-4">Controls</h2>
      
      <div className="space-y-6">
        {/* Algorithm Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Algorithm
          </label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            disabled={isAnimating}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          >
            {algorithms.map((algorithm) => (
              <option key={algorithm.id} value={algorithm.id}>
                {algorithm.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Map Generator Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Map Generator
          </label>
          <select
            value={selectedMapGenerator}
            onChange={(e) => setSelectedMapGenerator(e.target.value as MapGeneratorType)}
            disabled={isAnimating}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          >
            {mapGenerators.map((generator) => (
              <option key={generator.id} value={generator.id}>
                {generator.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerateMap}
            disabled={isAnimating && !isPaused}
            className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Generate Map
          </button>
        </div>
        
        {/* Grid Size */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Grid Size
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Rows</label>
              <input
                type="number"
                min="5"
                max="50"
                value={rows}
                onChange={(e) => {
                  const newRows = parseInt(e.target.value);
                  if (newRows >= 5 && newRows <= 50) {
                    setDimensions(newRows, cols);
                  }
                }}
                disabled={isAnimating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Columns</label>
              <input
                type="number"
                min="5"
                max="50"
                value={cols}
                onChange={(e) => {
                  const newCols = parseInt(e.target.value);
                  if (newCols >= 5 && newCols <= 50) {
                    setDimensions(rows, newCols);
                  }
                }}
                disabled={isAnimating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
        
        {/* Animation Speed */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Animation Speed
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs">Slow</span>
            <input
              type="range"
              min="10"
              max="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs">Fast</span>
          </div>
        </div>
        
        {/* Save & Load Grid */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Save & Load Grid
          </label>
          
          {/* Save Grid */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              placeholder="Map name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleSaveGrid}
              disabled={!mapName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Save
            </button>
          </div>
          
          {/* Load Grid */}
          {savedGrids.length > 0 && (
            <div className="flex space-x-2">
              <select
                value={selectedSavedGrid}
                onChange={(e) => setSelectedSavedGrid(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a saved map</option>
                {savedGrids.map((savedGrid) => (
                  <option key={savedGrid.name} value={savedGrid.name}>
                    {savedGrid.name} ({savedGrid.rows}x{savedGrid.cols})
                  </option>
                ))}
              </select>
              <button
                onClick={handleLoadGrid}
                disabled={!selectedSavedGrid}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Load
              </button>
            </div>
          )}
          
          {/* Share Grid */}
          <button
            onClick={handleShareGrid}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Share Current Grid
          </button>
        </div>
        
        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-2">Share Grid</h3>
              <p className="text-sm text-gray-600 mb-4">
                Copy this URL to share your current grid configuration:
              </p>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Copy
                </button>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
        
        {/* Metrics Display */}
        {(metrics.nodesVisited > 0 || isAnimating) && (
          <div className="space-y-1 p-2 bg-gray-200 rounded-md text-sm">
            <div className="flex justify-between">
              <span>Nodes Visited:</span>
              <span>{metrics.nodesVisited}</span>
            </div>
            <div className="flex justify-between">
              <span>Path Length:</span>
              <span>{metrics.pathLength}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{(timeElapsed / 1000).toFixed(2)}s</span>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleResetGrid}
            disabled={isAnimating && !isPaused}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Clear Grid
          </button>
          
          {!isAnimating ? (
            <button
              onClick={runAlgorithm}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Run Algorithm
            </button>
          ) : isPaused ? (
            <div className="flex space-x-2">
              <button
                onClick={resumeAnimation}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Resume
              </button>
              <button
                onClick={stopAnimation}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Stop
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={pauseAnimation}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Pause
              </button>
              <button
                onClick={stopAnimation}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Stop
              </button>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 mt-4">
          <p>Click or drag on the grid to create walls</p>
          <p>Drag the start and end points to reposition them</p>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 