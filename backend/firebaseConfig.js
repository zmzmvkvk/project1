const admin = require('firebase-admin');

// 다운로드한 서비스 계정 키 파일 경로
const serviceAccount = require('./firebase-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Firestore 데이터베이스 객체 초기화
const db = admin.firestore();

// 다른 파일에서 db 객체를 사용할 수 있도록 내보내기
module.exports = db;