require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./firebaseConfig'); // Firebase 설정 불러오기

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API 라우트 ---

// [GET] /api/projects - 모든 프로젝트 목록 가져오기
// [POST] /api/projects - 새 프로젝트 생성
app.post('/api/projects', async (req, res) => {
  try {
    const { name } = req.body;

    // 간단한 유효성 검사
    if (!name) {
      return res.status(400).send("Project name is required.");
    }

    const newProject = {
      name: name,
      createdAt: new Date().toISOString(), // 생성 시간 기록
    };

    // Firestore 'projects' 컬렉션에 새 문서 추가
    const projectRef = await db.collection('projects').add(newProject);

    // 생성된 문서의 ID와 데이터를 함께 클라이언트에 반환
    res.status(201).json({
      id: projectRef.id,
      ...newProject
    });

  } catch (error) {
    console.error("Error creating project: ", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/', (req, res) => {
  res.send('AI Animation Backend Server is Running!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});