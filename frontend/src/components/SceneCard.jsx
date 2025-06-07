import React from 'react';
import useProjectStore from '../store/projectStore';

const SceneCard = ({ scene, index }) => {
  const { generateImageForScene, loadingSceneId } = useProjectStore(state => ({
    generateImageForScene: state.generateImageForScene,
    loadingSceneId: state.loadingSceneId,
  }));

  const isLoading = loadingSceneId === scene.id;

  return (
    <div className="bg-gray-800 p-4 rounded-lg flex items-start space-x-4">
      <span className="text-gray-500 font-bold w-6 text-center pt-1">{scene.order}</span>
      <div className="flex-1">
        <p className="text-gray-300">{scene.text}</p>
      </div>
      <div className="w-48 h-28 bg-gray-700 rounded-md flex items-center justify-center">
        {isLoading ? (
          <p className="text-sm text-gray-400">생성 중...</p>
        ) : scene.image_url ? (
          <img src={scene.image_url} alt={`Scene ${scene.order}`} className="w-full h-full object-cover rounded-md" />
        ) : (
          <button
            onClick={() => generateImageForScene(scene.id)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded"
          >
            이미지 생성
          </button>
        )}
      </div>
    </div>
  );
};

export default SceneCard;