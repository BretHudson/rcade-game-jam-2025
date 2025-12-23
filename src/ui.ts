import {
	Camera,
	Entity,
	Graphic,
	Input,
	Text,
	type CSSColor,
	type Ctx,
} from 'canvas-lord';
import type { GameScene } from './scene';
import { BOARD_W, CELL_H, GAME_SIZE, GRID_H } from './assets';

Text.addPreset('ui-label', {
	font: 'Candy Beans',
	size: 14,
	color: '#dde',
	align: 'center',
});

Text.addPreset('ui-number', {
	font: 'Viridian College',
	size: 18,
	color: '#fff',
	align: 'center',
});

class TextPlus extends Graphic {
	strokeFirst = true;

	#fill: Text;
	#stroke: Text;

	stroke: CSSColor = 'black';
	lineWidth = 0;

	get str() {
		return this.#fill.str;
	}

	set str(value: string) {
		this.#fill.str = value;
		this.#stroke.str = value;
	}

	constructor(str: string, x: number, y: number) {
		super(x, y);
		this.#fill = new Text(str, x, y);
		this.#stroke = new Text(str, x, y);
	}

	centerOrigin(): void {
		this.#fill.centerOrigin();
		this.#stroke.centerOrigin();
	}

	usePreset(name: string): void {
		this.#fill.usePreset(name);
		this.#fill.type = 'fill';
		this.#stroke.usePreset(name);
		this.#stroke.type = 'stroke';
	}

	#renderStroke(ctx: Ctx, camera?: Camera): void {
		if (this.lineWidth <= 0) return;
		ctx.save();
		ctx.lineWidth = this.lineWidth;
		this.#stroke.render(ctx, camera);
		ctx.restore();
	}

	render(ctx: Ctx, camera?: Camera): void {
		this.#fill.alpha = this.alpha;
		this.#fill.angle = this.angle;
		this.#fill.scaleX = this.scaleX;
		this.#fill.scaleY = this.scaleY;
		this.#fill.scrollX = this.scrollX;
		this.#fill.scrollY = this.scrollY;
		this.#fill.relative = this.relative;

		this.#stroke.alpha = this.alpha;
		this.#stroke.angle = this.angle;
		this.#stroke.scaleX = this.scaleX;
		this.#stroke.scaleY = this.scaleY;
		this.#stroke.scrollX = this.scrollX;
		this.#stroke.scrollY = this.scrollY;
		this.#stroke.relative = this.relative;

		this.#stroke.color = this.stroke;

		ctx.save();
		ctx.letterSpacing = '2px';
		if (this.strokeFirst) {
			this.#renderStroke(ctx, camera);
		}
		this.#fill.render(ctx, camera);
		if (!this.strokeFirst) {
			this.#renderStroke(ctx, camera);
		}
		ctx.restore();
	}
}

export class UI extends Entity<GameScene> {
	timerLabel: TextPlus;
	timer: TextPlus;
	countLabel: TextPlus;
	count: TextPlus;

	constructor() {
		super();

		const cameraOffset = Math.round((GAME_SIZE.H - CELL_H * GRID_H) / 2);

		const uiWidth = GAME_SIZE.W - BOARD_W;
		const centerX = BOARD_W + uiWidth / 2 + (cameraOffset * 1) / 2;

		const yyInc = 44;
		let yy = 20;

		const timer = this.#createPair(centerX, yy, 'TIME', '00:00');
		this.timerLabel = timer[0];
		this.timer = timer[1];

		yy += yyInc;

		const count = this.#createPair(centerX, yy, 'BABIES', '0');
		this.countLabel = count[0];
		this.count = count[1];

		yy += yyInc;

		this.addGraphic(this.timerLabel);
		this.addGraphic(this.timer);
		this.addGraphic(this.countLabel);
		this.addGraphic(this.count);

		this.depth = -1000;
	}

	#createPair(x: number, y: number, labelStr: string, valueStr: string) {
		const label = new TextPlus(labelStr, x, y);
		label.scrollX = label.scrollY = 0;
		label.usePreset('ui-label');
		// label.lineWidth = 3;
		// label.stroke = '#444';

		const value = new TextPlus(valueStr, x, y + 16);
		value.scrollX = value.scrollY = 0;
		value.usePreset('ui-number');
		value.lineWidth = 3;

		return [label, value] as const;
	}

	frame = 0;
	running = true;

	update(_input: Input): void {
		if (this.running) {
			this.#updateFrames();
			this.#updateBabyCount();
		}
	}

	#updateFrames() {
		++this.frame;

		const totalSeconds = Math.floor(this.frame / 60);
		const seconds = totalSeconds % 60;
		const minutes = Math.floor(totalSeconds / 60);
		this.timer.str = `${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}`;
	}

	#updateBabyCount() {
		this.count.str = `${this.scene.babyCount}`;
	}

	gameOver(): void {
		this.#pauseTimer();
	}

	#pauseTimer(): void {
		this.running = false;
	}

	_restartTimer(): void {
		this.frame = 0;
	}
}
