import { useEffect } from 'react';
import useProjectStore from '../store/projectStore';
import ProjectList from '../components/ProjectList';

const DashboardPage = () => {
  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">AI Animation Dashboard</h1>
      <ProjectList />
    </>
  );
};

export default DashboardPage;