import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useProjectStore from "../store/projectStore";

// 테스트용 캐릭터 데이터
const characterOptions = [
  {
    id: 1,
    name: "테스트 캐릭터 1",
    imageUrl:
      "https://img.freepik.com/premium-photo/a-lion-with-a-crown-of-leaves-on-his-head_974342-26150.jpg",
    description: "A wise and strong lion king.",
  },
  {
    id: 2,
    name: "테스트 캐릭터 2",
    imageUrl:
      "https://img.freepik.com/premium-photo/a-small-lion-cub-is-sitting-on-a-rock_974342-26131.jpg",
    description: "A young, adventurous lion cub.",
  },
  {
    id: 3,
    name: "테스트 캐릭터 3",
    imageUrl:
      "https://img.freepik.com/premium-photo/a-colorful-toucan-with-a-yellow-beak-and-a-blue-eye_974342-26188.jpg",
    description: "A sarcastic and witty hornbill.",
  },
  {
    id: 4,
    name: "테스트 캐릭터 4",
    imageUrl:
      "https://img.freepik.com/premium-photo/a-warthog-with-a-mohawk-and-a-brown-background_974342-26194.jpg",
    description: "A goofy and lovable warthog.",
  },
];

const ProjectSettingsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // 스토어 훅
  const projects = useProjectStore((state) => state.projects);
  const scenes = useProjectStore((state) => state.scenes); // 씬 목록을 가져와 스토리 존재 여부 판단
  const fetchProject = useProjectStore((state) => state.fetchProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const generateStory = useProjectStore((state) => state.generateStory);
  const loading = useProjectStore((state) => state.loading);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );
  const storyExists = useMemo(() => scenes && scenes.length > 0, [scenes]);

  const [globalSettings, setGlobalSettings] = useState({
    defaultGuidanceScale: 7,
    defaultNegativePrompt: "",
  });
  const [topic, setTopic] = useState("A brave lion becomes king");
  const [selectedCharId, setSelectedCharId] = useState(1);
  const [modelId, setModelId] = useState(
    "1e60896f-3c26-4296-8ecc-53e2afecc132"
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!project) fetchProject(projectId);
  }, [projectId, project, fetchProject]);

  useEffect(() => {
    if (project) {
      setGlobalSettings({
        defaultGuidanceScale: project.defaultGuidanceScale || 7,
        defaultNegativePrompt:
          project.defaultNegativePrompt ||
          "blurry, low quality, watermark, text",
      });
      setIsLoading(false);
    }
  }, [project]);

  // 전역 설정만 저장하는 핸들러
  const handleSaveSettings = async () => {
    setIsProcessing(true);
    await updateProject(projectId, globalSettings);
    setIsProcessing(false);
    alert("프로젝트 기본 설정이 저장되었습니다.");
    navigate(`/project/${projectId}`);
  };

  // 설정 저장과 스토리 생성을 함께하는 핸들러
  const handleSaveAndGenerate = async () => {
    setIsProcessing(true);
    await updateProject(projectId, globalSettings);

    const selectedCharacter = characterOptions.find(
      (c) => c.id === selectedCharId
    );
    const storySettings = {
      topic,
      character: selectedCharacter.description,
      platform: "youtube",
      leonardoModelId: modelId,
    };
    await generateStory(projectId, storySettings);

    setIsProcessing(false);
    alert(
      "설정이 저장되고 새로운 스토리가 생성되었습니다! 스토리 에디터로 이동합니다."
    );
    navigate(`/project/${projectId}`);
  };

  if (isLoading)
    return <p className="text-center p-8">프로젝트 설정을 불러오는 중...</p>;

  return (
    <div>
      <Link
        to={`/project/${projectId}`}
        className="text-blue-400 hover:underline mb-6 inline-block"
      >
        &larr; Back to Story Editor
      </Link>
      {/* 스토리 존재 여부에 따라 페이지 제목 변경 */}
      <h1 className="text-4xl font-bold mb-8">
        {storyExists ? "프로젝트 설정" : "프로젝트 및 스토리 생성 설정"}
      </h1>

      {/* --- 1. 전역 기본 설정 섹션 (항상 표시) --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-2 border-b border-gray-600 pb-2">
          전역 기본 설정
        </h2>
        <p className="text-gray-400 mb-6">
          모든 씬에 기본으로 적용될 값들을 설정합니다. (개별 씬에서 재정의 가능)
        </p>
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              기본 Guidance Scale:{" "}
              <span className="font-bold text-blue-400">
                {globalSettings.defaultGuidanceScale}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={globalSettings.defaultGuidanceScale}
              onChange={(e) =>
                setGlobalSettings({
                  ...globalSettings,
                  defaultGuidanceScale: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label
              htmlFor="negative-prompt"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              기본 Negative Prompt
            </label>
            <textarea
              id="negative-prompt"
              rows="3"
              value={globalSettings.defaultNegativePrompt}
              onChange={(e) =>
                setGlobalSettings({
                  ...globalSettings,
                  defaultNegativePrompt: e.target.value,
                })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500"
              placeholder="모든 씬에서 기본적으로 제외할 요소들을 입력하세요."
            />
          </div>
        </div>
      </div>

      {/* --- 2. 새 스토리 생성 섹션 (스토리가 없을 때만 표시) --- */}
      {!storyExists && (
        <div>
          <h2 className="text-2xl font-semibold mb-2 border-b border-gray-600 pb-2">
            새 스토리 생성
          </h2>
          <p className="text-gray-400 mb-6">
            아래 설정을 기반으로 새로운 스토리를 생성합니다.
          </p>
          <div className="space-y-8 max-w-3xl bg-gray-800 p-8 rounded-lg">
            {/* Topic, Character, Style UI */}
            <div>
              <label
                htmlFor="topic"
                className="block text-lg font-medium text-gray-200 mb-2"
              >
                1. 스토리 주제 / 아이디어
              </label>
              <textarea
                id="topic"
                rows="3"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-200 mb-2">
                2. 메인 캐릭터 선택
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {characterOptions.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transform transition-transform duration-200 hover:scale-105 ${
                      selectedCharId === char.id
                        ? "border-blue-500 ring-2 ring-blue-500"
                        : "border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={char.imageUrl}
                      alt={char.name}
                      className="w-full h-40 object-cover"
                    />
                    <p className="text-center text-sm bg-gray-700 p-2 truncate">
                      {char.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="leonardo-model"
                className="block text-lg font-medium text-gray-200 mb-2"
              >
                3. 비주얼 스타일 (AI 모델)
              </label>
              <select
                id="leonardo-model"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-blue-500"
              >
                <option value="1e60896f-3c26-4296-8ecc-53e2afecc132">
                  Leonardo Diffusion XL
                </option>
                <option value="b7aa9931-a5de-427c-99c0-3d7751508a8f">
                  3D Animation Style
                </option>
                <option value="ac614f96-1082-45bf-be9d-757f2d31c174">
                  DreamShaper v7
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* --- 최종 액션 버튼 (상황에 따라 다른 기능 수행) --- */}
      <div className="mt-8 pt-4 text-center">
        {storyExists ? (
          <button
            onClick={handleSaveSettings}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-500 text-lg"
          >
            {isProcessing ? "저장 중..." : "프로젝트 설정 저장"}
          </button>
        ) : (
          <button
            onClick={handleSaveAndGenerate}
            disabled={isProcessing || loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-500 text-lg"
          >
            {isProcessing || loading
              ? "처리 중..."
              : "설정 저장 및 스토리 생성"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectSettingsPage;
