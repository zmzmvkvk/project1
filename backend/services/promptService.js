// 설정 객체를 인자로 받도록 함수 시그니처 수정
function createStoryPrompt({ platform, topic, character }) {
  let cutCount;
  let videoLengthDesc;

  switch (platform) {
    case "tiktok":
      cutCount = "15-20";
      videoLengthDesc = "65초가 넘는";
      break;
    case "instagram":
      cutCount = "20-25";
      videoLengthDesc = "60초 내외의";
      break;
    case "youtube":
    default:
      cutCount = "25-30";
      videoLengthDesc = "60초 미만의";
      break;
  }

  // 주인공(character) 설정을 프롬프트에 포함
  const prompt = `
    You are a creative writer for short-form videos.
    The main character of this story is: "${character}".
    Generate a compelling story about "${topic}" featuring this main character.
    The target platform is ${platform}, so create a script for a video that is ${videoLengthDesc}.
    Divide the story into exactly ${cutCount} scenes. Each scene's description must prominently feature or relate to the main character.
    Each scene should have a "text" field describing the visual content or action.
    The response must be a valid JSON array of objects, where each object represents a scene and has only one field: "text".
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
