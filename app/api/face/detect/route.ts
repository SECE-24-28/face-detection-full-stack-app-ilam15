import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';
import { uploadImage } from '../../../../lib/cloudinary';
import { detectFace, analyzeFace } from '../../../../lib/facepp';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get current user if authenticated
    const user = await getUserFromRequest(req);
    const userId = user ? user.id : null;

    // 1. Upload the image (Cloudinary or local fallback)
    let imageUrl: string;
    try {
      imageUrl = await uploadImage(buffer, file.name);
    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // 2. Detect face in the image
    const detectRes = await detectFace(buffer);
    if (!detectRes.faces || detectRes.faces.length === 0) {
      return NextResponse.json(
        { error: 'No faces detected in the image. Please try another photo.' },
        { status: 400 }
      );
    }

    // Use the primary face (first detected)
    const primaryFace = detectRes.faces[0];
    const faceToken = primaryFace.face_token;
    const faceRect = primaryFace.face_rectangle;

    // 3. Analyze face details
    const analyzeRes = await analyzeFace(faceToken, faceRect);
    if (!analyzeRes.faces || analyzeRes.faces.length === 0) {
      return NextResponse.json(
        { error: 'Failed to analyze the face details.' },
        { status: 500 }
      );
    }

    const analyzedFace = analyzeRes.faces[0];
    const attrs = analyzedFace.attributes;
    const landmarks = analyzedFace.landmark || {};

    if (!attrs) {
      return NextResponse.json(
        { error: 'Face attributes analysis not available.' },
        { status: 500 }
      );
    }

    // 4. Save to Database
    const scan = await prisma.faceScan.create({
      data: {
        userId,
        imageUrl,
        faceToken: faceToken,
        age: attrs.age?.value || 0,
        gender: attrs.gender?.value || 'Unknown',
        smile: attrs.smiling?.value || 0,
        emotion: attrs.emotion || {},
        beautyScore: attrs.beauty || {},
        skinStatus: attrs.skinstatus || {},
        eyeStatus: attrs.eyestatus || {},
        mouthStatus: attrs.mouthstatus || {},
        headPose: attrs.headpose || {},
        landmarks: landmarks,
        faceRectangle: faceRect,
      },
    });

    return NextResponse.json({
      message: 'Face analyzed successfully',
      scan,
    });
  } catch (error) {
    console.error('Face detect API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during face analysis' },
      { status: 500 }
    );
  }
}
