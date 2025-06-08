import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useProjectStore from '../store/projectStore';
import axios from 'axios';
import SceneCard from '../components/SceneCard'
import SettingsModal from '../components/SettingsModal'

const StoryEditorPage = () => {
  const { projectId } = useParams();
  const { scenes, updateSceneOrder, loading, error } = useProjectStore(state => ({
    scenes: state.scenes,
    updateSceneOrder: state.updateSceneOrder,
    loading: state.loading,
    error: state.error,
  }));
  
  const [storyId, setStoryId] = useState(null);
  const [loadingSceneId, setLoadingSceneId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 2. 모달 상태 추가

  useEffect(() => {
    const fetchStory = async () => {
      if (!projectId) return;
      useProjectStore.setState({ loading: true });
      try {
        const storiesRes = await axios.get(`/api/projects/${projectId}/stories`);
        if (storiesRes.data.length > 0) {
          const firstStory = storiesRes.data[0];
          setStoryId(firstStory.id);
          const scenesRes = await axios.get(`/api/projects/${projectId}/stories/${firstStory.id}/scenes`);
          useProjectStore.setState({ scenes: scenesRes.data });
        } else {
          useProjectStore.setState({ scenes: [] });
        }
      } catch (err) {
        useProjectStore.setState({ error: '스토리를 불러오는데 실패했습니다.' });
        console.error(err);
      } finally {
        useProjectStore.setState({ loading: false });
      }
    };
    fetchStory();
  }, [projectId]);

// 3. 스토리 생성 로직을 모달의 onSubmit 핸들러로 변경
  const handleGenerateStory = async ({ topic, platform }) => {
    setIsModalOpen(false); // 모달 닫기
    useProjectStore.setState({ loading: true, scenes: [] }); // 로딩 시작 및 기존 씬 초기화
    try {
      const response = await axios.post(`/api/projects/${projectId}/story`, { topic, platform });
      const { storyId: newStoryId, scenes: newScenes } = response.data;
      setStoryId(newStoryId);
      useProjectStore.setState({ scenes: newScenes });
    } catch (err) {
      alert("스토리 생성에 실패했습니다.");
      useProjectStore.setState({ error: '스토리 생성에 실패했습니다.' });
      console.error(err);
    } finally {
      useProjectStore.setState({ loading: false });
    }
  };

  return (
    <div>
      <SettingsModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerateStory}
        isLoading={loading}
      />

      <Link to="/" className="text-blue-400 hover:underline mb-6 inline-block">&larr; Back to Dashboard</Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Story Editor</h1>
        <button 
          onClick={() => setIsModalOpen(true)} // 4. 버튼 클릭 시 모달 열기
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate Story with AI
        </button>
      </div>
      
      {loading && scenes.length === 0 && <p>스토리 로딩/생성 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && scenes.length === 0 && !error && (
        <div className="text-center py-10">
          <p>생성된 스토리가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">버튼을 눌러 AI로 새로운 스토리를 생성해보세요.</p>
        </div>
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