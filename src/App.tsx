import { useEffect } from 'react'
import './App.css'
import { Canvas } from './components/Canvas'
import ControlPanel from './components/ControlPanel'
import { useGridStore } from './store/gridStore'
import { getStateFromUrl } from './utils/urlUtils'

function App() {
  const { setDimensions } = useGridStore()
  
  useEffect(() => {
    const savedGrid = getStateFromUrl()
    if (savedGrid && savedGrid.rows && savedGrid.cols) {
      setDimensions(savedGrid.rows, savedGrid.cols)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Path Finding Playground</h1>
      </header>

      <main className="flex flex-col md:flex-row flex-grow p-4 gap-4">
        <div className="w-full md:w-3/4 bg-white rounded-lg shadow-md p-4">
          <Canvas />
        </div>

        <div className="w-full md:w-1/4 bg-white rounded-lg shadow-md p-4">
          <ControlPanel />
        </div>
      </main>

      <footer className="bg-gray-200 p-2 text-center text-gray-600 text-sm">
        Path Finding Playground | Build with React + TypeScript
      </footer>
    </div>
  )
}

export default App
