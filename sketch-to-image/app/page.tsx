'use client';

import { useState, useRef } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import axios from 'axios';

const STYLES = [
  "Photorealistic", "Oil painting", "Watercolor", "Digital art",
  "Pencil sketch", "Anime", "Comic book", "Abstract",
  "Impressionist", "Pop art"
] as const;

type Style = typeof STYLES[number];

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<Style>(STYLES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [realisticImage, setRealisticImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => 
    setSelectedStyle(e.target.value as Style);

  const generateImage = async () => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    setRealisticImage(null);  // Clear previous image
    try {
      const sketchImage = await canvasRef.current.exportImage('png');
      const descriptionResponse = await axios.post('/api/get-description', { image: sketchImage.split(',')[1] });
      const fullDescription = `${descriptionResponse.data.description}, Style: ${selectedStyle}`;
      setDescription(fullDescription);

      const imageResponse = await axios.post('/api/generate-image', { sketchImage: sketchImage.split(',')[1], prompt: fullDescription });
      setRealisticImage(imageResponse.data.imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sketch to Realistic Image Converter</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-2">Draw your sketch</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <ReactSketchCanvas
              width="100%"
              height="400px"
              strokeWidth={3}
              strokeColor="black"
              ref={canvasRef}
              style={{cursor: 'crosshair'}}  // Set cursor to crosshair for pencil-like appearance
            />
          </div>
          <div className="flex items-center space-x-4">
  <select
    value={selectedStyle}
    onChange={handleStyleChange}
    className="flex-grow p-2 border rounded-md bg-white text-black"
  >
    {STYLES.map((style) => (
      <option key={style} value={style}>{style}</option>
    ))}
  </select>
  <button
    onClick={generateImage}
    disabled={isLoading}
    className={`px-4 py-2 rounded-md text-white ${
      isLoading 
        ? 'bg-gray-400 cursor-not-allowed' 
        : 'bg-blue-500 hover:bg-blue-600'
    }`}
  >
    {isLoading ? 'Generating...' : 'Generate Image'}
  </button>
</div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-2">Generated Image:</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden h-[400px] flex items-center justify-center bg-gray-100">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Generating image...</p>
              </div>
            ) : realisticImage ? (
              <img src={realisticImage} alt="Generated Realistic Image" className="max-w-full max-h-full object-contain" />
            ) : (
              <p className="text-gray-500">Your generated image will appear here</p>
            )}
          </div>
        </div>
      </div>
      {description && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Image Description:</h3>
          <p className="mt-2 p-4 bg-black text-white rounded-md border border-white">{description}</p>
        </div>
      )}
    </div>
  );
}