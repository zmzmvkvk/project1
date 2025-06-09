import React, { useState, useEffect } from "react";
import useProjectStore from "../store/projectStore";
import SceneSettingsPanel from "./SceneSettingsPanel";

const SceneCard = ({ scene }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false); // 프롬프트 수정 UI 표시 상태
  const [editablePrompt, setEditablePrompt] = useState(""); // 수정 가능한 프롬프트 상태

  const generateImageForScene = useProjectStore(
    (state) => state.generateImageForScene
  );
  const loadingSceneId = useProjectStore((state) => state.loadingSceneId);
  const isLoading = loadingSceneId === scene.id;

  useEffect(() => {
    // 씬 데이터가 변경될 때마다 수정용 프롬프트 상태를 초기화합니다.
    setEditablePrompt(scene.visualPrompt || scene.text);
  }, [scene.visualPrompt, scene.text]);

  // --- 핸들러 함수 정리 ---

  // 1. 최초 생성 핸들러 ('이미지 생성' 버튼 클릭 시)
  const handleInitialGeneration = () => {
    // 프롬프트 수정창 없이 바로 생성 시작
    generateImageForScene(scene.id);
  };

  // 2. 재생성 시작 핸들러 ('재생성' 버튼 클릭 시)
  const handleStartRegeneration = () => {
    // 프롬프트 수정창과 상세 설정 패널을 함께 엽니다.
    setIsPrompting(true);
    setIsSettingsOpen(true);
  };

  // 3. 재생성 확정 핸들러 ('생성 확인' 버튼 클릭 시)
  const handleConfirmRegeneration = () => {
    setIsPrompting(false);
    setIsSettingsOpen(false);
    // 수정된 프롬프트를 담아 생성 요청
    generateImageForScene(scene.id, { prompt: editablePrompt });
  };

  // 4. 프롬프트 수정 취소 핸들러
  const handleCancelPrompting = () => {
    setIsPrompting(false);
    // 수정 전의 프롬프트로 복원합니다.
    setEditablePrompt(scene.visualPrompt || scene.text);
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
            // 로딩 UI
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="text-sm text-gray-400 mt-2">생성 중...</p>
            </div>
          ) : scene.image_url ? (
            // 이미지가 있을 경우
            isPrompting ? (
              // 재생성을 위해 프롬프트 수정 중일 때
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
              // 생성된 이미지만 보일 때
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
            // 이미지가 없을 때 (최초 생성 버튼)
            <button
              onClick={handleInitialGeneration}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded"
            >
              이미지 생성
            </button>
          )}
        </div>

        {/* 상세 설정 버튼 */}
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
