require('dotenv').config();
const express = require('express');
const cors = require('cors');
const projectRoutes = require('./routes/projects'); // 1. 라우트 파일 불러오기

const app = express();
const port = process.env.PORT || 8080;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- API 라우트 등록 ---
// 2. '/api/projects' 경로로 들어오는 모든 요청은 projectRoutes가 처리
app.use('/api/projects', projectRoutes);


// 서버 상태 확인을 위한 기본 라우트
app.get('/', (req, res) => {
  res.send('AI Animation Backend Server is Running!');
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});