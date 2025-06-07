// backend/routes/projects.js

const express = require('express');
const router = express.Router();
const db = require('../firebaseConfig'); // firebaseConfig 경로가 한 단계 올라갔으므로 '..' 추가

// [GET] /api/projects - 모든 프로젝트 목록 가져오기
router.get('/', async (req, res) => {
  try {
    const projectsSnapshot = await db.collection('projects').orderBy('createdAt', 'desc').get();
    const projects = [];
    projectsSnapshot.forEach((doc) => {
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

// [POST] /api/projects - 새 프로젝트 생성
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

module.exports = router;