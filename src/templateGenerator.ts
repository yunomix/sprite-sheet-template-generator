/**
 * スプライトシートテンプレート生成
 */

import { ImageProcessor, Color } from './imageProcessor';

export interface TemplateConfig {
  tileFormat: 16 | 47;
  tileSize: number;
  padding: number;
  offset: number;
  fillColor: Color;
  borderColor: Color;
  borderWidth: number;
}

/**
 * タイルの接続状態を表すビットフラグ
 */
export enum TileEdge {
  NONE = 0,
  TOP = 1,
  RIGHT = 2,
  BOTTOM = 4,
  LEFT = 8,
  TOP_LEFT = 16,
  TOP_RIGHT = 32,
  BOTTOM_RIGHT = 64,
  BOTTOM_LEFT = 128,
}

/**
 * 16タイルのレイアウト定義
 * Unity TileMap用の標準的な4x4レイアウト
 */
const TILE_16_EDGES: TileEdge[] = [
  // Row 0: 外側のコーナーと辺
  TileEdge.NONE,                                      // 孤立
  TileEdge.RIGHT,                                     // 左端
  TileEdge.LEFT | TileEdge.RIGHT,                     // 横棒
  TileEdge.LEFT,                                      // 右端

  // Row 1
  TileEdge.BOTTOM,                                    // 上端
  TileEdge.BOTTOM | TileEdge.RIGHT,                   // 左上コーナー
  TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT,   // T字上
  TileEdge.BOTTOM | TileEdge.LEFT,                    // 右上コーナー

  // Row 2
  TileEdge.TOP | TileEdge.BOTTOM,                     // 縦棒
  TileEdge.TOP | TileEdge.BOTTOM | TileEdge.RIGHT,    // T字左
  TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT, // 中央
  TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT,     // T字右

  // Row 3
  TileEdge.TOP,                                       // 下端
  TileEdge.TOP | TileEdge.RIGHT,                      // 左下コーナー
  TileEdge.TOP | TileEdge.LEFT | TileEdge.RIGHT,      // T字下
  TileEdge.TOP | TileEdge.LEFT,                       // 右下コーナー
];

/**
 * 47タイルのレイアウト定義
 * 対角線の接続も含む完全なオートタイル
 */
function generate47TileEdges(): TileEdge[] {
  const edges: TileEdge[] = [];

  // 47タイルは8方向の接続を考慮
  // 基本的な4方向 + 4つのコーナー
  // ただし、コーナーは隣接する辺が両方接続されている場合のみ有効

  // Row 0: 基本的な16タイル（コーナーなし）
  for (let i = 0; i < 16; i++) {
    edges.push(TILE_16_EDGES[i]);
  }

  // Row 1-3: 内側コーナーのバリエーション
  // 左上の内側コーナー
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.BOTTOM_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.BOTTOM_LEFT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_LEFT);

  // 2つのコーナー
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_LEFT | TileEdge.TOP_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.BOTTOM_LEFT | TileEdge.BOTTOM_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_LEFT | TileEdge.BOTTOM_LEFT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_RIGHT | TileEdge.BOTTOM_RIGHT);

  // 対角のコーナー
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_LEFT | TileEdge.BOTTOM_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_RIGHT | TileEdge.BOTTOM_LEFT);

  // 3つのコーナー
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_LEFT | TileEdge.TOP_RIGHT | TileEdge.BOTTOM_LEFT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_LEFT | TileEdge.TOP_RIGHT | TileEdge.BOTTOM_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_LEFT | TileEdge.BOTTOM_LEFT | TileEdge.BOTTOM_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_RIGHT | TileEdge.BOTTOM_LEFT | TileEdge.BOTTOM_RIGHT);

  // 4つのコーナー（完全な内側タイル）
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP_LEFT | TileEdge.TOP_RIGHT | TileEdge.BOTTOM_LEFT | TileEdge.BOTTOM_RIGHT);

  // 辺+コーナーのバリエーション
  // 右辺のみ + コーナー
  edges.push(TileEdge.BOTTOM | TileEdge.RIGHT | TileEdge.BOTTOM_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.RIGHT | TileEdge.TOP_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.RIGHT | TileEdge.TOP_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.RIGHT | TileEdge.BOTTOM_RIGHT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.RIGHT | TileEdge.TOP_RIGHT | TileEdge.BOTTOM_RIGHT);

  // 左辺のみ + コーナー
  edges.push(TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.BOTTOM_LEFT);
  edges.push(TileEdge.TOP | TileEdge.LEFT | TileEdge.TOP_LEFT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.TOP_LEFT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.BOTTOM_LEFT);
  edges.push(TileEdge.TOP | TileEdge.BOTTOM | TileEdge.LEFT | TileEdge.TOP_LEFT | TileEdge.BOTTOM_LEFT);

  // 上辺 + コーナー
  edges.push(TileEdge.LEFT | TileEdge.RIGHT | TileEdge.BOTTOM | TileEdge.BOTTOM_LEFT);
  edges.push(TileEdge.LEFT | TileEdge.RIGHT | TileEdge.BOTTOM | TileEdge.BOTTOM_RIGHT);
  edges.push(TileEdge.LEFT | TileEdge.RIGHT | TileEdge.BOTTOM | TileEdge.BOTTOM_LEFT | TileEdge.BOTTOM_RIGHT);

  // 下辺 + コーナー
  edges.push(TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP | TileEdge.TOP_LEFT);
  edges.push(TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP | TileEdge.TOP_RIGHT);
  edges.push(TileEdge.LEFT | TileEdge.RIGHT | TileEdge.TOP | TileEdge.TOP_LEFT | TileEdge.TOP_RIGHT);

  return edges;
}

const TILE_47_EDGES = generate47TileEdges();

export class TemplateGenerator {
  private config: TemplateConfig;

  constructor(config: TemplateConfig) {
    this.config = config;
  }

  /**
   * テンプレート画像を生成
   */
  generate(): ImageProcessor {
    const { tileFormat, tileSize, padding, offset } = this.config;
    const edges = tileFormat === 16 ? TILE_16_EDGES : TILE_47_EDGES;

    // グリッドサイズを計算
    const cols = tileFormat === 16 ? 4 : 8;
    const rows = tileFormat === 16 ? 4 : 6;

    // キャンバスサイズを計算
    const width = offset + cols * (tileSize + padding);
    const height = offset + rows * (tileSize + padding);

    const processor = new ImageProcessor(width, height);

    // 各タイルを描画
    for (let i = 0; i < edges.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = offset + col * (tileSize + padding);
      const y = offset + row * (tileSize + padding);

      this.drawTile(processor, x, y, edges[i]);
    }

    return processor;
  }

  /**
   * 個別のタイルを描画
   */
  private drawTile(processor: ImageProcessor, x: number, y: number, edges: TileEdge): void {
    const { tileSize, fillColor, borderColor, borderWidth } = this.config;
    const ctx = processor.getContext();

    // 塗りつぶし
    processor.fillRect({ x, y, width: tileSize, height: tileSize }, fillColor);

    // 外周を描画（接続していない辺に描画）
    ctx.fillStyle = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a / 255})`;

    // 上辺
    if (!(edges & TileEdge.TOP)) {
      ctx.fillRect(x, y, tileSize, borderWidth);
    }

    // 右辺
    if (!(edges & TileEdge.RIGHT)) {
      ctx.fillRect(x + tileSize - borderWidth, y, borderWidth, tileSize);
    }

    // 下辺
    if (!(edges & TileEdge.BOTTOM)) {
      ctx.fillRect(x, y + tileSize - borderWidth, tileSize, borderWidth);
    }

    // 左辺
    if (!(edges & TileEdge.LEFT)) {
      ctx.fillRect(x, y, borderWidth, tileSize);
    }

    // コーナー（47タイルの場合のみ、内側コーナー）
    if (this.config.tileFormat === 47) {
      // 左上内側コーナー（接続されていない場合）
      if ((edges & TileEdge.TOP) && (edges & TileEdge.LEFT) && !(edges & TileEdge.TOP_LEFT)) {
        ctx.fillRect(x, y, borderWidth, borderWidth);
      }

      // 右上内側コーナー
      if ((edges & TileEdge.TOP) && (edges & TileEdge.RIGHT) && !(edges & TileEdge.TOP_RIGHT)) {
        ctx.fillRect(x + tileSize - borderWidth, y, borderWidth, borderWidth);
      }

      // 右下内側コーナー
      if ((edges & TileEdge.BOTTOM) && (edges & TileEdge.RIGHT) && !(edges & TileEdge.BOTTOM_RIGHT)) {
        ctx.fillRect(x + tileSize - borderWidth, y + tileSize - borderWidth, borderWidth, borderWidth);
      }

      // 左下内側コーナー
      if ((edges & TileEdge.BOTTOM) && (edges & TileEdge.LEFT) && !(edges & TileEdge.BOTTOM_LEFT)) {
        ctx.fillRect(x, y + tileSize - borderWidth, borderWidth, borderWidth);
      }
    }
  }

  /**
   * グリッド線を描画（プレビュー用）
   */
  static drawGrid(processor: ImageProcessor, config: TemplateConfig): void {
    const { tileFormat, tileSize, padding, offset } = config;
    const cols = tileFormat === 16 ? 4 : 8;
    const rows = tileFormat === 16 ? 4 : 6;
    const gridColor: Color = { r: 128, g: 128, b: 128, a: 180 };

    // 縦線
    for (let i = 0; i <= cols; i++) {
      const x = offset + i * (tileSize + padding) - (padding > 0 ? padding / 2 : 0);
      processor.drawLine(x, 0, x, processor.getHeight(), gridColor, 1);
    }

    // 横線
    for (let i = 0; i <= rows; i++) {
      const y = offset + i * (tileSize + padding) - (padding > 0 ? padding / 2 : 0);
      processor.drawLine(0, y, processor.getWidth(), y, gridColor, 1);
    }
  }

  /**
   * テンプレートの寸法を取得
   */
  static getDimensions(config: TemplateConfig): { width: number; height: number; cols: number; rows: number } {
    const { tileFormat, tileSize, padding, offset } = config;
    const cols = tileFormat === 16 ? 4 : 8;
    const rows = tileFormat === 16 ? 4 : 6;
    const width = offset + cols * (tileSize + padding);
    const height = offset + rows * (tileSize + padding);
    return { width, height, cols, rows };
  }
}
