import React, { useState, useEffect } from "react";
import useProjectStore from "../store/projectStore";
import SceneSettingsPanel from "./SceneSettingsPanel";

const SceneCard = ({ scene }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState("");

  const generateImageForScene = useProjectStore(
    (state) => state.generateImageForScene
  );
  const loadingSceneId = useProjectStore((state) => state.loadingSceneId);
  const isLoading = loadingSceneId === scene.id;

  useEffect(() => {
    // --- ★★★ 수정된 부분 ★★★ ---
    // 이전 'visualPrompt' 필드 대신, 새로운 'imgPrompt' 필드를 참조합니다.
    setEditablePrompt(scene.imgPrompt || scene.text);
  }, [scene.imgPrompt, scene.text]); // 의존성 배열도 새 필드명으로 변경

  // 최초 생성 핸들러
  const handleInitialGeneration = () => {
    generateImageForScene(scene.id);
  };

  // 재생성 시작 핸들러
  const handleStartRegeneration = () => {
    setIsPrompting(true);
    setIsSettingsOpen(true);
  };

  // 재생성 확정 핸들러
  const handleConfirmRegeneration = () => {
    setIsPrompting(false);
    setIsSettingsOpen(false);
    generateImageForScene(scene.id, { prompt: editablePrompt });
  };

  // 프롬프트 수정 취소 핸들러
  const handleCancelPrompting = () => {
    setIsPrompting(false);
    // --- ★★★ 수정된 부분 ★★★ ---
    // 취소 시에도 새로운 'imgPrompt' 필드를 참조하여 복원합니다.
    setEditablePrompt(scene.imgPrompt || scene.text);
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

        <div className="w-64 h-40 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0 relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="text-sm text-gray-400 mt-2">생성 중...</p>
            </div>
          ) : scene.image_url ? (
            isPrompting ? (
              <div className="w-full h-full p-2 flex flex-col">
                <textarea
                  value={editablePrompt}
                  onChange={(e) => setEditablePrompt(e.target.value)}
                  className="w-full flex-grow bg-gray-900 text-xs text-white rounded-md p-2 border border-blue-500 focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={handleCancelPrompting}
                    className="bg-gray-600 text-xs px-2 py-1 rounded hover:bg-gray-500"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmRegeneration}
                    className="bg-green-600 text-xs px-2 py-1 rounded hover:bg-green-500"
                  >
                    생성 확인
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={scene.image_url}
                  alt={`Scene ${scene.order}`}
                  className="w-full h-full object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={handleStartRegeneration}
                    className="bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded hover:bg-blue-500"
                  >
                    재생성
                  </button>
                </div>
              </>
            )
          ) : (
            <button
              onClick={handleInitialGeneration}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded"
            >
              이미지 생성
            </button>
          )}
        </div>

        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`p-2 text-gray-400 hover:text-white rounded-full transition ${
            isSettingsOpen ? "bg-blue-800 text-white" : "hover:bg-gray-700"
          }`}
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

      {isSettingsOpen && <SceneSettingsPanel scene={scene} />}
    </div>
  );
};

export default SceneCard;
