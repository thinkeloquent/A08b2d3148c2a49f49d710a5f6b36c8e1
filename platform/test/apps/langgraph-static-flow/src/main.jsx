import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import WorkflowReview from './pages/WorkflowReview.jsx'
import WorkflowNodes from './pages/WorkflowNodes.jsx'
import WorkflowNodeForm from './pages/WorkflowNodeForm.jsx'
import WorkflowConditions from './pages/WorkflowConditions.jsx'
import WorkflowConditionForm from './pages/WorkflowConditionForm.jsx'
import { useGraphStore } from './store/useGraphStore.js'
import { useWorkflowStore } from './store/useWorkflowStore.js'

// Load workflows from storage, then load graph definition
useWorkflowStore.getState().loadWorkflows()
  .then(() => useGraphStore.getState().loadGraphDef());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/workflow/review" element={<WorkflowReview />} />
        <Route path="/workflow/nodes" element={<WorkflowNodes />} />
        <Route path="/workflow/nodes/new" element={<WorkflowNodeForm />} />
        <Route path="/workflow/nodes/:nodeId/edit" element={<WorkflowNodeForm />} />
        <Route path="/workflow/conditions" element={<WorkflowConditions />} />
        <Route path="/workflow/conditions/new" element={<WorkflowConditionForm />} />
        <Route path="/workflow/conditions/:conditionName/edit" element={<WorkflowConditionForm />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
