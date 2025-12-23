import { PLAYER_1 } from '@rcade/plugin-input-classic';
import {
	Camera,
	type Ctx,
	type Input,
	Keys,
	Random,
	Scene,
	type V2_T,
	Vec2,
	Draw,
	Text,
} from 'canvas-lord';
import {
	BOARD_H,
	BOARD_W,
	CELL_H,
	CELL_W,
	GAME_SIZE,
	GRID_H,
	GRID_W,
} from './assets';
import { Egg } from './egg';
import { Octopus, Player, type InputDir } from './player';
import { UI } from './ui';

const preventDefault = () => {
	// leave empty
};

const createPattern = () => {
	const offscreenCanvas = new OffscreenCanvas(BOARD_W, BOARD_H);
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

const random = new Random(1234);

const allCellPos = new Set<string>();
for (let y = 0; y < BOARD_H; y += CELL_H) {
	for (let x = 0; x < BOARD_W; x += CELL_W) {
		allCellPos.add([x, y].join(','));
	}
}

export class GameScene extends Scene {
	player: Player;

	grid = Array.from({ length: GRID_H }, () => {
		return Array.from({ length: GRID_W }, () => null as Octopus | null);
	});

	ui = new UI();

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

		const playerX = 5;
		const playerY = 5;
		const player = new Player(playerX * CELL_W, playerY * CELL_H);
		player.oldPos.setXY(player.oldPos.x + CELL_W, player.oldPos.y);
		this.addEntities(player);
		player.addFollower();

		this.player = player;
	}

	get octopusCount(): number {
		return this.grid.flat().filter((v) => v !== null).length;
	}

	get babyCount(): number {
		return this.octopusCount - 1;
	}

	get emptyCellCount(): number {
		return this.grid.flat().filter((v) => v === null).length;
	}

	addEgg(): void {
		const numOpen = this.emptyCellCount;

		if (numOpen === 0) {
			throw new Error('you won!');
		}

		const index = random.int(numOpen);
		let curIndex = 0;
		for (let y = 0; y < GRID_H; ++y) {
			for (let x = 0; x < GRID_W; ++x) {
				if (this.grid[y][x] !== null) continue;

				if (curIndex++ === index) {
					this.addEntity(new Egg(x * CELL_W, y * CELL_H));
					break;
				}
			}
		}
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

		this.addEgg();

		this.addEntity(this.ui);
	}

	#assignInput(input: Input): void {
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

	timer = 0;
	// timeout = 30;
	timeout = 15;

	lastInput: InputDir = Keys.ArrowLeft;
	lastMove: InputDir = Keys.ArrowLeft;

	update(input: Input): void {
		this.#assignInput(input);

		const arrowKeys = [
			Keys.ArrowLeft,
			Keys.ArrowUp,
			Keys.ArrowRight,
			Keys.ArrowDown,
		] as const;

		arrowKeys.forEach((key, i) => {
			const opp = (i + 2) % 4;
			if (input.keyPressed(key) && this.lastMove !== arrowKeys[opp])
				this.lastInput = key;
		});

		if (!this.player.dead) {
			// TODO(bret): add a fast mode (gonna need to adjust Octopus lerp)
			const timeout = this.timeout;

			if (this.timer++ >= timeout) {
				this.timer = 0;
				this.player.move(this.lastInput);
				this.lastMove = this.lastInput;
			}
		} else {
			if (input.keyPressed(Keys.A, Keys.B)) {
				this.engine.popScenes();
				this.engine.pushScene(new GameScene());
			}
		}
	}

	render(ctx: Ctx, camera: Camera): void {
		for (let y = 0; y < GRID_H; ++y) {
			for (let x = 0; x < GRID_W; ++x) {
				if (this.grid[y][x] === null) continue;

				const xx = CELL_W * x - camera.x;
				const yy = CELL_H * y - camera.y;
				Draw.rect(
					ctx,
					{
						type: 'fill',
						color: '#00ff0033',
					},
					xx,
					yy,
					CELL_W,
					CELL_H,
				);
			}
		}
	}

	playerDead(): void {
		this.player.dead = true;
		this.player.allFollowersQueue((next) => {
			next.dead = true;
		});

		this.ui.gameOver();
	}

	posToGridCell(p: Vec2): Vec2 {
		return new Vec2(
			((p.x + BOARD_W) % BOARD_W) / CELL_W,
			((p.y + BOARD_H) % BOARD_H) / CELL_H,
		);
	}
}
