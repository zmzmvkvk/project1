import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useProjectStore from '../store/projectStore';
import SceneCard from '../components/SceneCard';

const StoryEditorPage = () => {
  const { projectId } = useParams();

  // --- 수정된 부분: Zustand 상태와 액션을 개별적으로 선택하여 무한 루프 방지 ---
  // 상태(state)는 변경될 때 리렌더링을 유발하므로 필요한 것만 각각 구독합니다.
  const scenes = useProjectStore((state) => state.scenes);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);

  // 액션(action)은 참조가 안정적이므로 한 번에 가져와도 안전하지만,
  // 명확성을 위해 개별적으로 가져오는 것도 좋은 방법입니다.
  const fetchStory = useProjectStore((state) => state.fetchStory);
  const updateSceneOrder = useProjectStore((state) => state.updateSceneOrder);
  const generateStory = useProjectStore((state) => state.generateStory);
  // --- 수정 완료 ---

  useEffect(() => {
    if (projectId) {
      fetchStory(projectId);
    }
    // fetchStory 함수는 이제 안정적인 의존성이므로 무한 루프가 발생하지 않습니다.
  }, [projectId, fetchStory]);

  // 드래그 앤 드롭 완료 시 호출되는 함수
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(scenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    updateSceneOrder(items);
  };

  // AI 스토리 생성 버튼 클릭 이벤트 핸들러
  const handleGenerateStoryClick = async () => {
    const topic = window.prompt("스토리 주제를 입력하세요:", "용감한 사자가 왕이 되는 이야기");
    if (topic && projectId) {
      await generateStory(projectId, topic);
    }
  };

  return (
    <div>
      <Link to="/" className="text-blue-400 hover:underline mb-6 inline-block">&larr; Back to Dashboard</Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Story Editor</h1>
        <button
          onClick={handleGenerateStoryClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
          disabled={loading}
        >
          {loading ? '생성 중...' : 'Generate Story with AI'}
        </button>
      </div>

      {loading && scenes.length === 0 && <p className="text-center p-4">스토리 로딩 중...</p>}
      {error && <p className="text-center p-4 text-red-500">{error}</p>}

      {!loading && scenes.length === 0 && !error && (
        <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-lg">
          <p className="text-gray-400">생성된 스토리가 없습니다.</p>
          <p className="text-gray-500 mt-2">위의 'Generate Story with AI' 버튼을 눌러 새 스토리를 생성해보세요.</p>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="scenes">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {Array.isArray(scenes) && scenes.map((scene, index) => (
                <Draggable key={scene.id} draggableId={String(scene.id)} index={index}>
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