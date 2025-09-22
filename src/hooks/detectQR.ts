import { BrowserQRCodeReader } from '@zxing/browser';

export function detectQRCodeFromCanvas(canvas: HTMLCanvasElement): string | null {
  const reader = new BrowserQRCodeReader();

  try {    
    const result = reader.decodeFromCanvas(canvas);
    return result.getText();
  } catch (err) {
    return null;
  }
}
