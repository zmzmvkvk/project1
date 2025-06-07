const express = require('express');
const router = express.Router();
const db = require('../firebaseConfig'); // Firebase 설정 불러오기
const { createStoryPrompt } = require('../services/promptService');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

// [GET] /api/projects/ - 모든 프로젝트 목록 가져오기
router.get('/', async (req, res) => {
  try {
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef.orderBy('createdAt', 'desc').get(); // 최신순으로 정렬

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const projects = [];
    snapshot.forEach(doc => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// [POST] /api/projects/ - 새 프로젝트 생성
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send("Project name is required.");
    }

    const newProject = {
      name: name,
      createdAt: new Date().toISOString(),
    };

    const projectRef = await db.collection('projects').add(newProject);

    res.status(201).json({
      id: projectRef.id,
      ...newProject
    });

  } catch (error) {
    console.error("Error creating project: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// [POST] /api/projects/:projectId/story - AI를 사용하여 스토리 생성
router.post('/:projectId/story', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { platform = 'youtube', topic = "A hero's unexpected journey" } = req.body;

    // 1. AI 프롬프트 생성
    const prompt = createStoryPrompt(platform, topic);
    
    // 2. ChatGPT API 호출
    console.log('Sending prompt to ChatGPT...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }, // JSON 응답 형식 지정
    });
    
    const aiResult = response.choices[0].message.content;
    console.log('Received response from ChatGPT.');

    // 3. AI 응답 파싱 및 데이터베이스 저장 준비
    // ChatGPT가 외부 키를 포함하여 JSON을 생성할 수 있으므로, 가장 바깥쪽 키의 첫 번째 배열 값을 찾습니다.
    const scenesData = JSON.parse(aiResult);
    const sceneArray = Object.values(scenesData)[0]; 

    if (!Array.isArray(sceneArray)) {
        throw new Error("AI response is not a valid scene array.");
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
      const sceneDoc = {
        text: scene.text,
        order: index + 1,
        image_url: null,
        video_url: null
      };
      const docRef = scenesCollection.doc(); // 자동 ID
      batch.set(docRef, sceneDoc);
      scenesForResponse.push({ id: docRef.id, ...sceneDoc });
    });
    
    await batch.commit();

    res.status(201).json({
      storyId: storyRef.id,
      scenes: scenesForResponse
    });

  } catch (error) {
    console.error("Error generating story with AI:", error);
    res.status(500).send("Internal Server Error");
  }
});

// [GET] /api/projects/:projectId/stories - 특정 프로젝트의 모든 스토리 목록 가져오기
router.get('/:projectId/stories', async (req, res) => {
  try {
    const { projectId } = req.params;
    const storiesRef = db.collection('projects').doc(projectId).collection('stories');
    const snapshot = await storiesRef.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).send("Internal Server Error");
  }
});

// [GET] /api/projects/:projectId/stories/:storyId/scenes - 특정 스토리의 모든 씬 목록 가져오기
router.get('/:projectId/stories/:storyId/scenes', async (req, res) => {
  try {
    const { projectId, storyId } = req.params;
    const scenesRef = db.collection('projects').doc(projectId).collection('stories').doc(storyId).collection('scenes');
    const snapshot = await scenesRef.orderBy('order').get(); // 순서대로 정렬

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const scenes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(scenes);
  } catch (error) {
    console.error("Error fetching scenes:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;