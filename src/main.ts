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
  private borderColorTopInput!: HTMLInputElement;
  private borderColorBottomInput!: HTMLInputElement;
  private borderColorLeftInput!: HTMLInputElement;
  private borderColorRightInput!: HTMLInputElement;
  private borderColorCornerInput!: HTMLInputElement;

  private generateBtn!: HTMLButtonElement;
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
    this.borderColorTopInput = document.getElementById('borderColorTop') as HTMLInputElement;
    this.borderColorBottomInput = document.getElementById('borderColorBottom') as HTMLInputElement;
    this.borderColorLeftInput = document.getElementById('borderColorLeft') as HTMLInputElement;
    this.borderColorRightInput = document.getElementById('borderColorRight') as HTMLInputElement;
    this.borderColorCornerInput = document.getElementById('borderColorCorner') as HTMLInputElement;

    // Buttons
    this.generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
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
    // Generate button
    this.generateBtn.addEventListener('click', () => this.generateTemplate());

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
    } else {
      this.detailedColorSettings.classList.add('hidden');
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

    // グリッド付きのプレビューを作成
    const previewProcessor = this.templateProcessor.clone();
    TemplateGenerator.drawGrid(previewProcessor, config);

    // キャンバスに描画
    this.renderToCanvas(previewProcessor, this.templateCanvas);
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

      // 元画像を表示（グリッド付き）
      const config = this.getConfig();
      const previewProcessor = this.originalProcessor.clone();
      TemplateGenerator.drawGrid(previewProcessor, config);
      this.renderToCanvas(previewProcessor, this.originalCanvas);

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

    // グリッド付きのプレビューを作成
    const previewProcessor = this.adjustedProcessor.clone();
    TemplateGenerator.drawGrid(previewProcessor, config);

    // 調整済み画像を表示
    this.renderToCanvas(previewProcessor, this.adjustedCanvas);

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

  private renderToCanvas(processor: ImageProcessor, canvas: HTMLCanvasElement): void {
    canvas.width = processor.getWidth();
    canvas.height = processor.getHeight();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(processor.getCanvas(), 0, 0);
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
