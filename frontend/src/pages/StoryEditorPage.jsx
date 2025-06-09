import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useProjectStore from "../store/projectStore";
import SceneCard from "../components/SceneCard";

const StoryEditorPage = () => {
  const { projectId } = useParams();

  // Zustand 스토어에서 필요한 상태와 액션을 개별적으로 선택
  const scenes = useProjectStore((state) => state.scenes);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);
  const fetchStory = useProjectStore((state) => state.fetchStory);
  const updateSceneOrder = useProjectStore((state) => state.updateSceneOrder);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="text-blue-400 hover:underline">
          &larr; Dashboard
        </Link>
        <h1 className="text-4xl font-bold">Story Editor</h1>
        {/* '새 스토리 생성 설정' 페이지로 이동하는 링크 */}
        <Link
          to={`/project/${projectId}/settings`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
        >
          새 스토리 생성 설정
        </Link>
      </div>

      {loading && scenes.length === 0 && (
        <p className="text-center p-4">스토리 로딩 중...</p>
      )}
      {error && <p className="text-center p-4 text-red-500">{error}</p>}

      {!loading && scenes.length === 0 && !error && (
        <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-lg">
          <p className="text-gray-400">생성된 스토리가 없습니다.</p>
          <p className="text-gray-500 mt-2">
            우측 상단의 '새 스토리 생성 설정' 버튼을 눌러 새 스토리를
            만들어보세요.
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
