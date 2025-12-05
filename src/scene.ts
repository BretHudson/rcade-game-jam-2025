import { PLAYER_1 } from '@rcade/plugin-input-classic';
import { type Input, Keys, Scene } from 'canvas-lord';
import { CELL_H, CELL_W, GAME_SIZE, GRID_H, GRID_W } from './assets';
import { Player } from './player';

const preventDefault = () => {
	// leave empty
};

const createPattern = () => {
	const offscreenCanvas = new OffscreenCanvas(GRID_W * CELL_W, GRID_H * CELL_H);
	const offscreenCtx = offscreenCanvas.getContext('2d');
	if (!offscreenCtx) throw new Error('could not create offscreen canvas');
	offscreenCtx.fillRect(0, 0, 128, 128);
	for (let y = 0; y < GRID_H; ++y) {
		for (let x = 0; x <= GRID_W; ++x) {
			offscreenCtx.fillStyle = (x + y) % 2 === 0 ? '#6179CF' : '#5168BD';
			offscreenCtx.fillRect(x * CELL_W, y * CELL_H, CELL_W, CELL_H);
		}
	}
	const pattern = offscreenCtx.createPattern(offscreenCanvas, 'repeat');
	if (!pattern) throw new Error('pattern could not be created');
	return pattern;
};

const pattern = createPattern();

export class GameScene extends Scene {
	constructor() {
		super();

		this.onRender.add((ctx) => {
			ctx.save();
			{
				ctx.translate(-this.camera.x, -this.camera.y);
				ctx.fillStyle = pattern;
				ctx.fillRect(0, 0, GRID_W * CELL_W, GRID_H * CELL_H);
			}
			ctx.restore();
		});
	}

	begin(): void {
		// for (let y = 0; y < ROWS; ++y) {
		// 	for (let x = 0; x < COLS; ++x) {
		// 		const sprite = Sprite.createRect(
		// 			SIZE,
		// 			SIZE,
		// 			(x + y) % 2 ? 'red' : 'blue',
		// 		);
		// 		sprite.x = x * SIZE;
		// 		sprite.y = y * SIZE;
		// 		this.addGraphic(sprite);
		// 	}
		// }
		this.camera.y = -Math.round((GAME_SIZE.H - CELL_H * GRID_H) / 2);
		this.camera.x = this.camera.y;
		console.log(this.camera);

		this.addEntities(new Player());
	}

	update(input: Input): void {
		[
			[PLAYER_1.DPAD.left, Keys.ArrowLeft],
			[PLAYER_1.DPAD.right, Keys.ArrowRight],
			[PLAYER_1.DPAD.up, Keys.ArrowUp],
			[PLAYER_1.DPAD.down, Keys.ArrowDown],
			[PLAYER_1.A, Keys.A],
			[PLAYER_1.B, Keys.B],
		].forEach(([k, v]) => {
			if (k) {
				input.onKeyDown({
					preventDefault,
					code: v,
				} as KeyboardEvent);
			} else {
				input.onKeyUp({
					preventDefault,
					code: v,
				} as KeyboardEvent);
			}
		});
	}
}
