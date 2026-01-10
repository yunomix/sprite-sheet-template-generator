/**
 * Sprite Sheet Template Generator
 * メインアプリケーション
 */

import { ImageProcessor } from './imageProcessor';
import { TemplateGenerator, TemplateConfig } from './templateGenerator';
import { AutoAdjuster } from './autoAdjuster';

class App {
  // UI Elements
  private tileFormatSelect!: HTMLSelectElement;
  private tileSizeInput!: HTMLInputElement;
  private tilePaddingInput!: HTMLInputElement;
  private tileOffsetInput!: HTMLInputElement;
  private fillColorInput!: HTMLInputElement;
  private borderColorInput!: HTMLInputElement;
  private borderWidthInput!: HTMLInputElement;

  // Detailed color settings
  private detailedColorModeCheckbox!: HTMLInputElement;
  private detailedColorSettings!: HTMLElement;
  private borderColorGroup!: HTMLElement;
  private borderColorTopInput!: HTMLInputElement;
  private borderColorBottomInput!: HTMLInputElement;
  private borderColorLeftInput!: HTMLInputElement;
  private borderColorRightInput!: HTMLInputElement;
  private borderColorCornerInput!: HTMLInputElement;

  private saveTemplateBtn!: HTMLButtonElement;
  private spriteInput!: HTMLInputElement;
  private autoAdjustBtn!: HTMLButtonElement;
  private saveAdjustedBtn!: HTMLButtonElement;

  private templateCanvas!: HTMLCanvasElement;
  private originalCanvas!: HTMLCanvasElement;
  private adjustedCanvas!: HTMLCanvasElement;

  // State
  private templateProcessor: ImageProcessor | null = null;
  private originalProcessor: ImageProcessor | null = null;
  private adjustedProcessor: ImageProcessor | null = null;

  constructor() {
    this.initElements();
    this.bindEvents();
    this.generateTemplate();
  }

  private initElements(): void {
    // Inputs
    this.tileFormatSelect = document.getElementById('tileFormat') as HTMLSelectElement;
    this.tileSizeInput = document.getElementById('tileSize') as HTMLInputElement;
    this.tilePaddingInput = document.getElementById('tilePadding') as HTMLInputElement;
    this.tileOffsetInput = document.getElementById('tileOffset') as HTMLInputElement;
    this.fillColorInput = document.getElementById('fillColor') as HTMLInputElement;
    this.borderColorInput = document.getElementById('borderColor') as HTMLInputElement;
    this.borderWidthInput = document.getElementById('borderWidth') as HTMLInputElement;

    // Detailed color settings
    this.detailedColorModeCheckbox = document.getElementById('detailedColorMode') as HTMLInputElement;
    this.detailedColorSettings = document.getElementById('detailedColorSettings') as HTMLElement;
    this.borderColorGroup = document.getElementById('borderColorGroup') as HTMLElement;
    this.borderColorTopInput = document.getElementById('borderColorTop') as HTMLInputElement;
    this.borderColorBottomInput = document.getElementById('borderColorBottom') as HTMLInputElement;
    this.borderColorLeftInput = document.getElementById('borderColorLeft') as HTMLInputElement;
    this.borderColorRightInput = document.getElementById('borderColorRight') as HTMLInputElement;
    this.borderColorCornerInput = document.getElementById('borderColorCorner') as HTMLInputElement;

    // Buttons
    this.saveTemplateBtn = document.getElementById('saveTemplateBtn') as HTMLButtonElement;
    this.spriteInput = document.getElementById('spriteInput') as HTMLInputElement;
    this.autoAdjustBtn = document.getElementById('autoAdjustBtn') as HTMLButtonElement;
    this.saveAdjustedBtn = document.getElementById('saveAdjustedBtn') as HTMLButtonElement;

    // Canvases
    this.templateCanvas = document.getElementById('templateCanvas') as HTMLCanvasElement;
    this.originalCanvas = document.getElementById('originalCanvas') as HTMLCanvasElement;
    this.adjustedCanvas = document.getElementById('adjustedCanvas') as HTMLCanvasElement;
  }

  private bindEvents(): void {
    // Save template button
    this.saveTemplateBtn.addEventListener('click', () => this.saveTemplate());

    // Sprite input
    this.spriteInput.addEventListener('change', (e) => this.loadSprite(e));

    // Auto adjust button
    this.autoAdjustBtn.addEventListener('click', () => this.autoAdjust());

    // Save adjusted button
    this.saveAdjustedBtn.addEventListener('click', () => this.saveAdjusted());

    // Detailed color mode toggle
    this.detailedColorModeCheckbox.addEventListener('change', () => {
      this.toggleDetailedColorSettings();
      this.generateTemplate();
    });

    // Real-time preview on input change
    const inputs = [
      this.tileFormatSelect,
      this.tileSizeInput,
      this.tilePaddingInput,
      this.tileOffsetInput,
      this.fillColorInput,
      this.borderColorInput,
      this.borderWidthInput,
      this.borderColorTopInput,
      this.borderColorBottomInput,
      this.borderColorLeftInput,
      this.borderColorRightInput,
      this.borderColorCornerInput,
    ];

    inputs.forEach((input) => {
      input.addEventListener('change', () => this.generateTemplate());
    });
  }

  private toggleDetailedColorSettings(): void {
    if (this.detailedColorModeCheckbox.checked) {
      this.detailedColorSettings.classList.remove('hidden');
      this.borderColorGroup.classList.add('hidden');
    } else {
      this.detailedColorSettings.classList.add('hidden');
      this.borderColorGroup.classList.remove('hidden');
    }
  }

  private getConfig(): TemplateConfig {
    const tileSize = parseInt(this.tileSizeInput.value) || 64;
    const borderWidth = parseInt(this.borderWidthInput.value) || 10;
    const detailedColorMode = this.detailedColorModeCheckbox.checked;

    const config: TemplateConfig = {
      tileFormat: parseInt(this.tileFormatSelect.value) as 16 | 47,
      tileSize: tileSize,
      padding: parseInt(this.tilePaddingInput.value) || 0,
      offset: parseInt(this.tileOffsetInput.value) || 0,
      fillColor: ImageProcessor.hexToColor(this.fillColorInput.value),
      borderColor: ImageProcessor.hexToColor(this.borderColorInput.value),
      borderWidth: Math.min(borderWidth, Math.floor(tileSize / 2)),
      detailedColorMode: detailedColorMode,
    };

    if (detailedColorMode) {
      config.detailedColors = {
        top: ImageProcessor.hexToColor(this.borderColorTopInput.value),
        bottom: ImageProcessor.hexToColor(this.borderColorBottomInput.value),
        left: ImageProcessor.hexToColor(this.borderColorLeftInput.value),
        right: ImageProcessor.hexToColor(this.borderColorRightInput.value),
        corner: ImageProcessor.hexToColor(this.borderColorCornerInput.value),
      };
    }

    return config;
  }

  private generateTemplate(): void {
    const config = this.getConfig();
    const generator = new TemplateGenerator(config);
    this.templateProcessor = generator.generate();

    // プレビュー描画（グリッド付き、範囲外は灰色）
    this.renderPreviewWithBackground(this.templateProcessor, this.templateCanvas, config);
  }

  private saveTemplate(): void {
    if (!this.templateProcessor) {
      alert('テンプレートを生成してください');
      return;
    }

    const format = this.tileFormatSelect.value;
    const filename = `sprite_template_${format}tiles.png`;
    this.templateProcessor.downloadAsFile(filename);
  }

  private async loadSprite(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      const image = await ImageProcessor.loadImage(url);
      this.originalProcessor = await ImageProcessor.fromImage(image);
      URL.revokeObjectURL(url);

      // 元画像を表示（グリッド付き、範囲外は灰色）
      const config = this.getConfig();
      this.renderPreviewWithBackground(this.originalProcessor, this.originalCanvas, config);

      // 調整済み画像をクリア
      this.adjustedProcessor = null;
      this.clearCanvas(this.adjustedCanvas);
    } catch (error) {
      console.error('Failed to load image:', error);
      alert('画像の読み込みに失敗しました');
    }
  }

  private autoAdjust(): void {
    if (!this.originalProcessor) {
      alert('スプライトシート画像を読み込んでください');
      return;
    }

    const config = this.getConfig();
    const adjuster = new AutoAdjuster(config);
    const result = adjuster.adjustWithContentDetection(this.originalProcessor);
    this.adjustedProcessor = result.processor;

    // 調整済み画像を表示（グリッド付き、範囲外は灰色）
    this.renderPreviewWithBackground(this.adjustedProcessor, this.adjustedCanvas, config);

    console.log('Adjustments:', result.adjustments);
  }

  private saveAdjusted(): void {
    if (!this.adjustedProcessor) {
      alert('自動調整を実行してください');
      return;
    }

    const format = this.tileFormatSelect.value;
    const filename = `sprite_adjusted_${format}tiles.png`;
    this.adjustedProcessor.downloadAsFile(filename);
  }

  /**
   * プレビュー用の描画（テンプレートサイズ基準、範囲外は灰色）
   */
  private renderPreviewWithBackground(
    processor: ImageProcessor,
    canvas: HTMLCanvasElement,
    config: TemplateConfig
  ): void {
    const dimensions = TemplateGenerator.getDimensions(config);
    const imageWidth = processor.getWidth();
    const imageHeight = processor.getHeight();

    // キャンバスサイズはテンプレートサイズと画像サイズの大きい方
    const canvasWidth = Math.max(dimensions.width, imageWidth);
    const canvasHeight = Math.max(dimensions.height, imageHeight);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 背景を灰色で塗りつぶし
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 画像を描画
    ctx.drawImage(processor.getCanvas(), 0, 0);

    // グリッドを画像の範囲内のみに描画
    this.drawGridOnCanvas(ctx, config, imageWidth, imageHeight);
  }

  /**
   * グリッド線をキャンバスに直接描画（画像範囲内のみ）
   */
  private drawGridOnCanvas(
    ctx: CanvasRenderingContext2D,
    config: TemplateConfig,
    imageWidth: number,
    imageHeight: number
  ): void {
    const { tileFormat, tileSize, padding, offset } = config;
    const cols = tileFormat === 16 ? 4 : 8;
    const rows = tileFormat === 16 ? 4 : 6;

    ctx.strokeStyle = 'rgba(128, 128, 128, 0.7)';
    ctx.lineWidth = 1;

    // 縦線（各タイルの左端と最後のタイルの右端）
    for (let i = 0; i <= cols; i++) {
      const x = offset + i * (tileSize + padding);
      if (x >= 0 && x <= imageWidth) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, imageHeight);
        ctx.stroke();
      }
    }

    // 横線（各タイルの上端と最後のタイルの下端）
    for (let i = 0; i <= rows; i++) {
      const y = offset + i * (tileSize + padding);
      if (y >= 0 && y <= imageHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(imageWidth, y + 0.5);
        ctx.stroke();
      }
    }
  }

  private clearCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
