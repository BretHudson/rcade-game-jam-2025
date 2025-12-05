import { Entity, Input, Keys, Sprite } from 'canvas-lord';

export class Player extends Entity {
	constructor(x = 0, y = 0) {
		super(x, y, Sprite.createRect(32, 32, 'yellow'));
	}

	update(input: Input) {
		if (input.keyCheck(Keys.ArrowLeft)) this.x -= 1;
		if (input.keyCheck(Keys.ArrowRight)) this.x += 1;
		if (input.keyCheck(Keys.ArrowUp)) this.y -= 1;
		if (input.keyCheck(Keys.ArrowDown)) this.y += 1;
	}
}
