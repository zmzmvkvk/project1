import React, { useState, useEffect } from "react"; // useState 임포트
import { useParams, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useProjectStore from "../store/projectStore";
import SceneCard from "../components/SceneCard";
import StoryGenerationModal from "../components/StoryGenerationModal"; // 모달 임포트

const StoryEditorPage = () => {
  const { projectId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 표시 상태

  const scenes = useProjectStore((state) => state.scenes);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);
  const fetchStory = useProjectStore((state) => state.fetchStory);
  const updateSceneOrder = useProjectStore((state) => state.updateSceneOrder);
  const generateStory = useProjectStore((state) => state.generateStory);

  useEffect(() => {
    if (projectId) {
      fetchStory(projectId);
    }
  }, [projectId, fetchStory]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(scenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateSceneOrder(items);
  };

  // 모달에서 'Generate Story' 버튼 클릭 시 호출될 함수
  const handleGenerateStorySubmit = async (settings) => {
    if (projectId) {
      await generateStory(projectId, settings);
      setIsModalOpen(false); // 생성이 시작되면 모달을 닫습니다.
    }
  };

  return (
    <div>
      {/* 설정 모달 */}
      <StoryGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerateStorySubmit}
        loading={loading}
      />

      <Link to="/" className="text-blue-400 hover:underline mb-6 inline-block">
        &larr; Back to Dashboard
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Story Editor</h1>
        <button
          onClick={() => setIsModalOpen(true)} // 버튼 클릭 시 모달을 엽니다.
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate Story with AI
        </button>
      </div>

      {loading && scenes.length === 0 && (
        <p className="text-center p-4">스토리 로딩 중...</p>
      )}
      {error && <p className="text-center p-4 text-red-500">{error}</p>}

      {!loading && scenes.length === 0 && !error && (
        <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-lg">
          <p className="text-gray-400">생성된 스토리가 없습니다.</p>
          <p className="text-gray-500 mt-2">
            위의 'Generate Story with AI' 버튼을 눌러 새 스토리를 생성해보세요.
          </p>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="scenes">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {Array.isArray(scenes) &&
                scenes.map((scene, index) => (
                  <Draggable
                    key={scene.id}
                    draggableId={String(scene.id)}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <SceneCard scene={scene} />
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default StoryEditorPage;
