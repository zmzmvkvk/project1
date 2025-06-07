// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const db = require('./firebaseConfig'); // 이제 server.js에서 직접 db를 사용하지 않으므로 이 줄은 삭제해도 됩니다.
const projectRoutes = require('./routes/projects'); // 새로 만든 라우트 파일을 불러옵니다.

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API 라우트 ---
// '/api/projects' 경로로 오는 모든 요청은 projectRoutes에서 처리하도록 설정합니다.
app.use('/api/projects', projectRoutes);


app.get('/', (req, res) => {
  res.send('AI Animation Backend Server is Running!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});