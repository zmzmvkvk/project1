import { create } from "zustand";
import axios from "axios";

const useProjectStore = create((set, get) => ({
  // ... (다른 상태 및 액션은 동일)
  projects: [],
  loading: false,
  error: null,
  scenes: [],
  loadingSceneId: null,
  currentProjectId: null,
  currentStoryId: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/api/projects");
      set({ projects: response.data, loading: false });
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      set({ error: "프로젝트를 불러오는데 실패했습니다.", loading: false });
    }
  },

  addProject: async (projectName) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post("/api/projects", { name: projectName });
      set((state) => ({
        projects: [...state.projects, response.data],
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to add project:", error);
      set({ error: "프로젝트를 추가하는데 실패했습니다.", loading: false });
    }
  },

  fetchStory: async (projectId) => {
    set({
      loading: true,
      error: null,
      scenes: [],
      currentProjectId: projectId,
      currentStoryId: null,
    });
    try {
      const storiesResponse = await axios.get(
        `/api/projects/${projectId}/stories`
      );
      if (storiesResponse.data && storiesResponse.data.length > 0) {
        const firstStory = storiesResponse.data[0];
        set({ currentStoryId: firstStory.id });
        const scenesResponse = await axios.get(
          `/api/projects/${projectId}/stories/${firstStory.id}/scenes`
        );
        set({ scenes: scenesResponse.data, loading: false });
      } else {
        set({ scenes: [], loading: false });
      }
    } catch (error) {
      console.error("Failed to fetch story:", error);
      set({ error: "스토리를 불러오는데 실패했습니다.", loading: false });
    }
  },

  // 수정된 부분: generateStory가 settings 객체를 인자로 받음
  generateStory: async (projectId, settings) => {
    set({ loading: true, error: null });
    try {
      // settings 객체를 백엔드로 전송
      const response = await axios.post(
        `/api/projects/${projectId}/story`,
        settings
      );
      set({
        scenes: response.data.scenes,
        currentStoryId: response.data.storyId,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to generate story:", err);
      set({ error: "스토리 생성에 실패했습니다.", loading: false });
      throw err;
    }
  },

  updateSceneOrder: (newScenes) => {
    const orderedScenes = newScenes.map((scene, index) => ({
      ...scene,
      order: index + 1,
    }));
    set({ scenes: orderedScenes });
    // TODO: 백엔드 API 호출 구현
  },

  generateImageForScene: async (sceneId) => {
    const { currentProjectId, currentStoryId } = get();
    if (!currentProjectId || !currentStoryId) {
      const errorMsg =
        "이미지 생성을 위해 프로젝트와 스토리가 먼저 선택되어야 합니다.";
      set({ error: errorMsg, loadingSceneId: null });
      console.error(errorMsg);
      return;
    }
    set({ loadingSceneId: sceneId, error: null });
    try {
      const response = await axios.post(
        `/api/projects/scenes/${sceneId}/generate-image`,
        {
          projectId: currentProjectId,
          storyId: currentStoryId,
        }
      );
      const updatedScene = response.data;
      set((state) => ({
        scenes: state.scenes.map((s) => (s.id === sceneId ? updatedScene : s)),
        loadingSceneId: null,
      }));
    } catch (error) {
      console.error("Failed to generate image:", error);
      set({ error: "이미지 생성에 실패했습니다.", loadingSceneId: null });
    }
  },
}));

export default useProjectStore;
