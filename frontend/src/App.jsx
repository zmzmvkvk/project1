import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import StoryEditorPage from "./pages/StoryEditorPage";
import ProjectSettingsPage from "./pages/ProjectSettingsPage";

function App() {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/project/:projectId" element={<StoryEditorPage />} />
          <Route
            path="/project/:projectId/settings"
            element={<ProjectSettingsPage />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
