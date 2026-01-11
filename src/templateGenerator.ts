/**
 * スプライトシートテンプレート生成
 */

import { ImageProcessor, Color } from './imageProcessor';

export interface DetailedBorderColors {
  top: Color;
  bottom: Color;
  left: Color;
  right: Color;
  corner: Color;
}

export interface TemplateConfig {
  tileFormat: 16 | 47 | 'platformer';
  tileSize: number;
  padding: number;
  offset: number;
  fillColor: Color;
  borderColor: Color;
  borderWidth: number;
  detailedColorMode: boolean;
  detailedColors?: DetailedBorderColors;
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

    // 横スクロールアクションゲーム用テンプレート
    if (tileFormat === 'platformer') {
      return this.generatePlatformerTemplate();
    }

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
   * 横スクロールアクションゲーム用テンプレートを生成
   * レイアウト: 7列 x 7行
   * - Row 0: 垂直な壁（床、天井、左壁、右壁）
   * - Row 1: 45度の坂道（床版）
   * - Row 2: 45度の坂道（天井版）
   * - Row 3: 1/2勾配の坂道（床版）- 2タイルで1タイル分上る
   * - Row 4: 1/2勾配の坂道（天井版）
   * - Row 5: 1/3勾配の坂道（床版）- 3タイルで1タイル分上る
   * - Row 6: 1/3勾配の坂道（天井版）
   */
  private generatePlatformerTemplate(): ImageProcessor {
    const { tileSize, padding, offset, fillColor } = this.config;
    const cols = 7;
    const rows = 7;

    const width = offset + cols * (tileSize + padding);
    const height = offset + rows * (tileSize + padding);

    const processor = new ImageProcessor(width, height);
    const ctx = processor.getContext();

    ctx.fillStyle = this.colorToStyle(fillColor);

    // Row 0: 垂直な壁（床、天井、左壁、右壁）
    this.drawPlatformerTile(processor, ctx, 0, 0, 'floor');
    this.drawPlatformerTile(processor, ctx, 1, 0, 'ceiling');
    this.drawPlatformerTile(processor, ctx, 2, 0, 'wall_left');
    this.drawPlatformerTile(processor, ctx, 3, 0, 'wall_right');

    // Row 1: 45度の坂道（床版）- 左坂、床、右坂
    this.drawPlatformerTile(processor, ctx, 0, 1, 'slope_45_up');
    this.drawPlatformerTile(processor, ctx, 1, 1, 'floor_45');
    this.drawPlatformerTile(processor, ctx, 2, 1, 'slope_45_down');

    // Row 2: 45度の坂道（天井版）
    this.drawPlatformerTile(processor, ctx, 0, 2, 'slope_45_ceiling_up');
    this.drawPlatformerTile(processor, ctx, 1, 2, 'ceiling_45');
    this.drawPlatformerTile(processor, ctx, 2, 2, 'slope_45_ceiling_down');

    // Row 3: 1/2勾配の坂道（床版）- 2タイルで上る
    // 左坂1, 左坂2, 床, 右坂2, 右坂1
    this.drawMultiTileSlope(ctx, 0, 3, tileSize, padding, offset, 2, 0, false, false); // 0→1/2
    this.drawMultiTileSlope(ctx, 1, 3, tileSize, padding, offset, 2, 1, false, false); // 1/2→1
    this.drawFloorAtFraction(ctx, 2, 3, tileSize, padding, offset, 1, false);          // 床（高さ1）
    this.drawMultiTileSlope(ctx, 3, 3, tileSize, padding, offset, 2, 1, true, false);  // 1→1/2
    this.drawMultiTileSlope(ctx, 4, 3, tileSize, padding, offset, 2, 0, true, false);  // 1/2→0

    // Row 4: 1/2勾配の坂道（天井版）
    this.drawMultiTileSlope(ctx, 0, 4, tileSize, padding, offset, 2, 0, false, true);
    this.drawMultiTileSlope(ctx, 1, 4, tileSize, padding, offset, 2, 1, false, true);
    this.drawFloorAtFraction(ctx, 2, 4, tileSize, padding, offset, 1, true);
    this.drawMultiTileSlope(ctx, 3, 4, tileSize, padding, offset, 2, 1, true, true);
    this.drawMultiTileSlope(ctx, 4, 4, tileSize, padding, offset, 2, 0, true, true);

    // Row 5: 1/3勾配の坂道（床版）- 3タイルで上る
    // 左坂1, 左坂2, 左坂3, 床, 右坂3, 右坂2, 右坂1
    this.drawMultiTileSlope(ctx, 0, 5, tileSize, padding, offset, 3, 0, false, false); // 0→1/3
    this.drawMultiTileSlope(ctx, 1, 5, tileSize, padding, offset, 3, 1, false, false); // 1/3→2/3
    this.drawMultiTileSlope(ctx, 2, 5, tileSize, padding, offset, 3, 2, false, false); // 2/3→1
    this.drawFloorAtFraction(ctx, 3, 5, tileSize, padding, offset, 1, false);          // 床（高さ1）
    this.drawMultiTileSlope(ctx, 4, 5, tileSize, padding, offset, 3, 2, true, false);  // 1→2/3
    this.drawMultiTileSlope(ctx, 5, 5, tileSize, padding, offset, 3, 1, true, false);  // 2/3→1/3
    this.drawMultiTileSlope(ctx, 6, 5, tileSize, padding, offset, 3, 0, true, false);  // 1/3→0

    // Row 6: 1/3勾配の坂道（天井版）
    this.drawMultiTileSlope(ctx, 0, 6, tileSize, padding, offset, 3, 0, false, true);
    this.drawMultiTileSlope(ctx, 1, 6, tileSize, padding, offset, 3, 1, false, true);
    this.drawMultiTileSlope(ctx, 2, 6, tileSize, padding, offset, 3, 2, false, true);
    this.drawFloorAtFraction(ctx, 3, 6, tileSize, padding, offset, 1, true);
    this.drawMultiTileSlope(ctx, 4, 6, tileSize, padding, offset, 3, 2, true, true);
    this.drawMultiTileSlope(ctx, 5, 6, tileSize, padding, offset, 3, 1, true, true);
    this.drawMultiTileSlope(ctx, 6, 6, tileSize, padding, offset, 3, 0, true, true);

    return processor;
  }

  /**
   * 複数タイルで構成される坂道の1タイルを描画
   * @param divisions 何タイルで1タイル分上るか（2 or 3）
   * @param step 何番目のタイルか（0から開始）
   * @param flipH 左右反転（下り坂）
   * @param flipV 上下反転（天井）
   */
  private drawMultiTileSlope(
    ctx: CanvasRenderingContext2D,
    col: number,
    row: number,
    tileSize: number,
    padding: number,
    offset: number,
    divisions: number,
    step: number,
    flipH: boolean,
    flipV: boolean
  ): void {
    const x = offset + col * (tileSize + padding);
    const y = offset + row * (tileSize + padding);

    // 開始高さと終了高さを計算（0〜1の割合）
    const startFraction = step / divisions;
    const endFraction = (step + 1) / divisions;

    const startHeight = tileSize * startFraction;
    const endHeight = tileSize * endFraction;

    ctx.beginPath();

    if (!flipV) {
      // 床タイプ
      if (!flipH) {
        // 右上がり
        ctx.moveTo(x, y + tileSize);                      // 左下
        ctx.lineTo(x + tileSize, y + tileSize);           // 右下
        ctx.lineTo(x + tileSize, y + tileSize - endHeight);   // 右上
        ctx.lineTo(x, y + tileSize - startHeight);        // 左上
      } else {
        // 右下がり（左右反転）
        ctx.moveTo(x, y + tileSize);                      // 左下
        ctx.lineTo(x + tileSize, y + tileSize);           // 右下
        ctx.lineTo(x + tileSize, y + tileSize - startHeight); // 右上
        ctx.lineTo(x, y + tileSize - endHeight);          // 左上
      }
    } else {
      // 天井タイプ
      if (!flipH) {
        // 右上がり天井
        ctx.moveTo(x, y);                                 // 左上
        ctx.lineTo(x + tileSize, y);                      // 右上
        ctx.lineTo(x + tileSize, y + endHeight);          // 右下
        ctx.lineTo(x, y + startHeight);                   // 左下
      } else {
        // 右下がり天井
        ctx.moveTo(x, y);                                 // 左上
        ctx.lineTo(x + tileSize, y);                      // 右上
        ctx.lineTo(x + tileSize, y + startHeight);        // 右下
        ctx.lineTo(x, y + endHeight);                     // 左下
      }
    }

    ctx.closePath();
    ctx.fill();
  }

  /**
   * 指定した高さ割合の床/天井を描画
   */
  private drawFloorAtFraction(
    ctx: CanvasRenderingContext2D,
    col: number,
    row: number,
    tileSize: number,
    padding: number,
    offset: number,
    fraction: number,
    isCeiling: boolean
  ): void {
    const x = offset + col * (tileSize + padding);
    const y = offset + row * (tileSize + padding);
    const height = tileSize * fraction;

    if (!isCeiling) {
      ctx.fillRect(x, y + tileSize - height, tileSize, height);
    } else {
      ctx.fillRect(x, y, tileSize, height);
    }
  }

  /**
   * 横スクロールアクションゲーム用の個別タイルを描画
   */
  private drawPlatformerTile(
    _processor: ImageProcessor,
    ctx: CanvasRenderingContext2D,
    col: number,
    row: number,
    type: string
  ): void {
    const { tileSize, padding, offset, fillColor } = this.config;
    const x = offset + col * (tileSize + padding);
    const y = offset + row * (tileSize + padding);

    ctx.fillStyle = this.colorToStyle(fillColor);

    switch (type) {
      case 'floor':
        // 床: 下半分が塗りつぶし
        ctx.fillRect(x, y + tileSize / 2, tileSize, tileSize / 2);
        break;

      case 'ceiling':
        // 天井: 上半分が塗りつぶし
        ctx.fillRect(x, y, tileSize, tileSize / 2);
        break;

      case 'wall_left':
        // 左壁: 左半分が塗りつぶし
        ctx.fillRect(x, y, tileSize / 2, tileSize);
        break;

      case 'wall_right':
        // 右壁: 右半分が塗りつぶし
        ctx.fillRect(x + tileSize / 2, y, tileSize / 2, tileSize);
        break;

      case 'slope_45_up':
        // 45度上り坂（右上がり）
        this.drawSlopePolygon(ctx, x, y, tileSize, 45, false, false);
        break;

      case 'floor_45':
        // 45度坂と同じ高さの床
        this.drawFloorAtHeight(ctx, x, y, tileSize, 45, false);
        break;

      case 'slope_45_down':
        // 45度下り坂（右下がり）= 左右反転
        this.drawSlopePolygon(ctx, x, y, tileSize, 45, true, false);
        break;

      case 'slope_45_ceiling_up':
        // 45度天井坂（右上がり）= 上下反転
        this.drawSlopePolygon(ctx, x, y, tileSize, 45, false, true);
        break;

      case 'ceiling_45':
        // 45度坂と同じ高さの天井
        this.drawFloorAtHeight(ctx, x, y, tileSize, 45, true);
        break;

      case 'slope_45_ceiling_down':
        // 45度天井坂（右下がり）= 左右+上下反転
        this.drawSlopePolygon(ctx, x, y, tileSize, 45, true, true);
        break;

      case 'slope_30_up':
        this.drawSlopePolygon(ctx, x, y, tileSize, 30, false, false);
        break;

      case 'floor_30':
        // 30度坂と同じ高さの床
        this.drawFloorAtHeight(ctx, x, y, tileSize, 30, false);
        break;

      case 'slope_30_down':
        this.drawSlopePolygon(ctx, x, y, tileSize, 30, true, false);
        break;

      case 'slope_30_ceiling_up':
        this.drawSlopePolygon(ctx, x, y, tileSize, 30, false, true);
        break;

      case 'ceiling_30':
        // 30度坂と同じ高さの天井
        this.drawFloorAtHeight(ctx, x, y, tileSize, 30, true);
        break;

      case 'slope_30_ceiling_down':
        this.drawSlopePolygon(ctx, x, y, tileSize, 30, true, true);
        break;

      case 'slope_15_up':
        this.drawSlopePolygon(ctx, x, y, tileSize, 15, false, false);
        break;

      case 'floor_15':
        // 15度坂と同じ高さの床
        this.drawFloorAtHeight(ctx, x, y, tileSize, 15, false);
        break;

      case 'slope_15_down':
        this.drawSlopePolygon(ctx, x, y, tileSize, 15, true, false);
        break;

      case 'slope_15_ceiling_up':
        this.drawSlopePolygon(ctx, x, y, tileSize, 15, false, true);
        break;

      case 'ceiling_15':
        // 15度坂と同じ高さの天井
        this.drawFloorAtHeight(ctx, x, y, tileSize, 15, true);
        break;

      case 'slope_15_ceiling_down':
        this.drawSlopePolygon(ctx, x, y, tileSize, 15, true, true);
        break;
    }
  }

  /**
   * 坂道と同じ高さの床/天井を描画
   * @param angle 角度（度）
   * @param isCeiling 天井かどうか
   */
  private drawFloorAtHeight(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    angle: number,
    isCeiling: boolean
  ): void {
    // 角度から高さを計算
    const height = size * Math.tan((angle * Math.PI) / 180);
    const clampedHeight = Math.min(height, size);

    if (!isCeiling) {
      // 床: 下からclampedHeightの高さまで塗りつぶし
      ctx.fillRect(x, y + size - clampedHeight, size, clampedHeight);
    } else {
      // 天井: 上からclampedHeightの高さまで塗りつぶし
      ctx.fillRect(x, y, size, clampedHeight);
    }
  }

  /**
   * 坂道のポリゴンを描画
   * @param angle 角度（度）
   * @param flipH 左右反転
   * @param flipV 上下反転
   */
  private drawSlopePolygon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    angle: number,
    flipH: boolean,
    flipV: boolean
  ): void {
    // 角度から高さを計算
    const height = size * Math.tan((angle * Math.PI) / 180);
    const clampedHeight = Math.min(height, size);

    ctx.beginPath();

    if (!flipV) {
      // 床タイプ（下が埋まる）
      if (!flipH) {
        // 右上がり: 左下から開始、左下→右下→右上（坂）→左下
        ctx.moveTo(x, y + size);                          // 左下
        ctx.lineTo(x + size, y + size);                   // 右下
        ctx.lineTo(x + size, y + size - clampedHeight);   // 右上（坂の頂点）
        ctx.lineTo(x, y + size);                          // 左下に戻る
      } else {
        // 右下がり（左右反転）: 左下→左上（坂）→右下
        ctx.moveTo(x, y + size);                          // 左下
        ctx.lineTo(x, y + size - clampedHeight);          // 左上（坂の頂点）
        ctx.lineTo(x + size, y + size);                   // 右下
        ctx.lineTo(x, y + size);                          // 左下に戻る
      }
    } else {
      // 天井タイプ（上が埋まる）
      if (!flipH) {
        // 右上がり天井: 左上→右上→右下（坂）→左上
        ctx.moveTo(x, y);                                 // 左上
        ctx.lineTo(x + size, y);                          // 右上
        ctx.lineTo(x + size, y + clampedHeight);          // 右下（坂の頂点）
        ctx.lineTo(x, y);                                 // 左上に戻る
      } else {
        // 右下がり天井（左右反転）: 左上→左下（坂）→右上
        ctx.moveTo(x, y);                                 // 左上
        ctx.lineTo(x, y + clampedHeight);                 // 左下（坂の頂点）
        ctx.lineTo(x + size, y);                          // 右上
        ctx.lineTo(x, y);                                 // 左上に戻る
      }
    }

    ctx.closePath();
    ctx.fill();
  }

  /**
   * 色をCSS文字列に変換
   */
  private colorToStyle(color: Color): string {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
  }

  /**
   * 辺の色を取得
   */
  private getBorderColor(edge: 'top' | 'bottom' | 'left' | 'right' | 'corner'): Color {
    const { detailedColorMode, detailedColors, borderColor } = this.config;
    if (detailedColorMode && detailedColors) {
      return detailedColors[edge];
    }
    return borderColor;
  }

  /**
   * 個別のタイルを描画
   */
  private drawTile(processor: ImageProcessor, x: number, y: number, edges: TileEdge): void {
    const { tileSize, fillColor, borderWidth } = this.config;
    const ctx = processor.getContext();

    // 塗りつぶし
    processor.fillRect({ x, y, width: tileSize, height: tileSize }, fillColor);

    // 上辺
    if (!(edges & TileEdge.TOP)) {
      ctx.fillStyle = this.colorToStyle(this.getBorderColor('top'));
      ctx.fillRect(x, y, tileSize, borderWidth);
    }

    // 右辺
    if (!(edges & TileEdge.RIGHT)) {
      ctx.fillStyle = this.colorToStyle(this.getBorderColor('right'));
      ctx.fillRect(x + tileSize - borderWidth, y, borderWidth, tileSize);
    }

    // 下辺
    if (!(edges & TileEdge.BOTTOM)) {
      ctx.fillStyle = this.colorToStyle(this.getBorderColor('bottom'));
      ctx.fillRect(x, y + tileSize - borderWidth, tileSize, borderWidth);
    }

    // 左辺
    if (!(edges & TileEdge.LEFT)) {
      ctx.fillStyle = this.colorToStyle(this.getBorderColor('left'));
      ctx.fillRect(x, y, borderWidth, tileSize);
    }

    // 外側コーナーの重なり部分を角の色で上書き
    const cornerColor = this.getBorderColor('corner');
    ctx.fillStyle = this.colorToStyle(cornerColor);

    // 左上外側コーナー
    if (!(edges & TileEdge.TOP) && !(edges & TileEdge.LEFT)) {
      ctx.fillRect(x, y, borderWidth, borderWidth);
    }

    // 右上外側コーナー
    if (!(edges & TileEdge.TOP) && !(edges & TileEdge.RIGHT)) {
      ctx.fillRect(x + tileSize - borderWidth, y, borderWidth, borderWidth);
    }

    // 右下外側コーナー
    if (!(edges & TileEdge.BOTTOM) && !(edges & TileEdge.RIGHT)) {
      ctx.fillRect(x + tileSize - borderWidth, y + tileSize - borderWidth, borderWidth, borderWidth);
    }

    // 左下外側コーナー
    if (!(edges & TileEdge.BOTTOM) && !(edges & TileEdge.LEFT)) {
      ctx.fillRect(x, y + tileSize - borderWidth, borderWidth, borderWidth);
    }

    // 内側コーナー（47タイルの場合のみ）
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
   * 画像の左上を基準として、オフセット、タイルサイズ、パディングに基づいて描画
   */
  static drawGrid(processor: ImageProcessor, config: TemplateConfig): void {
    const { tileFormat, tileSize, padding, offset } = config;
    const cols = tileFormat === 16 ? 4 : 8;
    const rows = tileFormat === 16 ? 4 : 6;
    const gridColor: Color = { r: 128, g: 128, b: 128, a: 180 };

    const imageWidth = processor.getWidth();
    const imageHeight = processor.getHeight();

    // 縦線（各タイルの左端と最後のタイルの右端）
    for (let i = 0; i <= cols; i++) {
      const x = offset + i * (tileSize + padding);
      if (x >= 0 && x <= imageWidth) {
        processor.drawLine(x, 0, x, imageHeight, gridColor, 1);
      }
    }

    // 横線（各タイルの上端と最後のタイルの下端）
    for (let i = 0; i <= rows; i++) {
      const y = offset + i * (tileSize + padding);
      if (y >= 0 && y <= imageHeight) {
        processor.drawLine(0, y, imageWidth, y, gridColor, 1);
      }
    }
  }

  /**
   * テンプレートの寸法を取得
   */
  static getDimensions(config: TemplateConfig): { width: number; height: number; cols: number; rows: number } {
    const { tileFormat, tileSize, padding, offset } = config;
    let cols: number;
    let rows: number;

    if (tileFormat === 'platformer') {
      cols = 7;
      rows = 7;
    } else {
      cols = tileFormat === 16 ? 4 : 8;
      rows = tileFormat === 16 ? 4 : 6;
    }

    const width = offset + cols * (tileSize + padding);
    const height = offset + rows * (tileSize + padding);
    return { width, height, cols, rows };
  }
}
