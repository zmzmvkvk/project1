const express = require("express");
const router = express.Router();
const db = require("../firebaseConfig");
const { createStoryPrompt } = require("../services/promptService");
const OpenAI = require("openai");
const axios = require("axios");

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

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
    const settings = req.body; // { defaultGuidanceScale, defaultNegativePrompt }

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
  let aiResult = "";
  try {
    const { projectId } = req.params;
    // req.body에서 상세 설정값을 추출합니다.
    const {
      platform = "youtube",
      topic = "A hero's unexpected journey",
      character = "A brave warrior", // 주인공 설정 기본값
      leonardoModelId = "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3", // 레오나르도 모델 ID 기본값
    } = req.body;

    // promptService로 모든 설정값을 전달합니다.
    const prompt = createStoryPrompt({ platform, topic, character });

    console.log("Sending prompt to ChatGPT with settings:", {
      platform,
      topic,
      character,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    aiResult = response.choices[0].message.content;
    console.log("Received raw response from ChatGPT:", aiResult);

    const scenesData = JSON.parse(aiResult);
    let sceneArray = null;
    for (const key in scenesData) {
      if (Array.isArray(scenesData[key])) {
        sceneArray = scenesData[key];
        break;
      }
    }

    if (!sceneArray) {
      throw new Error("AI response does not contain a valid scene array.");
    }

    // 생성된 스토리를 DB에 저장
    const storyRef = await db
      .collection("projects")
      .doc(projectId)
      .collection("stories")
      .add({
        topic,
        character, // 설정값도 함께 저장
        platform,
        leonardoModelId, // 설정값도 함께 저장
        createdAt: new Date().toISOString(),
        status: "draft",
      });

    const scenesCollection = storyRef.collection("scenes");
    const batch = db.batch();
    const scenesForResponse = [];

    sceneArray.forEach((scene, index) => {
      if (!scene.text) return;
      // 각 씬의 프롬프트에는 주인공 정보를 포함시켜 일관성을 높입니다.
      const visualPrompt = `${scene.text}, character is ${character}, epic cinematic shot, detailed, fantasy art, high quality`;

      const sceneDoc = {
        text: scene.text,
        order: index + 1,
        image_url: null,
        video_url: null,
        visualPrompt: visualPrompt, // 이미지 생성을 위한 프롬프트도 저장
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
    console.error("--- AI Story Generation Failed ---");
    console.error("Request Body:", req.body);
    console.error("ChatGPT Raw Response before error:", aiResult);
    console.error("Full Error Stack:", error);
    res
      .status(500)
      .send("Internal Server Error: Failed to generate story with AI.");
  }
});

// 함수: ms 만큼 기다리는 Promise를 반환 (폴링에 사용)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// [POST] /api/scenes/:sceneId/generate-image - 특정 씬의 이미지 생성
router.post("/scenes/:sceneId/generate-image", async (req, res) => {
  try {
    const { sceneId } = req.params;
    const { projectId, storyId, settings } = req.body;

    const sceneRef = db
      .collection("projects")
      .doc(projectId)
      .collection("stories")
      .doc(storyId)
      .collection("scenes")
      .doc(sceneId);
    const sceneDoc = await sceneRef.get();
    if (!sceneDoc.exists) {
      return res.status(404).send("Scene not found");
    }
    const sceneData = sceneDoc.data();

    const promptText =
      sceneData.visualPrompt ||
      `${sceneData.text}, epic cinematic shot, detailed, fantasy art, high quality`;

    const generationPayload = {
      prompt: promptText,
      modelId: "1e60896f-3c26-4296-8ecc-53e2afecc132",
      width: 1024,
      height: 576,
      num_images: 1,
      guidance_scale: settings.guidance_scale,
      controlnets: settings.controlnets,
      elements: settings.elements,
    };

    Object.keys(generationPayload).forEach(
      (key) =>
        (generationPayload[key] === undefined ||
          generationPayload[key] === null ||
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

    if (!generatedImage) {
      throw new Error("Image generation timed out or failed.");
    }

    const finalSceneData = {
      ...sceneData,
      image_url: generatedImage.url,
      guidance_scale: settings.guidance_scale,
      controlnets: settings.controlnets,
      elements: settings.elements,
    };
    await sceneRef.update(finalSceneData);

    res.status(200).json(finalSceneData);
  } catch (error) {
    console.error(
      "Error generating image:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
