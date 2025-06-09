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

  const prompt = `
    You are a creative writer for short-form videos.
    The main character of this story is: "${character}".
    Generate a compelling story about "${topic}" featuring this main character.
    The target platform is ${platform}, so create a script for a video that is ${videoLengthDesc}.
    Divide the story into exactly ${cutCount} scenes.
    
    The response must be a valid JSON object with a single key named "scenes".
    The value of the "scenes" key must be an array of objects, where each object represents a scene and has only one field: "text".
    
    IMPORTANT: The "text" field for each scene MUST be written in Korean.

    Example format:
    {
      "scenes": [
        { "text": "광활하고 햇볕이 내리쬐는 사막을 가로질러 걷는 한 명의 방랑자." },
        { "text": "그는 가방에서 낡고 닳은 지도를 꺼낸다." }
      ]
    }
  `;

  return prompt;
}

/**
 * 이미지 생성을 위한 상세 영어 프롬프트를 만들어달라고 AI에게 요청하는 프롬프트 템플릿
 * @param {string} sceneText - 한국어 씬(장면) 텍스트
 * @param {string} characterDescription - 캐릭터에 대한 영어 설명
 * @returns {string} - ChatGPT에 보낼 프롬프트
 */
function createImagePrompt(sceneText, characterDescription) {
  return `You are an expert prompt engineer for an image generation AI like Leonardo AI.
Your task is to translate the following Korean scene description and character information into a detailed, effective, and visually rich prompt in English.

The prompt should be a comma-separated list of keywords and phrases.
The main subject is "${characterDescription}".
The context for the image is the Korean scene description: "${sceneText}".

First, understand the context from the Korean text. Then, create a prompt that visually describes the scene in detail.
Include details about the subject's action, expression, the environment, lighting (e.g., cinematic lighting, soft light), and camera angle (e.g., close-up shot, wide angle).
The final output must be only the English prompt string, without any other explanations.

Example Output:
masterpiece, best quality, cinematic lighting, dramatic angle, close-up shot, ${characterDescription}, standing on a cliff, looking at the sunrise over the vast savanna, warm and golden light
`;
}

module.exports = { createStoryPrompt, createImagePrompt }; // 새로운 함수를 export에 추가
