import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ErrorBoundary from './components/ErrorBoundary'
import { logger, setupGlobalErrorHandling } from './utils/logger'
import { useComponentLogging, useUserActionLogging, useNavigationLogging } from './hooks/useLogging'
import { apiClient } from './services/api'

function App() {
  const [count, setCount] = useState(0)
  const [healthStatus, setHealthStatus] = useState<string>('unknown')
  
  // Setup logging for this component
  useComponentLogging('App')
  useNavigationLogging()
  const { logClick } = useUserActionLogging('App')

  useEffect(() => {
    // Setup global error handling
    setupGlobalErrorHandling()
    
    // Log app startup
    logger.info('Flat Dashboard started', {
      environment: import.meta.env.MODE,
      version: '1.0.0',
      userAgent: navigator.userAgent,
    })

    // Check backend health
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const health = await apiClient.healthCheck()
      setHealthStatus(health.status)
      logger.info('Backend health check successful', { status: health.status })
    } catch (error) {
      setHealthStatus('unhealthy')
      logger.warn('Backend health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  const handleCountClick = () => {
    const newCount = count + 1
    setCount(newCount)
    
    // Log user interaction
    logClick('count-button', { 
      previousCount: count, 
      newCount 
    })

    // Log milestone counts
    if (newCount % 10 === 0) {
      logger.info('Count milestone reached', { 
        count: newCount,
        milestone: newCount 
      })
    }
  }

  const simulateError = () => {
    logger.warn('User triggered error simulation')
    throw new Error('This is a test error to demonstrate error logging')
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <div className="status-bar">
          <span className={`health-indicator ${healthStatus}`}>
            Backend: {healthStatus}
          </span>
        </div>
        
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        
        <h1>Flat Dashboard</h1>
        
        <div className="card">
          <button onClick={handleCountClick}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        
        <div className="debug-actions">
          <button onClick={checkBackendHealth} className="health-check-btn">
            Check Backend Health
          </button>
          
          {import.meta.env.DEV && (
            <button onClick={simulateError} className="error-btn">
              Simulate Error (Dev Only)
            </button>
          )}
        </div>
        
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </ErrorBoundary>
  )
}

export default App
