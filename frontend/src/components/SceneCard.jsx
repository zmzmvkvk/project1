import React, { useState } from "react"; // useState 임포트
import useProjectStore from "../store/projectStore";
import SceneSettingsPanel from "./SceneSettingsPanel"; // 새로 만들 컴포넌트 임포트

const SceneCard = ({ scene }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 설정 패널 표시 상태
  const generateImageForScene = useProjectStore(
    (state) => state.generateImageForScene
  );
  const loadingSceneId = useProjectStore((state) => state.loadingSceneId);
  const isLoading = loadingSceneId === scene.id;

  // '이미지 생성' 버튼 클릭 핸들러
  const handleGenerateClick = () => {
    // isSettingsOpen 상태와 관계없이 항상 패널을 닫고 생성을 시작
    setIsSettingsOpen(false);
    generateImageForScene(scene.id, {
      guidance_scale: scene.guidance_scale || 7,
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md transition-all duration-300">
      <div className="p-4 flex items-start space-x-4">
        <span className="text-gray-500 font-bold w-6 text-center pt-1">
          {scene.order}
        </span>
        <div className="flex-1">
          <p className="text-gray-300">{scene.text}</p>
        </div>
        <div className="w-48 h-28 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="text-sm text-gray-400 mt-2">생성 중...</p>
            </div>
          ) : scene.image_url ? (
            <img
              src={scene.image_url}
              alt={`Scene ${scene.order}`}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <button
              onClick={handleGenerateClick}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded"
              disabled={loadingSceneId !== null}
            >
              이미지 생성
            </button>
          )}
        </div>
        {/* 상세 설정 버튼 추가 */}
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition"
          title="상세 설정"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
        </button>
      </div>
      {/* isSettingsOpen 상태에 따라 설정 패널 표시 */}
      {isSettingsOpen && <SceneSettingsPanel scene={scene} />}
    </div>
  );
};

export default SceneCard;
