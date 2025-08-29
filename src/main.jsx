import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './TFMApp.jsx'
import BudgetPacingFlowchart from './BudgetPacingFlowchart.jsx'

const isFlowchart = window.location.pathname.endsWith('/flowchart');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isFlowchart ? (
      <div className="min-h-screen p-4 md:p-6 bg-[#0B0B0D]">
        <BudgetPacingFlowchart showTests={true} />
      </div>
    ) : (
      <App />
    )}
  </StrictMode>,
)
