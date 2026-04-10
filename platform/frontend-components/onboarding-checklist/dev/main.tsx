import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { OnboardingChecklist } from '../src';
import type { ChecklistTask } from '../src';

const INITIAL_TASKS: ChecklistTask[] = [
  { id: 1, label: 'Join Arcade', completed: true },
  { id: 2, label: 'Install Extension', completed: true },
  { id: 3, label: 'Create an Arcade', completed: true },
  { id: 4, label: 'Share an Arcade', completed: false },
];

function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const handleToggle = (id: string | number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <OnboardingChecklist
        tasks={tasks}
        onToggleTask={handleToggle}
        userName="Connie"
        onDismiss={() => alert('Dismissed!')}
        completionMessage={
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            🎉 All tasks completed!
          </span>
        }
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
