import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useProjectStore from "../store/projectStore";

// --- 데이터 정의 ---
const allModels = [
  {
    id: "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3",
    name: "Leonardo Phoenix 1.0",
    type: "phoenix",
  },
  {
    id: "b2614463-296c-462a-9586-aafdb8f00e36",
    name: "Flux Dev",
    type: "flux",
  },
  {
    id: "1dd50843-d653-4516-a8e3-f0238ee453ff",
    name: "Flux Schnell",
    type: "flux",
  },
  {
    id: "05ce0082-2d80-4a2d-8653-4d1c85e2418e",
    name: "Lucid Realism",
    type: "lucid",
  },
  {
    id: "e71a1c2f-4f80-4800-934f-2c68979d8cc8",
    name: "Leonardo Anime XL",
    type: "sdxl",
  },
  {
    id: "b24e16ff-06e3-43eb-8d33-4416c2d75876",
    name: "Leonardo Lightning XL",
    type: "sdxl",
  },
  {
    id: "16e7060a-803e-4df3-97ee-edcfa5dc9cc8",
    name: "SDXL 1.0",
    type: "sdxl",
  },
  {
    id: "aa77f04e-3eec-4034-9c07-d0f619684628",
    name: "Leonardo Kino XL",
    type: "sdxl",
  },
  {
    id: "5c232a9e-9061-4777-980a-ddc8e65647c6",
    name: "Leonardo Vision XL",
    type: "sdxl",
  },
  {
    id: "1e60896f-3c26-4296-8ecc-53e2afecc132",
    name: "Leonardo Diffusion XL",
    type: "sdxl",
  },
  {
    id: "2067ae52-33fd-4a82-bb92-c2c55e7d2786",
    name: "AlbedoBase XL",
    type: "sdxl",
  },
  {
    id: "d69c8273-6b17-4a30-a13e-d6637ae1c644",
    name: "3D Animation Style",
    type: "sdxl",
  },
  {
    id: "ac614f96-1082-45bf-be9d-757f2d31c174",
    name: "DreamShaper v7",
    type: "sdxl",
  },
];
const styleUUIDOptions = [
  { uuid: "a5632c7c-ddbb-4e2f-ba34-8456ab3ac436", name: "Cinematic" },
  { uuid: "645e4195-f63d-4715-a752-e2fb1e8b7c70", name: "Illustration" },
  { uuid: "debdF72a-91a4-467b-bf61-cc02bdeb69c6", name: "3D Render" },
];
const presetStyleOptions = [
  { value: "CINEMATIC", name: "Cinematic" },
  { value: "FILM", name: "Film" },
  { value: "3D_ANIMATION", name: "3D Animation" },
  { value: "ANIME", name: "Anime" },
];
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
const initialTemplates = {
  1: {
    clothingStyle: "royal golden armor with a red cape",
    bodyType: "large and muscular build",
    hairstyle: "magnificent, thick mane",
    faceShape: "strong, square jawline",
    nailStyle: "sharp, well-maintained claws",
    footStyle: "large, powerful paws",
  },
  2: {
    clothingStyle: "a simple leaf collar",
    bodyType: "small and nimble",
    hairstyle: "scruffy, short fur",
    faceShape: "rounded and youthful",
    nailStyle: "small, playful claws",
    footStyle: "small, cute paws",
  },
  3: {
    clothingStyle: "no clothing, natural feathers",
    bodyType: "slender bird body",
    hairstyle: "colorful crest of feathers",
    faceShape: "long beak, sharp eyes",
    nailStyle: "sharp talons",
    footStyle: "thin bird feet",
  },
  4: {
    clothingStyle: "a rugged leather harness",
    bodyType: "plump and stocky",
    hairstyle: "a prominent mohawk",
    faceShape: "wide snout with tusks",
    nailStyle: "blunt hooves",
    footStyle: "sturdy hooves",
  },
};

const ProjectSettingsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const projects = useProjectStore((state) => state.projects);
  const scenes = useProjectStore((state) => state.scenes);
  const loading = useProjectStore((state) => state.loading);
  const fetchProject = useProjectStore((state) => state.fetchProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const generateStory = useProjectStore((state) => state.generateStory);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );
  const storyExists = useMemo(() => scenes && scenes.length > 0, [scenes]);

  const [globalSettings, setGlobalSettings] = useState({
    defaultGuidanceScale: 7,
    defaultNegativePrompt: "blurry, low quality, watermark, text",
  });

  const [storyGenSettings, setStoryGenSettings] = useState({
    topic: "A brave lion becomes king",
    selectedCharId: 1,
    characterTemplate: initialTemplates[1],
    modelId: "d69c8273-6b17-4a30-a13e-d6637ae1c644",
    styleUUID: "",
    presetStyle: "3D_ANIMATION",
    alchemy: true,
    photoReal: false,
    contrast: 1.0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedModel = useMemo(
    () => allModels.find((m) => m.id === storyGenSettings.modelId),
    [storyGenSettings.modelId]
  );

  useEffect(() => {
    if (!project) {
      fetchProject(projectId);
    }
    setIsLoading(false);
  }, [projectId, project, fetchProject]);

  useEffect(() => {
    if (project) {
      setGlobalSettings({
        defaultGuidanceScale: project.defaultGuidanceScale || 7,
        defaultNegativePrompt:
          project.defaultNegativePrompt ||
          "blurry, low quality, watermark, text",
      });
    }
  }, [project]);

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue =
      type === "checkbox"
        ? checked
        : name === "contrast"
        ? parseFloat(value)
        : value; // contrast 값일 경우 숫자로 변환

    setStoryGenSettings((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleCharacterSelect = (id) => {
    setStoryGenSettings((prev) => ({
      ...prev,
      selectedCharId: id,
      characterTemplate: initialTemplates[id],
    }));
  };

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setStoryGenSettings((prev) => ({
      ...prev,
      characterTemplate: {
        ...prev.characterTemplate,
        [name]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setIsProcessing(true);
    await updateProject(projectId, globalSettings);
    setIsProcessing(false);
    alert("프로젝트 기본 설정이 저장되었습니다.");
    navigate(`/project/${projectId}`);
  };

  const handleSaveAndGenerate = async () => {
    setIsProcessing(true);
    await updateProject(projectId, globalSettings);

    const selectedCharacter = characterOptions.find(
      (c) => c.id === storyGenSettings.selectedCharId
    );

    const settingsToSave = {
      ...storyGenSettings,
      character: selectedCharacter.description,
      platform: "youtube",
      leonardoModelId: storyGenSettings.modelId,
    };
    await generateStory(projectId, settingsToSave);

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
      <h1 className="text-4xl font-bold mb-8">
        {storyExists ? "프로젝트 설정" : "프로젝트 및 스토리 생성 설정"}
      </h1>

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

      {!storyExists && (
        <div>
          <h2 className="text-2xl font-semibold mb-2 border-b border-gray-600 pb-2">
            새 스토리 생성
          </h2>
          <p className="text-gray-400 mb-6">
            아래 설정을 기반으로 새로운 스토리를 생성합니다.
          </p>
          <div className="space-y-8 max-w-3xl bg-gray-800 p-8 rounded-lg">
            <div>
              <label
                htmlFor="topic"
                className="block text-lg font-medium text-gray-200 mb-2"
              >
                1. 스토리 주제 / 아이디어
              </label>
              <textarea
                id="topic"
                name="topic"
                rows="3"
                value={storyGenSettings.topic}
                onChange={handleSettingChange}
                className="w-full bg-gray-700 p-3 rounded-md"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-200 mb-2">
                2. 메인 캐릭터
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {characterOptions.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => handleCharacterSelect(char.id)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                      storyGenSettings.selectedCharId === char.id
                        ? "border-blue-500 ring-2"
                        : "border-gray-600"
                    }`}
                  >
                    <p className="text-center text-sm bg-gray-700 p-2 truncate">
                      {char.name}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 border border-gray-700 rounded-lg">
                <h3 className="text-md font-semibold text-gray-200 mb-4">
                  캐릭터 상세 템플릿 설정
                </h3>
                <div className="space-y-3">
                  {Object.entries({
                    clothingStyle: "의상 스타일",
                    bodyType: "체형",
                    hairstyle: "헤어스타일",
                    faceShape: "얼굴형",
                    nailStyle: "네일/손톱 스타일",
                    footStyle: "발 스타일",
                  }).map(([name, label]) => (
                    <div
                      key={name}
                      className="grid grid-cols-3 items-center gap-4"
                    >
                      <label
                        htmlFor={name}
                        className="text-sm text-gray-400 text-right"
                      >
                        {label}
                      </label>
                      <input
                        id={name}
                        type="text"
                        name={name}
                        value={storyGenSettings.characterTemplate[name] || ""}
                        onChange={handleTemplateChange}
                        className="col-span-2 bg-gray-700 p-2 rounded-md text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-200 mb-2">
                3. 비주얼 스타일 및 상세 옵션
              </label>
              <select
                name="modelId"
                value={storyGenSettings.modelId}
                onChange={handleSettingChange}
                className="w-full bg-gray-700 p-3 rounded-md"
              >
                {allModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <div className="mt-4 p-4 border border-gray-700 rounded-lg space-y-4">
                <h4 className="text-md font-semibold text-gray-200 mb-3">
                  스타일 상세 설정
                </h4>
                {selectedModel?.type === "sdxl" && (
                  <div>
                    <label
                      htmlFor="presetStyle"
                      className="text-sm font-medium text-gray-300"
                    >
                      Preset Style (For SDXL)
                    </label>
                    <select
                      name="presetStyle"
                      value={storyGenSettings.presetStyle}
                      onChange={handleSettingChange}
                      className="w-full bg-gray-600 p-2 mt-1 rounded-md text-sm"
                    >
                      {presetStyleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {(selectedModel?.type === "flux" ||
                  selectedModel?.type === "phoenix" ||
                  selectedModel?.type === "lucid") && (
                  <div>
                    <label
                      htmlFor="styleUUID"
                      className="text-sm font-medium text-gray-300"
                    >
                      Style (For Phoenix/Flux)
                    </label>
                    <select
                      name="styleUUID"
                      value={storyGenSettings.styleUUID}
                      onChange={handleSettingChange}
                      className="w-full bg-gray-600 p-2 mt-1 rounded-md text-sm"
                    >
                      <option value="">None</option>
                      {styleUUIDOptions.map((opt) => (
                        <option key={opt.uuid} value={opt.uuid}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-300 mb-3">
                    고급 옵션
                  </h5>
                  <div className="space-y-3">
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        name="alchemy"
                        checked={storyGenSettings.alchemy}
                        onChange={handleSettingChange}
                        className="w-4 h-4 mr-2"
                      />{" "}
                      Alchemy (품질 향상)
                    </label>
                    {selectedModel?.type === "sdxl" && (
                      <label className="flex items-center text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          name="photoReal"
                          checked={storyGenSettings.photoReal}
                          onChange={handleSettingChange}
                          className="mr-2"
                        />{" "}
                        PhotoReal (실사 표현)
                      </label>
                    )}
                    {(selectedModel?.type === "flux" ||
                      selectedModel?.type === "phoenix") && (
                      <div>
                        <label
                          htmlFor="contrast"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Contrast:{" "}
                          <span className="font-bold">
                            {storyGenSettings.contrast.toFixed(2)}
                          </span>
                        </label>
                        <input
                          type="range"
                          id="contrast"
                          name="contrast"
                          min="0"
                          max="2"
                          step="0.05"
                          value={storyGenSettings.contrast}
                          onChange={handleSettingChange}
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 text-right">
              <button
                onClick={handleSaveAndGenerate}
                disabled={isProcessing || loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
              >
                {isProcessing || loading
                  ? "처리 중..."
                  : "설정 저장 및 스토리 생성"}
              </button>
            </div>
          </div>
        </div>
      )}

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
