import React from "react";
import useProjectStore from "../store/projectStore";

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

// 사용 가능한 ControlNet 목록
const availableControlNets = [
  { name: "Character Reference", preprocessorId: 133 },
  { name: "Pose To Image", preprocessorId: 21 },
  { name: "Style Reference", preprocessorId: 67 },
  { name: "Depth To Image", preprocessorId: 20 },
  { name: "Edge To Image (Canny)", preprocessorId: 19 },
  { name: "Content Reference", preprocessorId: 100 },
];

const SceneSettingsPanel = ({ scene }) => {
  const updateScene = useProjectStore((state) => state.updateScene);
  const currentStory = useProjectStore((state) => state.currentStory);
  const currentProject = useProjectStore((state) => state.currentProject);

  const sceneSettings = scene.sceneSettings || {};
  const guidance =
    scene.guidance_scale ?? currentProject?.defaultGuidanceScale ?? 7;
  const negative_prompt =
    scene.negative_prompt ?? currentProject?.defaultNegativePrompt ?? "";
  const activeControlNets = scene.controlnets || [];
  const activeElements = scene.elements || [];

  // --- 핸들러 함수들 ---
  const handleGuidanceChange = (e) => {
    updateScene(scene.id, { guidance_scale: parseInt(e.target.value, 10) });
  };

  const handleAddControlNet = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    if (!selectedId) return;
    if (activeControlNets.some((cn) => cn.preprocessorId === selectedId)) {
      alert("이미 추가된 ControlNet 입니다.");
      e.target.value = "";
      return;
    }
    const newControlNet = {
      preprocessorId: selectedId,
      initImageId: "",
      weight: 0.75,
    };
    updateScene(scene.id, {
      controlnets: [...activeControlNets, newControlNet],
    });
    e.target.value = "";
  };

  // 핸들러: 씬의 특정 필드를 업데이트
  const handleSceneValueChange = (field, value) => {
    updateScene(scene.id, { [field]: value });
  };

  // 핸들러: 씬의 sceneSettings 객체 내부의 값을 업데이트
  const handleSceneDetailChange = (e) => {
    const { name, value } = e.target;
    updateScene(scene.id, {
      sceneSettings: {
        ...scene.sceneSettings,
        [name]: value,
      },
    });
  };

  const handleControlNetChange = (index, field, value) => {
    const updated = activeControlNets.map((cn, i) =>
      i === index ? { ...cn, [field]: value } : cn
    );
    updateScene(scene.id, { controlnets: updated });
  };

  const handleRemoveControlNet = (index) => {
    const filtered = activeControlNets.filter((_, i) => i !== index);
    updateScene(scene.id, { controlnets: filtered });
  };

  const handleAddElement = () => {
    const newElement = { id: "", weight: 0.75 };
    updateScene(scene.id, { elements: [...activeElements, newElement] });
  };

  const handleElementChange = (index, field, value) => {
    const updated = activeElements.map((el, i) =>
      i === index ? { ...el, [field]: value } : el
    );
    updateScene(scene.id, { elements: updated });
  };

  const handleRemoveElement = (index) => {
    const filtered = activeElements.filter((_, i) => i !== index);
    updateScene(scene.id, { elements: filtered });
  };

  return (
    <div className="bg-gray-900 p-4 border-t border-gray-700 space-y-6">
      <h4 className="text-md font-semibold text-white mb-3">상세 생성 설정</h4>

      <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
        <h5 className="text-sm font-semibold text-gray-200 mb-3">
          씬 상세 연출
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {[
            { name: "background", label: "배경" },
            { name: "timeOfDay", label: "시간대" },
            { name: "action", label: "행동" },
            { name: "emotion", label: "감정" },
            { name: "cameraView", label: "카메라 시점" },
            { name: "lighting", label: "조명" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label
                htmlFor={`${name}-${scene.id}`}
                className="text-xs text-gray-400"
              >
                {label}
              </label>
              <input
                id={`${name}-${scene.id}`}
                type="text"
                name={name}
                value={sceneSettings[name] || ""}
                onChange={handleSceneDetailChange}
                className="w-full text-sm bg-gray-700 border border-gray-600 rounded-md p-1 mt-1"
                placeholder={`${label}...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 고급 옵션 */}
      <div className="p-3 bg-gray-800 rounded-md border border-gray-700 space-y-3">
        <h5 className="text-sm font-semibold text-gray-200 mb-2">고급 옵션</h5>
        <div>
          <label className="block text-xs font-medium text-gray-400">
            Guidance Scale:{" "}
            <span className="font-bold text-blue-400">{guidance}</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={guidance}
            onChange={(e) =>
              handleSceneValueChange(
                "guidance_scale",
                parseInt(e.target.value, 10)
              )
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400">
            Negative Prompt
          </label>
          <textarea
            value={negative_prompt}
            onChange={(e) =>
              handleSceneValueChange("negative_prompt", e.target.value)
            }
            rows={2}
            className="w-full text-sm bg-gray-700 border border-gray-600 rounded-md p-1 mt-1"
          />
        </div>
      </div>

      {/* 기본 설정 */}
      <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
        <h5 className="text-sm font-semibold text-gray-200 mb-2">기본 설정</h5>
        <label
          htmlFor={`guidance-${scene.id}`}
          className="block text-xs font-medium text-gray-400"
        >
          Guidance Scale:{" "}
          <span className="font-bold text-blue-400">{guidance}</span>
        </label>
        <input
          id={`guidance-${scene.id}`}
          type="range"
          min="1"
          max="20"
          value={guidance}
          onChange={handleGuidanceChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-1"
        />
      </div>

      <div className="p-3 bg-gray-800 rounded-md border border-gray-700 space-y-3">
        <h5 className="text-sm font-semibold text-gray-200 mb-2">고급 옵션</h5>
        <div>
          <label className="block text-xs font-medium text-gray-400">
            Guidance Scale:{" "}
            <span className="font-bold text-blue-400">{guidance}</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={guidance}
            onChange={(e) =>
              handleSceneValueChange(
                "guidance_scale",
                parseInt(e.target.value, 10)
              )
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400">
            Negative Prompt
          </label>
          <textarea
            value={negative_prompt}
            onChange={(e) =>
              handleSceneValueChange("negative_prompt", e.target.value)
            }
            rows={2}
            className="w-full text-sm bg-gray-700 border border-gray-600 rounded-md p-1 mt-1"
          />
        </div>
      </div>

      {/* ControlNet 구성 패널 */}
      <div>
        <h4 className="text-md font-semibold text-white mb-3">ControlNets</h4>
        <div className="space-y-4">
          {activeControlNets.map((cn, index) => {
            const info = availableControlNets.find(
              (info) => info.preprocessorId === cn.preprocessorId
            );
            return (
              <div
                key={index}
                className="bg-gray-800 p-3 rounded-md border border-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-sm text-blue-300">
                    {info?.name || `ID: ${cn.preprocessorId}`}
                  </p>
                  <button
                    onClick={() => handleRemoveControlNet(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    &times; 제거
                  </button>
                </div>
                <div>
                  <label className="text-xs text-gray-400">
                    참조 이미지 ID
                  </label>
                  <input
                    type="text"
                    placeholder="이미지 ID 입력"
                    value={cn.initImageId || ""}
                    onChange={(e) =>
                      handleControlNetChange(
                        index,
                        "initImageId",
                        e.target.value
                      )
                    }
                    className="w-full text-sm bg-gray-700 border border-gray-600 rounded-md p-1 mt-1"
                  />
                </div>
                <div className="mt-2">
                  <label className="text-xs text-gray-400">
                    강도 (Weight): {cn.weight}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={cn.weight}
                    onChange={(e) =>
                      handleControlNetChange(
                        index,
                        "weight",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <select
            onChange={handleAddControlNet}
            value=""
            className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md p-2 focus:ring-blue-500"
          >
            <option value="">+ ControlNet 추가...</option>
            {availableControlNets.map((cn) => (
              <option key={cn.preprocessorId} value={cn.preprocessorId}>
                {cn.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Elements 구성 패널 */}
      <div>
        <h4 className="text-md font-semibold text-white mb-3">
          Elements (LoRA)
        </h4>
        <p className="text-xs text-gray-500 mb-2">
          학습된 캐릭터/스타일 모델을 적용합니다. 프롬프트에 트리거 단어를 함께
          사용해야 합니다.
        </p>
        <div className="space-y-4">
          {activeElements.map((el, index) => (
            <div
              key={index}
              className="bg-gray-800 p-3 rounded-md border border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-sm text-green-300">
                  Custom Element #{index + 1}
                </p>
                <button
                  onClick={() => handleRemoveElement(index)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  &times; 제거
                </button>
              </div>
              <div>
                <label className="text-xs text-gray-400">Element ID</label>
                <input
                  type="text"
                  placeholder="학습된 Element ID 입력"
                  value={el.id || ""}
                  onChange={(e) =>
                    handleElementChange(index, "id", e.target.value)
                  }
                  className="w-full text-sm bg-gray-700 border border-gray-600 rounded-md p-1 mt-1"
                />
              </div>
              <div className="mt-2">
                <label className="text-xs text-gray-400">
                  가중치 (Weight): {el.weight}
                </label>
                <input
                  type="range"
                  min="-1"
                  max="2"
                  step="0.05"
                  value={el.weight}
                  onChange={(e) =>
                    handleElementChange(
                      index,
                      "weight",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-1"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddElement}
          className="mt-4 w-full bg-green-800 hover:bg-green-700 text-white text-sm rounded-md p-2"
        >
          + Element 추가
        </button>
      </div>
    </div>
  );
};

export default SceneSettingsPanel;
