import {
	BoxCollider,
	Camera,
	clamp,
	Entity,
	Keys,
	lerp,
	Random,
	Sprite,
	Vec2,
	type ColliderTag,
	type CSSColor,
	type Ctx,
	type V2_T,
} from 'canvas-lord';
import {
	assetManager,
	BOARD_H,
	BOARD_W,
	CELL_H,
	CELL_W,
	COLLISION_TAG,
	GRID_H,
	GRID_W,
	IMAGES,
} from './assets';
import type { Egg } from './egg';
import type { GameScene } from './scene';

export class Octopus extends Entity<GameScene> {
	dead = false;

	get graphic(): Sprite {
		return super.graphic as Sprite;
	}

	set graphic(sprite: Sprite) {
		super.graphic = sprite;
	}

	scale = 1;

	following: Octopus | null = null;
	followedBy: Octopus | null = null;

	oldPos = new Vec2();
	newPos = new Vec2();

	sin = 0;

	constructor(x: number, y: number, tag: string, color: CSSColor) {
		const image = assetManager.sprites.get(IMAGES.SNAKETOPUS);
		if (!image) throw new Error('oh no');
		const sprite = new Sprite(image);
		super(x, y, sprite);

		this.sin = Random.float(Math.PI * 2);

		this.oldPos.setXY(x, y);
		this.newPos.setXY(x, y);

		const collider = new BoxCollider(CELL_W, CELL_H, tag);
		collider.color = color;
		this.addCollider(collider);
		// this.colliderVisible = true;
	}

	preUpdate() {
		if (this.dead) return;

		if (!this.scaled && assetManager.sprites.get(IMAGES.OCTOPUS)?.loaded) {
			this.graphic.scale = this.scale * (CELL_W / this.graphic.width);
			this.graphic.centerOO();
			this.graphic.x += CELL_W / 2;
			this.graphic.y += CELL_H / 2;
			this.scaled = true;
		}
	}

	postUpdate() {
		if (this.dead) return;

		let xDist = this.x - this.newPos.x;
		let yDist = this.y - this.newPos.y;

		if (Math.abs(xDist) > BOARD_W / 2) {
			xDist = -Math.sign(xDist) * CELL_W;
			this.newPos.x = this.x - xDist;
		}
		if (Math.abs(yDist) > BOARD_H / 2) {
			yDist = -Math.sign(yDist) * CELL_H;
			this.newPos.y = this.y - yDist;
		}

		this.x =
			Math.abs(xDist) > 0.1
				? lerp(this.x, this.newPos.x, 0.17 * 2)
				: this.newPos.x;
		this.y =
			Math.abs(yDist) > 0.1
				? lerp(this.y, this.newPos.y, 0.17 * 2)
				: this.newPos.y;

		if (this.x === this.newPos.x) {
			if (this.newPos.x < 0) this.newPos.x += BOARD_W;
			if (this.newPos.x >= BOARD_W) this.newPos.x -= BOARD_W;
			this.x = this.newPos.x;
		}

		if (this.y === this.newPos.y) {
			if (this.newPos.y < 0) this.newPos.y += BOARD_H;
			if (this.newPos.y >= BOARD_H) this.newPos.y -= BOARD_H;
			this.y = this.newPos.y;
		}

		this.graphic.visible = false;

		this.sin += 0.1;
		this.graphic.centerOO();
		this.graphic.y = CELL_H / 2 - Math.abs(Math.sin(this.sin));
		this.graphic.angle = clamp(Math.sin(this.sin * 0.5) * 30, -10, 10);
	}

	addFollower() {
		if (this.followedBy) {
			this.followedBy.addFollower();
			return;
		}
		const baby = new Baby(this.oldPos.x, this.oldPos.y);
		this.followedBy = baby;
		baby.following = this;
		this.scene.addEntities(baby);
		this.scene.grid[this.oldPos.y / CELL_H][this.oldPos.x / CELL_W] = baby;
	}

	followParent() {
		if (!this.following) return;

		this.oldPos.x = this.x;
		this.oldPos.y = this.y;

		this.newPos.x = this.following.oldPos.x;
		this.newPos.y = this.following.oldPos.y;

		this.followedBy?.followParent();
	}

	render(ctx: Ctx, camera: Camera): void {
		this.graphic.visible = true;

		ctx.save();

		ctx.beginPath();
		ctx.rect(-camera.x, -camera.y, BOARD_W, BOARD_H);
		ctx.clip();

		// TODO(bret): only render extra sides if close to the edge!! - and only on
		// the edges related
		const pos: V2_T[] = [[0, 0]];

		const edgeL = this.x < CELL_W;
		const edgeR = this.x >= BOARD_W - CELL_W;
		const edgeT = this.y < CELL_H;
		const edgeB = this.y >= BOARD_H - CELL_H;
		if (edgeL) {
			pos.push([-BOARD_W, 0]);
			if (edgeT) pos.push([-BOARD_W, -BOARD_H]);
			if (edgeB) pos.push([-BOARD_W, BOARD_H]);
		}
		if (edgeT) pos.push([0, -BOARD_H]);
		if (edgeB) pos.push([0, BOARD_H]);
		if (edgeR) {
			pos.push([BOARD_W, 0]);
			if (edgeT) pos.push([BOARD_W, -BOARD_H]);
			if (edgeB) pos.push([BOARD_W, BOARD_H]);
		}

		pos.forEach(([x, y]) => {
			const newCam = new Camera();
			newCam.set(camera);
			newCam.setXY(newCam.x + x, newCam.y + y);
			this.graphic.render(ctx, newCam);
		});
		ctx.restore();
	}

	scaled = false;
}

export class Baby extends Octopus {
	constructor(x: number, y: number) {
		super(x, y, COLLISION_TAG.BABY, 'red');

		this.scale = 0.75;
	}
}

export type InputDir =
	| typeof Keys.ArrowLeft
	| typeof Keys.ArrowRight
	| typeof Keys.ArrowUp
	| typeof Keys.ArrowDown;

export class Player extends Octopus {
	babies: Baby[] = [];

	constructor(x: number, y: number) {
		super(x, y, COLLISION_TAG.PLAYER, 'yellow');
	}

	update() {
		if (this.dead) return;

		const egg = this.collideEntity<Egg>(this.x, this.y, COLLISION_TAG.EGG);
		if (egg) {
			console.warn('consumed??');
			egg.consume();
			this.addFollower();
			this.scene.addEgg();
		}
	}

	move(lastInput: InputDir) {
		if (this.dead) return;

		this.oldPos.x = this.x;
		this.oldPos.y = this.y;

		switch (lastInput) {
			case Keys.ArrowLeft:
				this.newPos.x -= CELL_W;
				break;
			case Keys.ArrowRight:
				this.newPos.x += CELL_W;
				break;
			case Keys.ArrowUp:
				this.newPos.y -= CELL_H;
				break;
			case Keys.ArrowDown:
				this.newPos.y += CELL_H;
				break;
			default:
				throw new Error('huh???');
		}

		this.followedBy?.followParent();

		// if main octopus
		if (!this.following) {
			const { grid } = this.scene;
			this.allFollowersQueue((next) => {
				const p = this.scene.posToGridCell(next.oldPos);
				grid[p[1]][p[0]] = null;
			}, true);

			this.allFollowersStack((next) => {
				const p = this.scene.posToGridCell(next.newPos);
				if (grid[p[1]][p[0]] !== null) {
					this.scene.playerDead();
					return true;
				}
				grid[p[1]][p[0]] = next;
			}, true);
		}
	}

	allFollowersQueue(
		callback: (f: Octopus) => boolean | void,
		includeSelf = false,
	) {
		const queue = [includeSelf ? this : this.followedBy];
		while (queue.length) {
			const next = queue.shift();
			if (!next) break;

			if (callback(next)) break;

			queue.push(next.followedBy);
		}
	}

	allFollowersStack(
		callback: (f: Octopus) => boolean | void,
		includeSelf = false,
	) {
		const queue: Octopus[] = [];
		let cur: Octopus | null = includeSelf ? this : this.followedBy;
		while (cur) {
			queue.push(cur);
			cur = cur.followedBy;
		}
		while (queue.length) {
			const next = queue.pop();
			if (!next) break;

			if (callback(next)) break;
		}
	}
}
