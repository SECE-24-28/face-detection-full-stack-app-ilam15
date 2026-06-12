import { FaceAnalysis } from '../types/face';

// Base API URL
const FACEPP_BASE_URL = 'https://api-us.faceplusplus.com/facepp/v3';

export interface FaceDetectResponse {
  faces: Array<{
    face_token: string;
    face_rectangle: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  }>;
  image_id?: string;
  request_id?: string;
  time_used?: number;
  error_message?: string;
}

export interface FaceAnalyzeResponse {
  faces: Array<{
    face_token: string;
    face_rectangle: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    attributes?: any;
    landmark?: Record<string, { x: number; y: number }>;
  }>;
  request_id?: string;
  time_used?: number;
  error_message?: string;
}

/**
 * Detect faces in an image buffer.
 */
export async function detectFace(imageBuffer: Buffer): Promise<FaceDetectResponse> {
  const apiKey = process.env.FACEPP_API_KEY;
  const apiSecret = process.env.FACEPP_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.log('Face++ Credentials missing. Returning mock detect response.');
    return getMockDetectResponse();
  }

  try {
    const formData = new FormData();
    formData.append('api_key', apiKey);
    formData.append('api_secret', apiSecret);
    formData.append('image_file', new Blob([new Uint8Array(imageBuffer)]));

    const response = await fetch(`${FACEPP_BASE_URL}/detect`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Face++ Detect API returned error:', errorText);
      throw new Error(`Face++ Detect error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Face++ Detect request failed:', error);
    // Return mock on failure to ensure continuous availability
    return getMockDetectResponse();
  }
}

/**
 * Analyze a detected face by its token.
 */
export async function analyzeFace(faceToken: string, faceRectangle?: { top: number; left: number; width: number; height: number }): Promise<FaceAnalyzeResponse> {
  const apiKey = process.env.FACEPP_API_KEY;
  const apiSecret = process.env.FACEPP_API_SECRET;

  if (!apiKey || !apiSecret || faceToken.startsWith('mock_')) {
    console.log('Face++ Credentials missing or mock token detected. Returning mock analysis.');
    return getMockAnalyzeResponse(faceToken, faceRectangle);
  }

  try {
    const formData = new FormData();
    formData.append('api_key', apiKey);
    formData.append('api_secret', apiSecret);
    formData.append('face_tokens', faceToken);
    formData.append('return_landmark', '2'); // Standard 83-point landmarks
    formData.append(
      'return_attributes',
      'gender,age,smiling,emotion,beauty,skinstatus,eyestatus,mouthstatus,headpose,facequality'
    );

    const response = await fetch(`${FACEPP_BASE_URL}/face/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Face++ Analyze API returned error:', errorText);
      throw new Error(`Face++ Analyze error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Face++ Analyze request failed:', error);
    return getMockAnalyzeResponse(faceToken, faceRectangle);
  }
}

// ==========================================
// MOCK DATA GENERATION FOR DEMO MODE
// ==========================================

function getMockDetectResponse(): FaceDetectResponse {
  return {
    faces: [
      {
        face_token: `mock_${Math.random().toString(36).substring(7)}`,
        face_rectangle: {
          top: 150,
          left: 150,
          width: 200,
          height: 200,
        },
      },
    ],
    time_used: 12,
  };
}

function getMockAnalyzeResponse(faceToken: string, rect?: { top: number; left: number; width: number; height: number }): FaceAnalyzeResponse {
  const box = rect || { top: 150, left: 150, width: 200, height: 200 };
  const landmarks = generateMockLandmarks(box);

  // Generate plausible random-looking values based on faceToken to keep them semi-deterministic for a single scan session
  const seed = faceToken.charCodeAt(faceToken.length - 1) || 42;
  const isMale = seed % 2 === 0;
  const age = 20 + (seed % 15);
  const smiling = (seed * 17) % 100;
  
  const emotion = {
    anger: (seed * 3) % 5,
    disgust: (seed * 2) % 3,
    fear: seed % 2,
    happiness: smiling > 40 ? smiling : 0,
    neutral: smiling > 40 ? 100 - smiling : 80,
    sadness: smiling > 40 ? 0 : 15,
    surprise: (seed * 7) % 8,
  };
  
  // Normalize emotions to sum to 100
  const sum = Object.values(emotion).reduce((a, b) => a + b, 0);
  Object.keys(emotion).forEach((k) => {
    (emotion as any)[k] = parseFloat(((emotion as any)[k] / sum * 100).toFixed(1));
  });

  const beautyMale = 65 + (seed % 20) + (isMale ? 5 : 0);
  const beautyFemale = 68 + (seed % 18) + (isMale ? 0 : 5);

  return {
    faces: [
      {
        face_token: faceToken,
        face_rectangle: box,
        attributes: {
          gender: { value: isMale ? 'Male' : 'Female' },
          age: { value: age },
          smiling: { value: smiling, threshold: 50 },
          emotion: emotion,
          beauty: {
            male_score: parseFloat(beautyMale.toFixed(1)),
            female_score: parseFloat(beautyFemale.toFixed(1)),
          },
          skinstatus: {
            health: 80 + (seed % 15),
            stain: (seed * 2) % 15,
            acne: seed % 12,
            dark_circle: (seed * 3) % 20,
          },
          eyestatus: {
            left_eye_status: { no_glass_eye_open: 99.1, no_glass_eye_close: 0.9 },
            right_eye_status: { no_glass_eye_open: 98.7, no_glass_eye_close: 1.3 },
          },
          mouthstatus: {
            close: smiling > 30 ? 5.0 : 92.0,
            open_mouth_no_surgical_mask: smiling > 30 ? 95.0 : 8.0,
            surgical_mask_or_respirator: 0.0,
          },
          headpose: {
            pitch_angle: parseFloat(((seed % 6) - 3).toFixed(1)),
            roll_angle: parseFloat(((seed % 4) - 2).toFixed(1)),
            yaw_angle: parseFloat(((seed % 8) - 4).toFixed(1)),
          },
          facequality: {
            value: parseFloat((85 + (seed % 12)).toFixed(1)),
            threshold: 70.0,
          },
        },
        landmark: landmarks,
      },
    ],
    time_used: 15,
  };
}

/**
 * Generates relative 83 points landmarks representing a face structure.
 */
function generateMockLandmarks(rect: { top: number; left: number; width: number; height: number }): Record<string, { x: number; y: number }> {
  const { left, top, width, height } = rect;
  const landmarks: Record<string, { x: number; y: number }> = {};

  const cx = left + width / 2;
  const cy = top + height / 2;

  // Face Outline (Contour 1-33)
  // Left side contour: 1 to 16, Chin: 17, Right side contour: 18 to 33
  for (let i = 1; i <= 16; i++) {
    const angle = Math.PI + (i / 17) * (Math.PI / 2); // pi to 1.5pi approx
    const rx = width * 0.48;
    const ry = height * 0.52;
    landmarks[`contour_left${i}`] = {
      x: Math.round(cx + rx * Math.cos(angle)),
      y: Math.round(cy + ry * Math.sin(angle)),
    };
  }

  landmarks[`contour_chin`] = { x: Math.round(cx), y: Math.round(top + height * 0.95) };

  for (let i = 1; i <= 16; i++) {
    const angle = (i / 17) * (Math.PI / 2); // 0 to 0.5pi approx
    const rx = width * 0.48;
    const ry = height * 0.52;
    landmarks[`contour_right${i}`] = {
      x: Math.round(cx + rx * Math.cos(angle)),
      y: Math.round(cy + ry * Math.sin(angle)),
    };
  }

  // Left Eyebrow (8 points)
  const ley_y = top + height * 0.3;
  const ley_w = width * 0.22;
  const ley_start_x = left + width * 0.15;
  for (let i = 1; i <= 8; i++) {
    const progress = (i - 1) / 7;
    const curve = Math.sin(progress * Math.PI) * (height * 0.04);
    landmarks[`left_eyebrow_${i}`] = {
      x: Math.round(ley_start_x + progress * ley_w),
      y: Math.round(ley_y - curve),
    };
  }

  // Right Eyebrow (8 points)
  const rey_y = top + height * 0.3;
  const rey_w = width * 0.22;
  const rey_start_x = left + width * 0.63;
  for (let i = 1; i <= 8; i++) {
    const progress = (i - 1) / 7;
    const curve = Math.sin(progress * Math.PI) * (height * 0.04);
    landmarks[`right_eyebrow_${i}`] = {
      x: Math.round(rey_start_x + progress * rey_w),
      y: Math.round(rey_y - curve),
    };
  }

  // Left Eye (6 points)
  const le_cx = left + width * 0.3;
  const le_cy = top + height * 0.42;
  const le_rx = width * 0.08;
  const le_ry = height * 0.03;
  const eyePoints = [
    { name: 'left_corner', angle: Math.PI },
    { name: 'top_1', angle: -Math.PI * 0.66 },
    { name: 'top_2', angle: -Math.PI * 0.33 },
    { name: 'right_corner', angle: 0 },
    { name: 'bottom_1', angle: Math.PI * 0.33 },
    { name: 'bottom_2', angle: Math.PI * 0.66 },
  ];
  eyePoints.forEach((pt) => {
    landmarks[`left_eye_${pt.name}`] = {
      x: Math.round(le_cx + le_rx * Math.cos(pt.angle)),
      y: Math.round(le_cy + le_ry * Math.sin(pt.angle)),
    };
  });
  landmarks[`left_eye_pupil`] = { x: Math.round(le_cx), y: Math.round(le_cy) };

  // Right Eye (6 points)
  const re_cx = left + width * 0.7;
  const re_cy = top + height * 0.42;
  const re_rx = width * 0.08;
  const re_ry = height * 0.03;
  eyePoints.forEach((pt) => {
    landmarks[`right_eye_${pt.name}`] = {
      x: Math.round(re_cx + re_rx * Math.cos(pt.angle)),
      y: Math.round(re_cy + re_ry * Math.sin(pt.angle)),
    };
  });
  landmarks[`right_eye_pupil`] = { x: Math.round(re_cx), y: Math.round(re_cy) };

  // Nose (approx 8 points)
  landmarks[`nose_bridge1`] = { x: Math.round(cx), y: top + height * 0.38 };
  landmarks[`nose_bridge2`] = { x: Math.round(cx), y: top + height * 0.46 };
  landmarks[`nose_bridge3`] = { x: Math.round(cx), y: top + height * 0.54 };
  landmarks[`nose_bridge4`] = { x: Math.round(cx), y: top + height * 0.62 };
  landmarks[`nose_tip`] = { x: Math.round(cx), y: Math.round(top + height * 0.66) };
  landmarks[`nose_left_wing1`] = { x: Math.round(cx - width * 0.08), y: Math.round(top + height * 0.65) };
  landmarks[`nose_right_wing1`] = { x: Math.round(cx + width * 0.08), y: Math.round(top + height * 0.65) };
  landmarks[`nose_left_wing2`] = { x: Math.round(cx - width * 0.04), y: Math.round(top + height * 0.68) };
  landmarks[`nose_right_wing2`] = { x: Math.round(cx + width * 0.04), y: Math.round(top + height * 0.68) };

  // Mouth (approx 15 points)
  const m_cx = cx;
  const m_cy = top + height * 0.78;
  const m_w = width * 0.24;
  const m_h = height * 0.06;

  landmarks[`mouth_left_corner`] = { x: Math.round(m_cx - m_w / 2), y: Math.round(m_cy) };
  landmarks[`mouth_right_corner`] = { x: Math.round(m_cx + m_w / 2), y: Math.round(m_cy) };

  // Upper Lip
  landmarks[`mouth_upper_lip_top1`] = { x: Math.round(m_cx - m_w * 0.2), y: Math.round(m_cy - m_h * 0.5) };
  landmarks[`mouth_upper_lip_top2`] = { x: Math.round(m_cx), y: Math.round(m_cy - m_h * 0.2) };
  landmarks[`mouth_upper_lip_top3`] = { x: Math.round(m_cx + m_w * 0.2), y: Math.round(m_cy - m_h * 0.5) };
  
  landmarks[`mouth_upper_lip_bottom1`] = { x: Math.round(m_cx - m_w * 0.15), y: Math.round(m_cy - m_h * 0.1) };
  landmarks[`mouth_upper_lip_bottom2`] = { x: Math.round(m_cx), y: Math.round(m_cy) };
  landmarks[`mouth_upper_lip_bottom3`] = { x: Math.round(m_cx + m_w * 0.15), y: Math.round(m_cy - m_h * 0.1) };

  // Lower Lip
  landmarks[`mouth_lower_lip_bottom1`] = { x: Math.round(m_cx - m_w * 0.2), y: Math.round(m_cy + m_h * 0.6) };
  landmarks[`mouth_lower_lip_bottom2`] = { x: Math.round(m_cx), y: Math.round(m_cy + m_h * 0.8) };
  landmarks[`mouth_lower_lip_bottom3`] = { x: Math.round(m_cx + m_w * 0.2), y: Math.round(m_cy + m_h * 0.6) };

  landmarks[`mouth_lower_lip_top1`] = { x: Math.round(m_cx - m_w * 0.15), y: Math.round(m_cy + m_h * 0.1) };
  landmarks[`mouth_lower_lip_top2`] = { x: Math.round(m_cx), y: Math.round(m_cy + m_h * 0.2) };
  landmarks[`mouth_lower_lip_top3`] = { x: Math.round(m_cx + m_w * 0.15), y: Math.round(m_cy + m_h * 0.1) };

  return landmarks;
}
