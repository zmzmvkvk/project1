import { create } from 'zustand';
import axios from 'axios';

const useProjectStore = create((set) => ({
  // 상태 (State)
  projects: [],
  loading: false,
  error: null,
    currentProject: null,
  scenes: [],

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
      // 기존 projects 배열에 새로 생성된 프로젝트 추가
      set((state) => ({
        projects: [...state.projects, response.data],
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to add project:", error);
      set({ error: '프로젝트를 추가하는데 실패했습니다.', loading: false });
    }
  },
  // 특정 프로젝트의 첫 번째 스토리를 불러오는 액션
  fetchStory: async (projectId) => {
    set({ loading: true, error: null, scenes: [] });
    try {
      const storiesResponse = await axios.get(`/api/projects/${projectId}/stories`);
      
      if (storiesResponse.data && storiesResponse.data.length > 0) {
        // 가장 최신 스토리(첫 번째)의 씬들을 가져옵니다.
        const firstStory = storiesResponse.data[0];
        const scenesResponse = await axios.get(`/api/projects/${projectId}/stories/${firstStory.id}/scenes`);
        set({ scenes: scenesResponse.data, loading: false });
      } else {
        // 스토리가 없으면 빈 배열로 상태를 업데이트하고 로딩을 종료합니다.
        set({ scenes: [], loading: false });
      }
    } catch (error) {
       console.error("Failed to fetch story:", error);
       set({ error: '스토리를 불러오는데 실패했습니다.', loading: false });
    }
  },
  
  // 씬 순서를 업데이트하는 액션
  updateSceneOrder: (newScenes) => {
    // 먼저 UI를 즉시 업데이트 (Optimistic Update)
    set({ scenes: newScenes });
    
    // (나중에 구현) 백엔드에 변경된 순서를 저장하는 API 호출
    // const projectId = get().currentProject.id;
    // const storyId = ...;
    // await axios.patch(`/api/projects/${projectId}/stories/${storyId}/scenes/order`, { scenes: newScenes });
  }
}));

export default useProjectStore;