import React from 'react';
import useProjectStore from '../store/projectStore';

const SceneCard = ({ scene }) => {
  // --- 수정된 부분: Zustand 상태와 액션을 개별적으로 선택하여 무한 루프 방지 ---
  const generateImageForScene = useProjectStore((state) => state.generateImageForScene);
  const loadingSceneId = useProjectStore((state) => state.loadingSceneId);
  // --- 수정 완료 ---

  // 현재 씬의 이미지가 생성 중인지 확인
  const isLoading = loadingSceneId === scene.id;

  return (
    <div className="bg-gray-800 p-4 rounded-lg flex items-start space-x-4 min-h-[136px]">
      <span className="text-gray-500 font-bold w-6 text-center pt-1">{scene.order}</span>
      <div className="flex-1">
        <p className="text-gray-300">{scene.text}</p>
      </div>
      <div className="w-48 h-28 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            {/* 간단한 스피너 애니메이션 추가 */}
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="text-sm text-gray-400 mt-2">생성 중...</p>
          </div>
        ) : scene.image_url ? (
          <img src={scene.image_url} alt={`Scene ${scene.order}`} className="w-full h-full object-cover rounded-md" />
        ) : (
          <button
            onClick={() => generateImageForScene(scene.id)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded"
            disabled={loadingSceneId !== null} // 다른 이미지가 생성 중일 때는 비활성화
          >
            이미지 생성
          </button>
        )}
      </div>
    </div>
  );
};

export default SceneCard;