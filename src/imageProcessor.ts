/**
 * 画像処理の抽象化レイヤー
 * Canvas APIをラップして画像処理機能を提供
 */

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TileBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
  }

  static fromCanvas(canvas: HTMLCanvasElement): ImageProcessor {
    const processor = new ImageProcessor(canvas.width, canvas.height);
    processor.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    processor.ctx = ctx;
    return processor;
  }

  static async fromImage(image: HTMLImageElement): Promise<ImageProcessor> {
    const processor = new ImageProcessor(image.width, image.height);
    processor.ctx.drawImage(image, 0, 0);
    return processor;
  }

  static async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getWidth(): number {
    return this.canvas.width;
  }

  getHeight(): number {
    return this.canvas.height;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  fill(color: Color): void {
    this.ctx.fillStyle = this.colorToString(color);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  fillRect(rect: Rect, color: Color): void {
    this.ctx.fillStyle = this.colorToString(color);
    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  strokeRect(rect: Rect, color: Color, lineWidth: number): void {
    this.ctx.strokeStyle = this.colorToString(color);
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(
      rect.x + lineWidth / 2,
      rect.y + lineWidth / 2,
      rect.width - lineWidth,
      rect.height - lineWidth
    );
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, color: Color, lineWidth: number): void {
    this.ctx.strokeStyle = this.colorToString(color);
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  drawImage(
    source: HTMLImageElement | HTMLCanvasElement | ImageProcessor,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void {
    const img = source instanceof ImageProcessor ? source.getCanvas() : source;
    this.ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  getImageData(rect?: Rect): ImageData {
    if (rect) {
      return this.ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
    }
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  putImageData(imageData: ImageData, x: number, y: number): void {
    this.ctx.putImageData(imageData, x, y);
  }

  getPixel(x: number, y: number): Color {
    const data = this.ctx.getImageData(x, y, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], a: data[3] };
  }

  setPixel(x: number, y: number, color: Color): void {
    const imageData = this.ctx.createImageData(1, 1);
    imageData.data[0] = color.r;
    imageData.data[1] = color.g;
    imageData.data[2] = color.b;
    imageData.data[3] = color.a;
    this.ctx.putImageData(imageData, x, y);
  }

  /**
   * 指定領域内の非透明ピクセルの境界を検出
   */
  detectContentBounds(rect: Rect, alphaThreshold: number = 10): TileBounds | null {
    const imageData = this.getImageData(rect);
    const data = imageData.data;
    const width = rect.width;
    const height = rect.height;

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasContent = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > alphaThreshold) {
          hasContent = true;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasContent) {
      return null;
    }

    return { minX, minY, maxX, maxY };
  }

  /**
   * 画像をリサイズして指定位置に描画
   */
  drawResized(
    source: ImageProcessor,
    sourceRect: Rect,
    destRect: Rect
  ): void {
    this.ctx.drawImage(
      source.getCanvas(),
      sourceRect.x,
      sourceRect.y,
      sourceRect.width,
      sourceRect.height,
      destRect.x,
      destRect.y,
      destRect.width,
      destRect.height
    );
  }

  toDataURL(type: string = 'image/png'): string {
    return this.canvas.toDataURL(type);
  }

  toBlob(type: string = 'image/png'): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, type);
    });
  }

  downloadAsFile(filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.toDataURL();
    link.click();
  }

  clone(): ImageProcessor {
    const cloned = new ImageProcessor(this.canvas.width, this.canvas.height);
    cloned.ctx.drawImage(this.canvas, 0, 0);
    return cloned;
  }

  resize(width: number, height: number): ImageProcessor {
    const resized = new ImageProcessor(width, height);
    resized.ctx.drawImage(this.canvas, 0, 0, width, height);
    return resized;
  }

  private colorToString(color: Color): string {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
  }

  static hexToColor(hex: string): Color {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return { r: 0, g: 0, b: 0, a: 255 };
    }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255,
    };
  }

  static colorToHex(color: Color): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }
}
