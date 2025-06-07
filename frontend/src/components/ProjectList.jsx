import React from 'react';
import useProjectStore from '../store/projectStore';
import ProjectCard from './ProjectCard';
import AddProjectCard from './AddProjectCard';

const ProjectList = () => {
  const projects = useProjectStore((state) => state.projects);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);
  
  // 디버깅을 위해 projects 상태를 콘솔에 출력해볼 수 있습니다.
  // console.log('Current projects state:', projects);

  if (loading && (!projects || projects.length === 0)) return <p className="text-center">프로젝트 로딩 중...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {/* --- 바로 이 부분에 방어 코드를 추가합니다 --- */}
      {Array.isArray(projects) && projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <AddProjectCard />
    </div>
  );
};

export default ProjectList;