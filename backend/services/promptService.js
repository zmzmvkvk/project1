// 이 함수는 사용자의 요구사항에 맞춰 동적으로 프롬프트를 생성합니다.
function createStoryPrompt(platform, topic) {
  let cutCount;
  let videoLengthDesc;

  switch (platform) {
    case 'tiktok':
      cutCount = "15-20";
      videoLengthDesc = "65초가 넘는";
      break;
    case 'instagram':
      cutCount = "20-25";
      videoLengthDesc = "60초 내외의";
      break;
    case 'youtube':
    default:
      cutCount = "25-30";
      videoLengthDesc = "60초 미만의";
      break;
  }

  const prompt = `
    You are a creative writer for short-form videos.
    Generate a compelling story about "${topic}".
    The target platform is ${platform}, so create a script for a video that is ${videoLengthDesc}.
    Divide the story into exactly ${cutCount} scenes.
    Each scene should have a "text" field describing the visual content or action.
    The response must be a valid JSON array of objects, where each object represents a scene and has a "text" field.
    Do not include any introductory text or explanations outside of the JSON array itself.

    Example format:
    [
      { "text": "A lone wanderer walks across a vast, sun-drenched desert." },
      { "text": "They pull out an old, worn-out map from their bag." }
    ]
  `;

  return prompt;
}

module.exports = { createStoryPrompt };