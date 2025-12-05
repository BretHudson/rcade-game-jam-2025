import {
	BoxCollider,
	Entity,
	Input,
	Keys,
	Sprite,
	Vec2,
	type CSSColor,
} from 'canvas-lord';
import {
	assetManager,
	BOARD_H,
	BOARD_W,
	CELL_H,
	CELL_W,
	COLLISION_TAG,
	IMAGES,
} from './assets';
import type { Egg } from './egg';
import type { GameScene } from './scene';

export class Octopus extends Entity<GameScene> {
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

	constructor(x: number, y: number, tag: string, color: CSSColor) {
		const image = assetManager.sprites.get(IMAGES.SNAKETOPUS);
		if (!image) throw new Error('oh no');
		const sprite = new Sprite(image);
		super(x, y, sprite);

		this.oldPos.setXY(x, y);
		this.newPos.setXY(x, y);

		console.log(image.image);
		// sprite.scale = ;

		const collider = new BoxCollider(CELL_W, CELL_H, tag);
		collider.color = color;
		this.addCollider(collider);
		this.colliderVisible = true;
	}

	preUpdate() {
		if (!this.scaled && assetManager.sprites.get(IMAGES.OCTOPUS)?.loaded) {
			this.graphic.scale = this.scale * (CELL_W / this.graphic.width);
			this.graphic.centerOO();
			this.graphic.x += CELL_W / 2;
			this.graphic.y += CELL_H / 2;
			this.scaled = true;
		}
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
	}

	move() {
		if (!this.following) return;

		this.oldPos.x = this.x;
		this.oldPos.y = this.y;

		this.x = this.following.oldPos.x;
		this.y = this.following.oldPos.y;

		this.followedBy?.move();
	}

	scaled = false;
}

export class Baby extends Octopus {
	constructor(x: number, y: number) {
		super(x, y, COLLISION_TAG.BABY, 'red');

		this.scale = 0.75;
	}
}

export class Player extends Octopus {
	babies: Baby[] = [];

	constructor(x: number, y: number) {
		super(x, y, COLLISION_TAG.PLAYER, 'yellow');
	}

	update(input: Input) {
		const xDir =
			+input.keyPressed(Keys.ArrowRight) - +input.keyPressed(Keys.ArrowLeft);
		const yDir =
			+input.keyPressed(Keys.ArrowDown) - +input.keyPressed(Keys.ArrowUp);

		if (xDir || yDir) {
			this.oldPos.x = this.x;
			this.oldPos.y = this.y;
			this.followedBy?.move();
		}

		this.x += xDir * CELL_W;
		this.y += yDir * CELL_H;

		if (this.x < 0) this.x += BOARD_W;
		if (this.x >= BOARD_W) this.x -= BOARD_W;

		if (this.y < 0) this.y += BOARD_H;
		if (this.y >= BOARD_H) this.y -= BOARD_H;

		const egg = this.collideEntity<Egg>(this.x, this.y, COLLISION_TAG.EGG);
		if (egg) {
			egg.consume();
			this.addFollower();
			this.scene.addEgg();
		}
	}
}
