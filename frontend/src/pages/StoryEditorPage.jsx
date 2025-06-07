import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useProjectStore from '../store/projectStore';
import axios from 'axios';

const StoryEditorPage = () => {
  const { projectId } = useParams();

  // --- 무한 루프 해결: 필요한 상태와 액션을 각각 선택합니다 ---
  const scenes = useProjectStore((state) => state.scenes);
  const fetchStory = useProjectStore((state) => state.fetchStory);
  const updateSceneOrder = useProjectStore((state) => state.updateSceneOrder);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);
  // ---

  useEffect(() => {
    if (projectId) {
      fetchStory(projectId);
    }
  }, [projectId, fetchStory]); // 이제 fetchStory는 안정적인 함수 참조이므로 루프가 발생하지 않습니다.

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(scenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // 순서가 변경된 배열로 상태 업데이트
    updateSceneOrder(items.map((item, index) => ({ ...item, order: index + 1 })));
  };

  const handleGenerateStory = async () => {
      const topic = window.prompt("스토리 주제를 입력하세요:", "용감한 사자가 왕이 되는 이야기");
      if (!topic) return;
      
      useProjectStore.setState({ loading: true });
      try {
        const response = await axios.post(`/api/projects/${projectId}/story`, { topic, platform: 'youtube' });
        useProjectStore.setState({ scenes: response.data.scenes, loading: false });
      } catch (err) {
        alert("스토리 생성에 실패했습니다.");
        useProjectStore.setState({ error: '스토리 생성에 실패했습니다.', loading: false });
        console.error(err);
      }
  };

  return (
    <div>
      <Link to="/" className="text-blue-400 hover:underline mb-6 inline-block">&larr; Back to Dashboard</Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Story Editor</h1>
        <button 
          onClick={handleGenerateStory}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? '생성 중...' : 'Generate Story with AI'}
        </button>
      </div>
      
      {loading && scenes.length === 0 && <p>스토리 로딩 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && scenes.length === 0 && !error && (
        <p>생성된 스토리가 없습니다. 버튼을 눌러 AI로 스토리를 생성해보세요.</p>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="scenes">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {Array.isArray(scenes) && scenes.map((scene, index) => (
                <Draggable key={scene.id} draggableId={scene.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-gray-800 p-4 rounded-lg flex items-center"
                    >
                      <span className="text-gray-500 mr-4 font-bold w-6 text-center">{scene.order}</span>
                      <p>{scene.text}</p>
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