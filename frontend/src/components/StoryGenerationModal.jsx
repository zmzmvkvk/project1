import React, { useState } from "react";

// 테스트용 캐릭터 데이터 정의 (이미지, 이름, AI 프롬프트용 설명)
const characterOptions = [
  {
    id: 1,
    name: "테스트 캐릭터 1",
    imageUrl:
      "https://img.freepik.com/premium-photo/a-lion-with-a-crown-of-leaves-on-his-head_974342-26150.jpg",
    description:
      "A wise and strong lion king who rules the savanna with a gentle heart.",
  },
  {
    id: 2,
    name: "테스트 캐릭터 2",
    imageUrl:
      "https://img.freepik.com/premium-photo/a-small-lion-cub-is-sitting-on-a-rock_974342-26131.jpg",
    description:
      "A young, adventurous lion cub, full of curiosity and mischief.",
  },
  {
    id: 3,
    name: "테스트 캐릭터 3",
    imageUrl:
      "https://img.freepik.com/premium-photo/a-colorful-toucan-with-a-yellow-beak-and-a-blue-eye_974342-26188.jpg",
    description:
      "A sarcastic and witty hornbill who serves as the king's advisor.",
  },
  {
    id: 4,
    name: "테스트 캐릭터 4",
    imageUrl:
      "https://img.freepik.com/premium-photo/a-warthog-with-a-mohawk-and-a-brown-background_974342-26194.jpg",
    description: "A goofy and lovable warthog who enjoys life with no worries.",
  },
];

const StoryGenerationModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [topic, setTopic] = useState("A brave lion becomes king");
  // 선택된 캐릭터의 ID를 상태로 관리, 기본값은 1
  const [selectedCharId, setSelectedCharId] = useState(1);
  const [leonardoModelId, setLeonardoModelId] = useState(
    "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3"
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // 선택된 캐릭터의 상세 설명을 찾아서 백엔드로 전달
    const selectedCharacter = characterOptions.find(
      (c) => c.id === selectedCharId
    );

    const settings = {
      topic,
      character: selectedCharacter.description, // 캐릭터 설명을 전달
      platform: "youtube",
      leonardoModelId,
    };
    onSubmit(settings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-2xl text-white shadow-xl transition-transform transform-gpu scale-100">
        <h2 className="text-2xl font-bold mb-6">AI Story Settings</h2>
        <form onSubmit={handleSubmit}>
          {/* Story Topic */}
          <div className="mb-6">
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Story Topic / Idea
            </label>
            <textarea
              id="topic"
              rows="3"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., A brave lion becomes king of the savanna"
            />
          </div>

          {/* Main Character Selection (이미지 선택 방식으로 변경) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Main Character
            </label>
            <div className="grid grid-cols-4 gap-4">
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
                    className="w-full h-32 object-cover"
                  />
                  <p className="text-center text-sm bg-gray-700 p-2 truncate">
                    {char.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Leonardo AI Options */}
          <div className="mb-8">
            <label
              htmlFor="leonardo-model"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Visual Style (Leonardo AI Model)
            </label>
            <select
              id="leonardo-model"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={leonardoModelId}
              onChange={(e) => setLeonardoModelId(e.target.value)}
            >
              <option value="6bef9f1b-29cb-40c7-b9df-32b51c1f67d3">
                Leonardo Diffusion XL (General)
              </option>
              <option value="b7aa9931-a5de-427c-99c0-3d7751508a8f">
                3D Animation Style
              </option>
              <option value="1e65f3d1-3f62-4044-b258-002d3d92a6c4">
                Anime v3
              </option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:bg-gray-500"
            >
              {loading ? "Generating..." : "Generate Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryGenerationModal;
