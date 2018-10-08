
import * as line from '@line/bot-sdk';

export const textMessageTemplate = (message: string): line.TextMessage => {
  return {
    type: 'text',
    text: message,
  };
};
