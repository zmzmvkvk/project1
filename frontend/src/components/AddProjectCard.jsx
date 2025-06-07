import React from 'react';
import useProjectStore from '../store/projectStore';

const AddProjectCard = () => {
  // Zustand 스토어에서 addProject 액션을 가져옴
  const addProject = useProjectStore((state) => state.addProject);

  const handleAddProject = () => {
    const projectName = window.prompt("새 프로젝트의 이름을 입력하세요:");
    if (projectName) {
      addProject(projectName);
    }
  };

  return (
    <div 
      className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center 
                 cursor-pointer border-2 border-dashed border-gray-600 
                 hover:border-blue-500 hover:bg-gray-700 transition-all duration-200"
      onClick={handleAddProject}
    >
      <span className="text-7xl font-thin text-gray-500">+</span>
    </div>
  );
};

export default AddProjectCard;