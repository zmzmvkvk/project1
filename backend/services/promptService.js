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
 * 계층적 설정값을 바탕으로 이미지/비디오 프롬프트를 생성하도록 요청하는 새로운 템플릿
 * @param {string} sceneText - 컨텍스트 파악을 위한 한국어 씬 텍스트
 * @param {object} characterTemplate - 의상, 헤어 등 캐릭터 전역 설정
 * @param {object} sceneSettings - 배경, 조명 등 씬 개별 설정
 * @returns {string} - ChatGPT에 보낼 프롬프트
 */
function createImagePrompt(
  sceneText,
  characterTemplate = {},
  sceneSettings = {}
) {
  // 설정 객체를 프롬프트에 주입하기 좋은 문자열로 변환
  const characterDetails = Object.entries(characterTemplate)
    .filter(([, value]) => value) // 값이 있는 항목만 필터링
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  const sceneDetails = Object.entries(sceneSettings)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  return `You are a world-class AI prompt engineer for cinematic image generation.
Your task is to synthesize information from multiple sources into a single, cohesive, and master-level prompt for an image generation AI like Leonardo AI.

**CONTEXT & HIERARCHY:**
1.  **Scene-Specific Directives (Top Priority):** These settings MUST be used and override all other context if there is a conflict. Details: [${sceneDetails}]
2.  **Character Template (Core Attributes):** This defines the character's default look. Details: [${characterDetails}]
3.  **Base Korean Scene (For Narrative Context):** Use this to understand the underlying action, emotion, and mood, especially for details not covered by the directives above. Korean Scene: "${sceneText}"

**INSTRUCTIONS:**
1.  **Synthesize:** Combine all the provided information based on the priority above.
2.  **Generate 'imgPrompt':** Create a comma-separated list of English keywords. It must be detailed and visually rich.
    - Start with quality descriptors: 'masterpiece, best quality, 8k, photorealistic, ultra-detailed'.
    - Incorporate all provided directives from the character template and scene specifics.
    - If a detail (like emotion or action) is not specified in the directives, infer the best option from the Korean scene description.
    - The final prompt should be a fluid and powerful combination of all details.
3.  **Generate 'videoPrompt':** Create a concise description for a short video clip, focusing on camera movement and rendering style.
    - Camera Movement: e.g., 'Slow dolly zoom in on the character's face', 'Fast panning shot following the action'.
    - Rendering Style: e.g., 'Rendered in Unreal Engine 5', 'Octane render', 'Pixar animation style'.
4.  **Output Format:** Your final output MUST be a single, valid JSON object with no other text or explanations.

**JSON OUTPUT STRUCTURE:**
{
  "imgPrompt": "masterpiece, 8k, photorealistic, cinematic lighting, a wise and strong lion king, standing majestically on a cliff edge, overlooking the savanna at golden hour, wind blowing through his magnificent mane, proud expression, dynamic low-angle shot",
  "videoPrompt": "Slow crane shot upwards, revealing the lion king and the vast landscape behind him. Rendered in Unreal Engine 5."
}
`;
}

module.exports = { createStoryPrompt, createImagePrompt };
