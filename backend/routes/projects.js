const express = require('express');
const router = express.Router();
const db = require('../firebaseConfig');
const { createStoryPrompt } = require('../services/promptService');
const OpenAI = require('openai');
const axios = require('axios');

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

// [GET] /api/projects - 모든 프로젝트 목록 가져오기
router.get('/', async (req, res) => {
  try {
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// [POST] /api/projects - 새 프로젝트 생성
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send("Project name is required.");
    }
    const newProject = { name, createdAt: new Date().toISOString() };
    const projectRef = await db.collection('projects').add(newProject);
    res.status(201).json({ id: projectRef.id, ...newProject });
  } catch (error) {
    console.error("Error creating project: ", error);
    res.status(500).send("Internal Server Error");
  }
});


// [GET] /api/projects/:projectId/stories - 특정 프로젝트의 스토리 목록 가져오기
router.get('/:projectId/stories', async (req, res) => {
    try {
      const { projectId } = req.params;
      const storiesRef = db.collection('projects').doc(projectId).collection('stories');
      const snapshot = await storiesRef.orderBy('createdAt', 'desc').get();
  
      const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).send("Internal Server Error");
    }
});
  
// [GET] /api/projects/:projectId/stories/:storyId/scenes - 특정 스토리의 씬 목록 가져오기
router.get('/:projectId/stories/:storyId/scenes', async (req, res) => {
    try {
      const { projectId, storyId } = req.params;
      const scenesRef = db.collection('projects').doc(projectId).collection('stories').doc(storyId).collection('scenes');
      const snapshot = await scenesRef.orderBy('order').get();
  
      const scenes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(scenes);
    } catch (error) {
      console.error("Error fetching scenes:", error);
      res.status(500).send("Internal Server Error");
    }
});


// [POST] /api/projects/:projectId/story - AI를 사용하여 스토리 생성
router.post('/:projectId/story', async (req, res) => {
  let aiResult = '';
  try {
    const { projectId } = req.params;
    const { platform = 'youtube', topic = "A hero's unexpected journey" } = req.body;
    const prompt = createStoryPrompt(platform, topic);
    
    console.log('Sending prompt to ChatGPT...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    });
    
    aiResult = response.choices[0].message.content;
    console.log('Received raw response from ChatGPT:', aiResult);
    
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
    
    const storyRef = await db.collection('projects').doc(projectId).collection('stories').add({
      topic,
      platform,
      createdAt: new Date().toISOString(),
      status: 'draft'
    });

    const scenesCollection = storyRef.collection('scenes');
    const batch = db.batch();
    const scenesForResponse = [];

    sceneArray.forEach((scene, index) => {
      if (!scene.text) return;
      const sceneDoc = {
        text: scene.text,
        order: index + 1,
        image_url: null,
        video_url: null
      };
      const docRef = scenesCollection.doc();
      batch.set(docRef, sceneDoc);
      scenesForResponse.push({ id: docRef.id, ...sceneDoc });
    });
    
    await batch.commit();

    res.status(201).json({
      storyId: storyRef.id,
      scenes: scenesForResponse
    });

  } catch (error) {
    console.error("--- AI Story Generation Failed ---");
    console.error("Request Topic:", req.body.topic);
    console.error("ChatGPT Raw Response before error:", aiResult);
    console.error("Full Error Stack:", error);
    res.status(500).send("Internal Server Error: Failed to generate story with AI.");
  }
});


// 함수: ms 만큼 기다리는 Promise를 반환 (폴링에 사용)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// [POST] /api/scenes/:sceneId/generate-image - 특정 씬의 이미지 생성
router.post('/scenes/:sceneId/generate-image', async (req, res) => {
    try {
        const { sceneId } = req.params;
        const { storyId, projectId } = req.body; // 나중에 씬 정보에서 가져오도록 수정 가능

        // 1. Firestore에서 씬 텍스트 가져오기 (실제로는 projectId, storyId도 필요)
        const sceneRef = db.collection('projects').doc(projectId)
                           .collection('stories').doc(storyId)
                           .collection('scenes').doc(sceneId);
        const sceneDoc = await sceneRef.get();
        if (!sceneDoc.exists) {
            return res.status(404).send('Scene not found');
        }
        const sceneText = sceneDoc.data().text;

        // 2. Leonardo.AI에 이미지 생성 요청
        const generationResponse = await axios.post(
            'https://cloud.leonardo.ai/api/rest/v1/generations',
            {
                prompt: `${sceneText}, epic cinematic shot, detailed, fantasy art, high quality`,
                modelId: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3", // Leonardo Diffusion XL
                width: 1024,
                height: 576,
                num_images: 1,
            },
            {
                headers: {
                    'authorization': `Bearer ${process.env.LEONARDO_API_KEY}`
                }
            }
        );

        const generationId = generationResponse.data.sdGenerationJob.generationId;

        // 3. 생성 완료될 때까지 폴링(Polling)
        let generatedImage = null;
        for (let i = 0; i < 20; i++) { // 최대 20번 시도 (약 100초)
            await sleep(5000); // 5초 대기
            const resultResponse = await axios.get(
                `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
                { headers: { 'authorization': `Bearer ${process.env.LEONARDO_API_KEY}` } }
            );

            const generationResult = resultResponse.data.generations_by_pk;
            if (generationResult && generationResult.status === 'COMPLETE') {
                generatedImage = generationResult.generated_images[0];
                break;
            }
        }

        if (!generatedImage) {
            throw new Error('Image generation timed out or failed.');
        }

        // 4. Firestore에 이미지 URL 업데이트
        await sceneRef.update({ image_url: generatedImage.url });

        res.status(200).json({ ...sceneDoc.data(), image_url: generatedImage.url });

    } catch (error) {
        console.error("Error generating image:", error.response ? error.response.data : error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;