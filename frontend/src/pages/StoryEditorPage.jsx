import React from 'react';
import { useParams, Link } from 'react-router-dom';

const StoryEditorPage = () => {
  const { projectId } = useParams(); // URL에서 projectId를 가져옴

  return (
    <div>
      <Link to="/" className="text-blue-400 hover:underline mb-6 inline-block">&larr; Back to Dashboard</Link>
      <h1 className="text-4xl font-bold mb-4">Story Editor</h1>
      <p className="text-lg text-gray-400">Project ID: {projectId}</p>

      {/* 여기에 나중에 스토리 컷 리스트와 AI 생성 버튼 등이 들어옵니다. */}
    </div>
  );
};

export default StoryEditorPage;