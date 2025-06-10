const express = require("express");
const router = express.Router();
const db = require("../firebaseConfig");
const {
  createStoryPrompt,
  createImagePrompt,
} = require("../services/promptService");
const OpenAI = require("openai");
const axios = require("axios");

const allModels = [
  {
    id: "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3",
    name: "Leonardo Phoenix 1.0",
    type: "phoenix",
  },
  {
    id: "b2614463-296c-462a-9586-aafdb8f00e36",
    name: "Flux Dev",
    type: "flux",
  },
  {
    id: "1dd50843-d653-4516-a8e3-f0238ee453ff",
    name: "Flux Schnell",
    type: "flux",
  },
  {
    id: "05ce0082-2d80-4a2d-8653-4d1c85e2418e",
    name: "Lucid Realism",
    type: "lucid",
  },
  {
    id: "e71a1c2f-4f80-4800-934f-2c68979d8cc8",
    name: "Leonardo Anime XL",
    type: "sdxl",
  },
  {
    id: "b24e16ff-06e3-43eb-8d33-4416c2d75876",
    name: "Leonardo Lightning XL",
    type: "sdxl",
  },
  {
    id: "16e7060a-803e-4df3-97ee-edcfa5dc9cc8",
    name: "SDXL 1.0",
    type: "sdxl",
  },
  {
    id: "aa77f04e-3eec-4034-9c07-d0f619684628",
    name: "Leonardo Kino XL",
    type: "sdxl",
  },
  {
    id: "5c232a9e-9061-4777-980a-ddc8e65647c6",
    name: "Leonardo Vision XL",
    type: "sdxl",
  },
  {
    id: "1e60896f-3c26-4296-8ecc-53e2afecc132",
    name: "Leonardo Diffusion XL",
    type: "sdxl",
  },
  {
    id: "d69c8273-6b17-4a30-a13e-d6637ae1c644",
    name: "3D Animation Style",
    type: "sdxl",
  },
  {
    id: "ac614f96-1082-45bf-be9d-757f2d31c174",
    name: "DreamShaper v7",
    type: "sdxl",
  },
];

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// [GET] /api/projects - 모든 프로젝트 목록 가져오기
router.get("/", async (req, res) => {
  try {
    const projectsRef = db.collection("projects");
    const snapshot = await projectsRef.orderBy("createdAt", "desc").get();
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// [POST] /api/projects - 새 프로젝트 생성
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send("Project name is required.");
    }
    const newProject = { name, createdAt: new Date().toISOString() };
    const projectRef = await db.collection("projects").add(newProject);
    res.status(201).json({ id: projectRef.id, ...newProject });
  } catch (error) {
    console.error("Error creating project: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// [GET] /api/projects/:projectId - 특정 프로젝트 상세 정보 가져오기
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const doc = await db.collection("projects").doc(projectId).get();
    if (!doc.exists) {
      return res.status(404).send("Project not found");
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).send("Internal Server Error");
  }
});

// [PUT] /api/projects/:projectId - 특정 프로젝트 정보 수정 (설정 업데이트)
router.put("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const settings = req.body;
    const projectRef = db.collection("projects").doc(projectId);
    await projectRef.update({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    const updatedDoc = await projectRef.get();
    res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).send("Internal Server Error");
  }
});

// [GET] /api/projects/:projectId/stories - 특정 프로젝트의 스토리 목록 가져오기
router.get("/:projectId/stories", async (req, res) => {
  try {
    const { projectId } = req.params;
    const storiesRef = db
      .collection("projects")
      .doc(projectId)
      .collection("stories");
    const snapshot = await storiesRef.orderBy("createdAt", "desc").get();

    const stories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).send("Internal Server Error");
  }
});

// [GET] /api/projects/:projectId/stories/:storyId/scenes - 특정 스토리의 씬 목록 가져오기
router.get("/:projectId/stories/:storyId/scenes", async (req, res) => {
  try {
    const { projectId, storyId } = req.params;
    const scenesRef = db
      .collection("projects")
      .doc(projectId)
      .collection("stories")
      .doc(storyId)
      .collection("scenes");
    const snapshot = await scenesRef.orderBy("order").get();

    const scenes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(scenes);
  } catch (error) {
    console.error("Error fetching scenes:", error);
    res.status(500).send("Internal Server Error");
  }
});

// [POST] /api/projects/:projectId/story - AI를 사용하여 스토리 생성
router.post("/:projectId/story", async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      topic,
      character,
      characterTemplate,
      platform,
      leonardoModelId,
      styleUUID,
      presetStyle,
    } = req.body;

    const prompt = createStoryPrompt({ platform, topic, character });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const scenesData = JSON.parse(response.choices[0].message.content);
    const sceneArray = scenesData.scenes;

    if (!Array.isArray(sceneArray)) {
      throw new Error("AI response does not contain a valid 'scenes' array.");
    }

    const storyRef = await db
      .collection("projects")
      .doc(projectId)
      .collection("stories")
      .add({
        topic,
        character,
        characterTemplate,
        platform,
        leonardoModelId, // 모델 ID 저장
        styleUUID, // Style UUID 저장
        presetStyle, // Preset Style 저장
        createdAt: new Date().toISOString(),
        status: "draft",
      });

    const scenesCollection = storyRef.collection("scenes");
    const batch = db.batch();
    const scenesForResponse = [];

    sceneArray.forEach((scene, index) => {
      const sceneDoc = {
        text: scene.text,
        order: index + 1,
        image_url: null,
        imgPrompt: null,
        videoPrompt: null,
      };
      const docRef = scenesCollection.doc();
      batch.set(docRef, sceneDoc);
      scenesForResponse.push({ id: docRef.id, ...sceneDoc });
    });

    await batch.commit();

    res.status(201).json({
      storyId: storyRef.id,
      scenes: scenesForResponse,
    });
  } catch (error) {
    console.error("Error generating story:", error);
    res.status(500).send("Internal Server Error");
  }
});

// [POST] /api/scenes/:sceneId/generate-image - 특정 씬의 이미지 생성
router.post("/scenes/:sceneId/generate-image", async (req, res) => {
  try {
    const { sceneId } = req.params;
    const { projectId, storyId, settings } = req.body;

    const storyRef = db
      .collection("projects")
      .doc(projectId)
      .collection("stories")
      .doc(storyId);
    const sceneRef = storyRef.collection("scenes").doc(sceneId);
    const [storyDoc, sceneDoc] = await Promise.all([
      storyRef.get(),
      sceneRef.get(),
    ]);

    if (!sceneDoc.exists || !storyDoc.exists) {
      return res.status(404).send("Not found");
    }

    const storyData = storyDoc.data();
    const sceneData = sceneDoc.data();
    const modelInfo = allModels.find((m) => m.id === storyData.leonardoModelId);
    let imgPrompt, videoPrompt;

    if (settings && settings.prompt) {
      imgPrompt = settings.prompt;
      videoPrompt = sceneData.videoPrompt || "Standard shot";
    } else {
      const promptForPrompts = createImagePrompt(
        sceneData.text,
        storyData.characterTemplate,
        settings.sceneSettings
      );
      const promptResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: promptForPrompts }],
        response_format: { type: "json_object" },
      });
      const generatedPrompts = JSON.parse(
        promptResponse.choices[0].message.content
      );
      imgPrompt = generatedPrompts.imgPrompt;
      videoPrompt = generatedPrompts.videoPrompt;
    }

    const generationPayload = {
      prompt: imgPrompt,
      modelId: storyData.leonardoModelId,
      width: 1024,
      height: 576,
      num_images: 1,
      guidance_scale: settings.guidance_scale || 7,
      controlnets: settings.controlnets || [],
      elements: settings.elements || [],
      negative_prompt: settings.negative_prompt || "",
    };

    if (modelInfo) {
      if (modelInfo.type === "sdxl") {
        if (storyData.presetStyle)
          generationPayload.presetStyle = storyData.presetStyle;
      } else if (["flux", "phoenix", "lucid"].includes(modelInfo.type)) {
        if (storyData.styleUUID)
          generationPayload.styleUUID = storyData.styleUUID;
      }
    }

    Object.keys(generationPayload).forEach(
      (key) =>
        (!generationPayload[key] ||
          (Array.isArray(generationPayload[key]) &&
            generationPayload[key].length === 0)) &&
        delete generationPayload[key]
    );

    const generationResponse = await axios.post(
      "https://cloud.leonardo.ai/api/rest/v1/generations",
      generationPayload,
      { headers: { authorization: `Bearer ${process.env.LEONARDO_API_KEY}` } }
    );
    const generationId = generationResponse.data.sdGenerationJob.generationId;
    let generatedImage = null;

    for (let i = 0; i < 20; i++) {
      await sleep(5000);
      const resultResponse = await axios.get(
        `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
        { headers: { authorization: `Bearer ${process.env.LEONARDO_API_KEY}` } }
      );
      const generationResult = resultResponse.data.generations_by_pk;
      if (generationResult && generationResult.status === "COMPLETE") {
        generatedImage = generationResult.generated_images[0];
        break;
      }
    }

    if (!generatedImage)
      throw new Error("Image generation timed out or failed.");

    const updatePayload = {
      image_url: generatedImage.url,
      imgPrompt,
      videoPrompt,
      sceneSettings: settings.sceneSettings || null,
      guidance_scale: settings.guidance_scale,
      controlnets: settings.controlnets || [],
      elements: settings.elements || [],
    };
    await sceneRef.update(updatePayload);

    res.status(200).json({ ...sceneData, ...updatePayload });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
