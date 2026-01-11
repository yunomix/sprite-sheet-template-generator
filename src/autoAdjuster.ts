/**
 * スプライトシート自動調整機能
 * 画像生成AIが生成した画像をテンプレートに合わせて調整
 */

import { ImageProcessor, Rect } from './imageProcessor';
import { TemplateConfig, TemplateGenerator } from './templateGenerator';

export interface AdjustmentResult {
  processor: ImageProcessor;
  adjustments: TileAdjustment[];
}

export interface TileAdjustment {
  index: number;
  original: Rect;
  detected: Rect | null;
  adjusted: Rect;
  scale: { x: number; y: number };
  offset: { x: number; y: number };
}

export class AutoAdjuster {
  private config: TemplateConfig;

  constructor(config: TemplateConfig) {
    this.config = config;
  }

  /**
   * スプライトシート画像を自動調整
   */
  adjust(source: ImageProcessor): AdjustmentResult {
    const { tileSize, padding, offset } = this.config;
    const dimensions = TemplateGenerator.getDimensions(this.config);

    // 出力画像を作成
    const result = new ImageProcessor(dimensions.width, dimensions.height);
    const adjustments: TileAdjustment[] = [];

    // タイル数を取得（グリッド全体を処理）
    const cols = dimensions.cols;
    const totalTiles = dimensions.cols * dimensions.rows;

    for (let i = 0; i < totalTiles; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // テンプレート上のタイル位置
      const targetX = offset + col * (tileSize + padding);
      const targetY = offset + row * (tileSize + padding);

      const targetRect: Rect = {
        x: targetX,
        y: targetY,
        width: tileSize,
        height: tileSize,
      };

      // ソース画像からタイル領域を取得
      const sourceRect = this.estimateSourceTileRect(source, i, cols, totalTiles);

      // タイル内のコンテンツ境界を検出
      const bounds = source.detectContentBounds(sourceRect);

      let adjustment: TileAdjustment;

      if (bounds) {
        // コンテンツが検出された場合、調整を計算
        const detectedRect: Rect = {
          x: sourceRect.x + bounds.minX,
          y: sourceRect.y + bounds.minY,
          width: bounds.maxX - bounds.minX + 1,
          height: bounds.maxY - bounds.minY + 1,
        };

        // スケール計算
        const scaleX = tileSize / detectedRect.width;
        const scaleY = tileSize / detectedRect.height;

        // 均一スケールを使用（アスペクト比を維持）
        const scale = Math.min(scaleX, scaleY);

        // 中央配置のオフセット計算
        const adjustedWidth = detectedRect.width * scale;
        const adjustedHeight = detectedRect.height * scale;
        const offsetX = (tileSize - adjustedWidth) / 2;
        const offsetY = (tileSize - adjustedHeight) / 2;

        // 調整済みタイルを描画
        result.drawImage(
          source.getCanvas(),
          detectedRect.x,
          detectedRect.y,
          detectedRect.width,
          detectedRect.height,
          targetX + offsetX,
          targetY + offsetY,
          adjustedWidth,
          adjustedHeight
        );

        adjustment = {
          index: i,
          original: sourceRect,
          detected: detectedRect,
          adjusted: {
            x: targetX + offsetX,
            y: targetY + offsetY,
            width: adjustedWidth,
            height: adjustedHeight,
          },
          scale: { x: scale, y: scale },
          offset: { x: offsetX, y: offsetY },
        };
      } else {
        // コンテンツが検出されなかった場合、そのままコピー
        result.drawImage(
          source.getCanvas(),
          sourceRect.x,
          sourceRect.y,
          sourceRect.width,
          sourceRect.height,
          targetX,
          targetY,
          tileSize,
          tileSize
        );

        adjustment = {
          index: i,
          original: sourceRect,
          detected: null,
          adjusted: targetRect,
          scale: { x: 1, y: 1 },
          offset: { x: 0, y: 0 },
        };
      }

      adjustments.push(adjustment);
    }

    return { processor: result, adjustments };
  }

  /**
   * ソース画像からタイル領域を推定
   * 画像生成AIの出力は位置がずれている可能性があるので、
   * 周辺を含めて探索
   */
  private estimateSourceTileRect(
    source: ImageProcessor,
    tileIndex: number,
    cols: number,
    _totalTiles: number
  ): Rect {
    const { tileSize, padding, offset } = this.config;
    const dimensions = TemplateGenerator.getDimensions(this.config);

    // 基本的な位置計算
    const col = tileIndex % cols;
    const row = Math.floor(tileIndex / cols);

    // ソース画像のスケールを考慮
    const sourceWidth = source.getWidth();
    const sourceHeight = source.getHeight();

    // テンプレートの期待サイズ
    const expectedWidth = dimensions.width;
    const expectedHeight = dimensions.height;

    // ソース画像とテンプレートのスケール比
    const scaleX = sourceWidth / expectedWidth;
    const scaleY = sourceHeight / expectedHeight;

    // スケールを考慮したタイル位置
    const x = Math.round((offset + col * (tileSize + padding)) * scaleX);
    const y = Math.round((offset + row * (tileSize + padding)) * scaleY);
    const width = Math.round(tileSize * scaleX);
    const height = Math.round(tileSize * scaleY);

    // 境界チェック
    const clampedX = Math.max(0, Math.min(x, sourceWidth - 1));
    const clampedY = Math.max(0, Math.min(y, sourceHeight - 1));
    const clampedWidth = Math.max(1, Math.min(width, sourceWidth - clampedX));
    const clampedHeight = Math.max(1, Math.min(height, sourceHeight - clampedY));

    return {
      x: clampedX,
      y: clampedY,
      width: clampedWidth,
      height: clampedHeight,
    };
  }

  /**
   * 高度な自動調整（コンテンツ検出ベース）
   * 各タイルのコンテンツを検出し、位置とサイズを自動調整
   */
  adjustWithContentDetection(source: ImageProcessor): AdjustmentResult {
    const { tileSize, padding, offset } = this.config;
    const dimensions = TemplateGenerator.getDimensions(this.config);

    const result = new ImageProcessor(dimensions.width, dimensions.height);
    const adjustments: TileAdjustment[] = [];

    // タイル数を取得（グリッド全体を処理）
    const cols = dimensions.cols;
    const totalTiles = dimensions.cols * dimensions.rows;

    // 全タイルの平均サイズを計算（正規化用）
    const detectedSizes: { width: number; height: number }[] = [];

    // 最初のパス: 各タイルのコンテンツを検出
    for (let i = 0; i < totalTiles; i++) {
      const sourceRect = this.estimateSourceTileRect(source, i, cols, totalTiles);
      const bounds = source.detectContentBounds(sourceRect);

      if (bounds) {
        detectedSizes.push({
          width: bounds.maxX - bounds.minX + 1,
          height: bounds.maxY - bounds.minY + 1,
        });
      }
    }

    // 平均サイズを計算
    let avgWidth = tileSize;
    let avgHeight = tileSize;
    if (detectedSizes.length > 0) {
      avgWidth = detectedSizes.reduce((sum, s) => sum + s.width, 0) / detectedSizes.length;
      avgHeight = detectedSizes.reduce((sum, s) => sum + s.height, 0) / detectedSizes.length;
    }

    // 2番目のパス: 調整して描画
    for (let i = 0; i < totalTiles; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const targetX = offset + col * (tileSize + padding);
      const targetY = offset + row * (tileSize + padding);

      const targetRect: Rect = {
        x: targetX,
        y: targetY,
        width: tileSize,
        height: tileSize,
      };

      const sourceRect = this.estimateSourceTileRect(source, i, cols, totalTiles);
      const bounds = source.detectContentBounds(sourceRect);

      let adjustment: TileAdjustment;

      if (bounds) {
        const detectedRect: Rect = {
          x: sourceRect.x + bounds.minX,
          y: sourceRect.y + bounds.minY,
          width: bounds.maxX - bounds.minX + 1,
          height: bounds.maxY - bounds.minY + 1,
        };

        // 平均サイズに基づいてスケールを計算
        const baseScale = Math.min(tileSize / avgWidth, tileSize / avgHeight);
        const adjustedWidth = detectedRect.width * baseScale;
        const adjustedHeight = detectedRect.height * baseScale;

        // タイルサイズを超えないようにクリップ
        const finalWidth = Math.min(adjustedWidth, tileSize);
        const finalHeight = Math.min(adjustedHeight, tileSize);
        const finalScale = Math.min(finalWidth / detectedRect.width, finalHeight / detectedRect.height);

        const offsetX = (tileSize - detectedRect.width * finalScale) / 2;
        const offsetY = (tileSize - detectedRect.height * finalScale) / 2;

        result.drawImage(
          source.getCanvas(),
          detectedRect.x,
          detectedRect.y,
          detectedRect.width,
          detectedRect.height,
          targetX + offsetX,
          targetY + offsetY,
          detectedRect.width * finalScale,
          detectedRect.height * finalScale
        );

        adjustment = {
          index: i,
          original: sourceRect,
          detected: detectedRect,
          adjusted: {
            x: targetX + offsetX,
            y: targetY + offsetY,
            width: detectedRect.width * finalScale,
            height: detectedRect.height * finalScale,
          },
          scale: { x: finalScale, y: finalScale },
          offset: { x: offsetX, y: offsetY },
        };
      } else {
        result.drawImage(
          source.getCanvas(),
          sourceRect.x,
          sourceRect.y,
          sourceRect.width,
          sourceRect.height,
          targetX,
          targetY,
          tileSize,
          tileSize
        );

        adjustment = {
          index: i,
          original: sourceRect,
          detected: null,
          adjusted: targetRect,
          scale: { x: 1, y: 1 },
          offset: { x: 0, y: 0 },
        };
      }

      adjustments.push(adjustment);
    }

    return { processor: result, adjustments };
  }
}
