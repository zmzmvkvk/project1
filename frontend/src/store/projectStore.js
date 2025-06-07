import { create } from 'zustand';
import axios from 'axios';

const useProjectStore = create((set) => ({
  // 상태 (State)
  projects: [],
  loading: false,
  error: null,

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
}));

export default useProjectStore;