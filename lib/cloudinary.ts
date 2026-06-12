import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Uploads an image buffer. Attempts Cloudinary first if credentials are set,
 * otherwise falls back to writing directly to the local filesystem under public/uploads/
 */
export async function uploadImage(fileBuffer: Buffer, fileName: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      
      // Calculate signature: signature = SHA1(timestamp=xxxapi_secret)
      const stringToSign = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      const formData = new FormData();
      formData.append('file', new Blob([new Uint8Array(fileBuffer)]));
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.secure_url;
      } else {
        const errText = await response.text();
        console.error('Cloudinary API upload failed, falling back to local storage. Response:', errText);
      }
    } catch (error) {
      console.error('Cloudinary upload error, falling back to local storage:', error);
    }
  }

  // Fallback to Local Storage
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileExt = path.extname(fileName) || '.jpg';
    const uniqueName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueName);
    
    fs.writeFileSync(filePath, fileBuffer);
    return `/uploads/${uniqueName}`;
  } catch (err) {
    console.error('Failed to save file locally:', err);
    throw new Error('Image upload failed');
  }
}
