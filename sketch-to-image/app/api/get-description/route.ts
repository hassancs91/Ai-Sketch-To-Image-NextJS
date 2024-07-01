import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      console.error('No image data provided');
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    console.log('Sending request to OpenAI API...');
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY);

    const headers = {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      };
    console.log('Authorization header:', headers.Authorization);


    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this sketch, focusing on the main elements and their arrangements. Provide a description that could be used as a prompt for a Stable Diffusion AI to recreate this sketch as a realistic image. The prompt should be max 3-4 sentences."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      },
      {
        headers: headers
      }
    );
    


    console.log('Received response from OpenAI API');
    return NextResponse.json({ description: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error in get-description route:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}