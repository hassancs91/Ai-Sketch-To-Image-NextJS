import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(request: Request) {
  try {
    console.log('Received request for image generation');
    const { sketchImage, prompt } = await request.json();
    console.log('Prompt:', prompt);
    console.log('Image data length:', sketchImage.length);

    // Create a FormData instance
    const formData = new FormData();
    
    // Append the image data
    const imageBuffer = Buffer.from(sketchImage, 'base64');
    formData.append('image', imageBuffer, {
      filename: 'sketch.png',
      contentType: 'image/png',
    });

    // Append other form fields
    formData.append('prompt', prompt);
    formData.append('control_strength', '0.7');
    formData.append('output_format', 'webp');

    console.log('Sending request to Stability AI API...');
    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/control/sketch",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "Authorization": `Bearer ${process.env.STABILITY_API_KEY}`,
          "Accept": "image/*"
        },
        responseType: 'arraybuffer'  // This ensures we get the raw binary data
      }
    );

    console.log('Received response from Stability AI API');
    // Convert the binary data to a base64 string
    const base64Image = Buffer.from(response.data).toString('base64');
    return NextResponse.json({ imageUrl: `data:image/webp;base64,${base64Image}` });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
      return NextResponse.json({ error: error.response?.data || error.message }, { status: error.response?.status || 500 });
    }
    console.error('Error in generate-image route:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}