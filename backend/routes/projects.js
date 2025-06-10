const express = require("express");
const router = express.Router();
const db = require("../firebaseConfig");
const {
  createStoryPrompt,
  createImagePrompt,
} = require("../services/promptService");
const OpenAI = require("openai");
const axios = require("axios");

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
  let aiResult = "";
  try {
    const { projectId } = req.params;
    const {
      platform = "youtube",
      topic = "A hero's unexpected journey",
      character = "A brave warrior",
      characterTemplate = {},
      leonardoModelId = "1e60896f-3c26-4296-8ecc-53e2afecc132",
    } = req.body;

    const prompt = createStoryPrompt({ platform, topic, character });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    aiResult = response.choices[0].message.content;
    const scenesData = JSON.parse(aiResult);
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
        leonardoModelId,
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
        sceneSettings: null,
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

    if (!sceneDoc.exists) return res.status(404).send("Scene not found");
    if (!storyDoc.exists) return res.status(404).send("Story not found");

    const storyData = storyDoc.data();
    const sceneData = sceneDoc.data();

    let imgPrompt, videoPrompt;

    if (settings && settings.prompt) {
      imgPrompt = settings.prompt;
      videoPrompt = sceneData.videoPrompt || "Standard shot";
      console.log("Using user-provided prompt for regeneration.");
    } else {
      console.log("Generating new prompts with advanced settings...");

      // --- ★★★ 버그 수정: DB의 예전 데이터가 아닌, 프론트에서 보낸 최신 settings 값을 사용해야 합니다. ★★★
      const characterTemplate = storyData.characterTemplate || {};
      // settings 객체 안에 있는 sceneSettings를 사용합니다.
      const sceneSpecificSettings = settings.sceneSettings || {};

      const promptForPrompts = createImagePrompt(
        sceneData.text,
        characterTemplate,
        sceneSpecificSettings
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

    const sanitizedSettings = {
      guidance_scale: settings.guidance_scale || 7,
      controlnets: settings.controlnets || [],
      elements: settings.elements || [],
      negative_prompt: settings.negative_prompt || "",
    };

    const generationPayload = {
      prompt: imgPrompt,
      modelId:
        storyData.leonardoModelId || "1e60896f-3c26-4296-8ecc-53e2afecc132",
      width: 1024,
      height: 576,
      num_images: 1,
      guidance_scale: sanitizedSettings.guidance_scale,
      controlnets: sanitizedSettings.controlnets,
      elements: sanitizedSettings.elements,
      negative_prompt: sanitizedSettings.negative_prompt,
    };

    if (generationPayload.controlnets.length === 0)
      delete generationPayload.controlnets;
    if (generationPayload.elements.length === 0)
      delete generationPayload.elements;
    if (!generationPayload.negative_prompt)
      delete generationPayload.negative_prompt;

    // --- ★★★ 디버깅을 위한 로그 추가 ★★★ ---
    console.log("--- Sending to Leonardo AI --- PAYLOAD START ---");
    console.log(JSON.stringify(generationPayload, null, 2));
    console.log("--- PAYLOAD END ---");
    // --- ★★★ 디버깅 코드 끝 ★★★ ---

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
      if (
        generationResult &&
        generationResult.status === "COMPLETE" &&
        generationResult.generated_images.length > 0
      ) {
        generatedImage = generationResult.generated_images[0];
        break;
      } else if (generationResult && generationResult.status === "FAILED") {
        throw new Error("Leonardo AI image generation failed.");
      }
    }

    if (!generatedImage)
      throw new Error("Image generation timed out or failed.");

    const updatePayload = {
      image_url: generatedImage.url,
      imgPrompt: imgPrompt,
      videoPrompt: videoPrompt,
      sceneSettings: settings.sceneSettings || sceneData.sceneSettings || null,
      guidance_scale: sanitizedSettings.guidance_scale,
      controlnets: sanitizedSettings.controlnets,
      elements: sanitizedSettings.elements,
    };

    await sceneRef.update(updatePayload);

    res.status(200).json({ ...sceneData, ...updatePayload });
  } catch (error) {
    console.error("Error generating image:", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
