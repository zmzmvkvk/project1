import { create } from "zustand";
import axios from "axios";

const useProjectStore = create((set, get) => ({
  projects: [],
  loading: false,
  error: null,
  scenes: [],
  loadingSceneId: null,
  currentProjectId: null,
  currentStoryId: null,
  currentProject: null, // 현재 프로젝트의 모든 정보를 담을 상태

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

  fetchProject: async (projectId) => {
    try {
      // 이 액션은 스토어에 프로젝트 정보가 없을 때를 대비하여 개별 프로젝트를 불러옵니다.
      const response = await axios.get(`/api/projects/${projectId}`);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? response.data : p
        ),
      }));
    } catch (error) {
      console.error("Failed to fetch project:", error);
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

  updateProject: async (projectId, settings) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}`, settings);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? response.data : p
        ),
      }));
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  },

  fetchStory: async (projectId) => {
    set({
      loading: true,
      error: null,
      scenes: [],
      currentProjectId: projectId,
      currentStoryId: null,
      currentProject: null,
    });
    try {
      // 1. 프로젝트 전체 정보(설정값 포함)를 불러와 스토어에 저장
      const projectResponse = await axios.get(`/api/projects/${projectId}`);
      set({ currentProject: projectResponse.data });

      // 2. 기존 로직 실행
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

  generateStory: async (projectId, settings) => {
    set({ loading: true, error: null });
    try {
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

  updateScene: (sceneId, updatedData) => {
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, ...updatedData } : scene
      ),
    }));
  },

  updateSceneOrder: (newScenes) => {
    const orderedScenes = newScenes.map((scene, index) => ({
      ...scene,
      order: index + 1,
    }));
    set({ scenes: orderedScenes });
  },

  generateImageForScene: async (sceneId, settings = {}) => {
    const { currentProjectId, currentStoryId, scenes, currentProject } = get();
    const sceneToGenerate = scenes.find((s) => s.id === sceneId);

    if (!currentProjectId || !currentStoryId || !sceneToGenerate) {
      const errorMsg = "이미지 생성을 위한 정보가 부족합니다.";
      set({ error: errorMsg, loadingSceneId: null });
      return;
    }

    set({ loadingSceneId: sceneId, error: null });

    // 설정 계층 적용: (1) 전역 기본값 -> (2) 씬 개별값 -> (3) 즉시 전달값
    const finalSettings = {
      guidance_scale: currentProject?.defaultGuidanceScale || 7,
      negative_prompt: currentProject?.defaultNegativePrompt || "",
      ...sceneToGenerate,
      ...settings,
    };

    if (finalSettings.controlnets?.length === 0)
      delete finalSettings.controlnets;
    if (finalSettings.elements?.length === 0) delete finalSettings.elements;

    try {
      const response = await axios.post(
        `/api/projects/scenes/${sceneId}/generate-image`,
        {
          projectId: currentProjectId,
          storyId: currentStoryId,
          settings: finalSettings,
        }
      );

      get().updateScene(sceneId, response.data);
      set({ loadingSceneId: null });
    } catch (error) {
      console.error("Failed to generate image:", error);
      set({ error: "이미지 생성에 실패했습니다.", loadingSceneId: null });
    }
  },
}));

export default useProjectStore;
