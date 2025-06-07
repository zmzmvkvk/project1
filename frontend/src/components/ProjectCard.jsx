import React from 'react';

const ProjectCard = ({ project }) => {
  return (
    <div className="aspect-video bg-gray-800 rounded-lg p-4 flex flex-col justify-between cursor-pointer
                    hover:ring-2 hover:ring-blue-500 transition-all duration-200">
      <h3 className="font-bold text-lg text-white">{project.name}</h3>
      <p className="text-sm text-gray-400">
        {new Date(project.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ProjectCard;