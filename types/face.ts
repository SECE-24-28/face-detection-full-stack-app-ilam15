export interface FaceRectangle {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface LandmarkPoint {
  x: number;
  y: number;
}

export interface FaceAttributes {
  gender: {
    value: 'Male' | 'Female';
  };
  age: {
    value: number;
  };
  smiling: {
    value: number;
    threshold: number;
  };
  emotion: {
    anger: number;
    disgust: number;
    fear: number;
    happiness: number;
    neutral: number;
    sadness: number;
    surprise: number;
  };
  beauty: {
    male_score: number;
    female_score: number;
  };
  skinstatus: {
    health: number;
    stain: number;
    acne: number;
    dark_circle: number;
  };
  eyestatus: {
    left_eye_status: Record<string, number>;
    right_eye_status: Record<string, number>;
  };
  mouthstatus: {
    close: number;
    open_mouth_no_surgical_mask: number;
    surgical_mask_or_respirator: number;
  };
  headpose: {
    pitch_angle: number;
    roll_angle: number;
    yaw_angle: number;
  };
  facequality: {
    value: number;
    threshold: number;
  };
}

export interface FaceAnalysis {
  face_token: string;
  face_rectangle: FaceRectangle;
  attributes: FaceAttributes;
  landmark: Record<string, LandmarkPoint>;
}

export interface FaceScanModel {
  id: string;
  userId: string | null;
  imageUrl: string;
  faceToken: string;
  age: number;
  gender: string;
  smile: number;
  emotion: any; // JSON
  beautyScore: any; // JSON
  skinStatus: any; // JSON
  eyeStatus: any; // JSON
  mouthStatus: any; // JSON
  headPose: any; // JSON
  landmarks: any; // JSON
  faceRectangle: any; // JSON
  createdAt: Date;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}
