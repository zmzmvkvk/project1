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
 * 이미지 및 비디오 생성을 위한 상세 영어 프롬프트를 만들어달라고 AI에게 요청하는 프롬프트 템플릿
 * @param {string} sceneText - 한국어 씬(장면) 텍스트
 * @param {string} characterDescription - 캐릭터에 대한 영어 설명
 * @returns {string} - ChatGPT에 보낼 프롬프트
 */
function createImagePrompt(sceneText, characterDescription) {
  return `You are an expert Creative Director and Prompt Engineer for an AI video generation pipeline.
Your task is to analyze the following Korean scene description and character information, then generate a JSON object containing two distinct, detailed prompts in English: 'imgPrompt' for still image generation and 'videoPrompt' for video clip generation.

**Context:**
- Korean Scene: "${sceneText}"
- Main Character: "${characterDescription}"

**Instructions:**

1.  **Analyze the Context:** Understand the core action, emotion, and setting from the Korean text.

2.  **Generate 'imgPrompt':** Create a highly detailed, comma-separated list of keywords for an image generation AI (like Leonardo AI). This should be a masterpiece-level prompt. Include as many of the following attributes as are relevant and can be creatively inferred from the context. If an attribute is not relevant, omit it.
    * **Subject & Action:** The main character "${characterDescription}", their specific action, pose, and emotion (e.g., 'determined expression', 'crouching defensively').
    * **Character Details:** Describe body type, hairstyle, face shape, clothing style, fabric physics (e.g., 'wind-blown cape'), nail style, foot style.
    * **Composition:** Specify the camera view (e.g., 'dynamic low-angle shot', 'extreme close-up on the eyes', 'cinematic wide shot').
    * **Setting:** Describe the background, and time of day (e.g., 'golden hour', 'misty morning', 'moonlit night').
    * **Lighting:** Describe the lighting (e.g., 'dramatic cinematic lighting', 'soft rim light', 'god rays').
    * **Overall Quality:** Add keywords like 'masterpiece', 'best quality', '8k', 'photorealistic', 'epic', 'insanely detailed'.

3.  **Generate 'videoPrompt':** Create a concise description for a short video clip, focusing on motion and rendering.
    * **Camera Movement:** Describe the camera work (e.g., 'Slow dolly zoom in on the character's face', 'Fast panning shot following the action', 'Crane shot revealing the landscape').
    * **Rendering Style:** Specify a rendering engine or style (e.g., 'Rendered in Unreal Engine 5', 'Octane render', 'Pixar animation style', 'Studio Ghibli style', 'cel shading').

4.  **Output Format:** Your final output MUST be a single, valid JSON object with no other text or explanations.

**JSON Output Structure Example:**
{
  "imgPrompt": "masterpiece, 8k, photorealistic, cinematic lighting, a wise and strong lion king, standing majestically on a cliff edge, overlooking the savanna at golden hour, wind blowing through his magnificent mane, proud expression, dynamic low-angle shot",
  "videoPrompt": "Slow crane shot upwards, revealing the lion king and the vast landscape behind him. Rendered in Unreal Engine 5."
}
`;
}

module.exports = { createStoryPrompt, createImagePrompt };
