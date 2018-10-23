import * as line from '@line/bot-sdk';

export const textMessageTemplate = (message: string): line.TextMessage => {
  return {
    type: 'text',
    text: message,
  };
};

export const imageMessageTemplate = (imageUrl: string): line.ImageMessage => {
  return {
    type: 'image',
    originalContentUrl: imageUrl,
    previewImageUrl: imageUrl,
  };
};

export const videoMessageTemplate = (
  imageUrl: string,
  videoUrl: string,
): line.VideoMessage => {
  return {
    type: 'video',
    originalContentUrl: videoUrl,
    previewImageUrl: imageUrl,
  };
};
