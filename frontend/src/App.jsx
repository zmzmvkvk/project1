import { useEffect } from 'react';
import useProjectStore from './store/projectStore';
import ProjectList from './components/ProjectList';

function App() {
  // 스토어에서 fetchProjects 액션을 가져옴
  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  // 앱이 처음 로드될 때 프로젝트 목록을 가져오도록 설정
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">AI Animation Dashboard</h1>
        <ProjectList />
      </div>
    </div>
  );
}

export default App;