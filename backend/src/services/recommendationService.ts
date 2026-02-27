import type { TaskType } from '@prisma/client';

export type Recommendation = { primary: string; fallbacks: string[]; reason: string };

export const recommendProvider = (taskType: TaskType): Recommendation => {
  switch (taskType) {
    case 'TRANSCRIPTION':
      return {
        primary: 'openai',
        fallbacks: ['huggingface'],
        reason: 'Mejor precisión en transcripción y timestamps con costo controlado.'
      };
    case 'OBJECT_DETECTION':
      return {
        primary: 'google-vision',
        fallbacks: ['aws-rekognition', 'huggingface'],
        reason: 'Balance entre precisión y velocidad para detección general.'
      };
    case 'FACE_RECOGNITION':
      return {
        primary: 'aws-rekognition',
        fallbacks: ['google-vision'],
        reason: 'Optimizado para reconocimiento facial y atributos de rostros.'
      };
    default:
      return { primary: 'huggingface', fallbacks: ['openai'], reason: 'Fallback general.' };
  }
};
