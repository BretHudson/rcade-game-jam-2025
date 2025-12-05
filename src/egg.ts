import { BoxCollider, Entity, Sprite } from 'canvas-lord';
import { CELL_H, CELL_W, COLLISION_TAG } from './assets';

export class Egg extends Entity {
	newX: number;
	newY: number;

	constructor(x: number, y: number) {
		super(x, y);

		this.newX = x;
		this.newY = y;

		const pad = 3;
		const size = CELL_W - pad * 2;
		const sprite = Sprite.createCircle(size, 'white');
		sprite.x = pad;
		sprite.y = pad;
		this.graphic = sprite;

		const collider = new BoxCollider(CELL_W, CELL_H, COLLISION_TAG.EGG);
		collider.color = 'lime';
		this.addCollider(collider);
		this.colliderVisible = true;
	}

	consume() {
		this.scene.removeEntity(this);
		this.scene.removeRenderable(this);
	}
}
