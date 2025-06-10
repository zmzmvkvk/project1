import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useProjectStore from "../store/projectStore";

// --- 데이터 정의 ---
const styleTemplates = [
  {
    id: "style_1",
    name: "실사풍 애니메이션",
    description: "일러스트와 실사 느낌이 조화된 고품질 스타일입니다.",
    settings: {
      modelId: "5c232a9e-9061-4777-980a-ddc8e65647c6", // Leonardo Vision XL
      presetStyle: "CINEMATIC",
      photoReal: true,
      alchemy: true,
      ultra: false,
      enhancePrompt: true,
    },
  },
  {
    id: "style_2",
    name: "일본 애니메이션",
    description: "전통적인 일본 애니메이션(2D) 스타일입니다.",
    settings: {
      modelId: "e71a1c2f-4f80-4800-934f-2c68979d8cc8", // Leonardo Anime XL
      presetStyle: "ANIME",
      photoReal: false,
      alchemy: true,
      ultra: false,
      enhancePrompt: false,
    },
  },
  {
    id: "style_3",
    name: "3D 애니메이션",
    description: "픽사 스타일의 고품질 3D 렌더링 결과물을 만듭니다.",
    settings: {
      modelId: "d69c8273-6b17-4a30-a13e-d6637ae1c644", // 3D Animation Style
      presetStyle: null,
      photoReal: false,
      alchemy: true,
      ultra: true,
      enhancePrompt: true,
    },
  },
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
    selectedTemplateId: "style_1",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleTopicChange = (e) => {
    setStoryGenSettings((prev) => ({ ...prev, topic: e.target.value }));
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

  const handleStyleTemplateSelect = (templateId) => {
    setStoryGenSettings((prev) => ({
      ...prev,
      selectedTemplateId: templateId,
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

    const selectedTemplate = styleTemplates.find(
      (t) => t.id === storyGenSettings.selectedTemplateId
    );

    const settingsToSave = {
      topic: storyGenSettings.topic,
      characterTemplate: storyGenSettings.characterTemplate,
      character: selectedCharacter.description,
      platform: "youtube",
      ...selectedTemplate.settings,
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
                onChange={handleTopicChange}
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
                        ? "border-blue-500 ring-2 ring-blue-500"
                        : "border-gray-600 hover:border-blue-400"
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
                3. 비주얼 스타일 선택
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {styleTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleStyleTemplateSelect(template.id)}
                    className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${
                      storyGenSettings.selectedTemplateId === template.id
                        ? "border-blue-500 ring-2 ring-blue-500 bg-gray-700"
                        : "border-gray-600 hover:border-blue-400"
                    }`}
                  >
                    <h4 className="font-bold text-white">{template.name}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </div>
                ))}
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
