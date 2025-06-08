import { create } from 'zustand';
import axios from 'axios';

const useProjectStore = create((set, get) => ({
  // 상태 (State)
  projects: [],
  loading: false,
  error: null,
  scenes: [],
  loadingSceneId: null, // 개별 씬의 이미지 생성 로딩 상태
  currentProjectId: null, // 현재 보고 있는 프로젝트 ID
  currentStoryId: null, // 현재 보고 있는 스토리 ID

  // 액션 (Actions)
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/projects');
      set({ projects: response.data, loading: false });
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      set({ error: '프로젝트를 불러오는데 실패했습니다.', loading: false });
    }
  },

  addProject: async (projectName) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/projects', { name: projectName });
      set((state) => ({
        projects: [...state.projects, response.data],
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to add project:", error);
      set({ error: '프로젝트를 추가하는데 실패했습니다.', loading: false });
    }
  },

  fetchStory: async (projectId) => {
    set({ loading: true, error: null, scenes: [], currentProjectId: projectId, currentStoryId: null });
    try {
      // 프로젝트의 모든 스토리 목록을 가져옵니다.
      const storiesResponse = await axios.get(`/api/projects/${projectId}/stories`);
      
      if (storiesResponse.data && storiesResponse.data.length > 0) {
        // 기획에 따라 가장 최신 스토리(주로 첫 번째)를 사용합니다.
        const firstStory = storiesResponse.data[0];
        set({ currentStoryId: firstStory.id });
        const scenesResponse = await axios.get(`/api/projects/${projectId}/stories/${firstStory.id}/scenes`);
        set({ scenes: scenesResponse.data, loading: false });
      } else {
        set({ scenes: [], loading: false });
      }
    } catch (error) {
      console.error("Failed to fetch story:", error);
      set({ error: '스토리를 불러오는데 실패했습니다.', loading: false });
    }
  },
  
  generateStory: async (projectId, topic, platform = 'youtube') => {
    set({ loading: true, error: null });
    try {
      // 백엔드의 AI 스토리 생성 엔드포인트를 호출합니다.
      const response = await axios.post(`/api/projects/${projectId}/story`, { topic, platform });
      set({
        scenes: response.data.scenes,
        currentStoryId: response.data.storyId,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to generate story:", err);
      set({ error: '스토리 생성에 실패했습니다.', loading: false });
      throw err; // 컴포넌트에서 추가적인 에러 처리를 할 수 있도록 다시 던집니다.
    }
  },
  
  updateSceneOrder: (newScenes) => {
    // 순서가 반영된 새로운 씬 배열을 만듭니다.
    const orderedScenes = newScenes.map((scene, index) => ({ ...scene, order: index + 1 }));
    
    // UI를 즉시 업데이트 (Optimistic Update)
    set({ scenes: orderedScenes });
    
    // TODO: 백엔드에 변경된 순서를 저장하는 API 호출을 구현해야 합니다.
    // const { currentProjectId, currentStoryId } = get();
    // try {
    //   await axios.put(`/api/projects/${currentProjectId}/stories/${currentStoryId}/scenes/reorder`, { scenes: orderedScenes });
    // } catch (error) {
    //   console.error("Failed to save scene order:", error);
    //   // 에러 발생 시 원래 순서로 되돌리는 로직을 추가할 수 있습니다.
    // }
  },
  
  generateImageForScene: async (sceneId) => {
        const { currentProjectId, currentStoryId } = get();
        if (!currentProjectId || !currentStoryId) {
            const errorMsg = '이미지 생성을 위해 프로젝트와 스토리가 먼저 선택되어야 합니다.';
            set({ error: errorMsg, loadingSceneId: null });
            console.error(errorMsg);
            return;
        }

        set({ loadingSceneId: sceneId, error: null });
        try {
            // 백엔드의 AI 이미지 생성 엔드포인트를 호출합니다.
            const response = await axios.post(`/api/projects/scenes/${sceneId}/generate-image`, {
                projectId: currentProjectId,
                storyId: currentStoryId,
            });
            const updatedScene = response.data;
            
            // 상태를 업데이트하여 생성된 이미지를 반영합니다.
            set(state => ({
                scenes: state.scenes.map(s => s.id === sceneId ? updatedScene : s),
                loadingSceneId: null,
            }));
            
        } catch (error) {
            console.error("Failed to generate image:", error);
            set({ error: '이미지 생성에 실패했습니다.', loadingSceneId: null });
        }
    },
}));

export default useProjectStore;