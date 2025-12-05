import { Entity, Input, Keys, Sprite } from 'canvas-lord';
import { assetManager, CELL_W, IMAGES } from './assets';

export class Player extends Entity {
	get graphic(): Sprite {
		return super.graphic as Sprite;
	}

	set graphic(sprite: Sprite) {
		super.graphic = sprite;
	}

	constructor(x = 0, y = 0) {
		const image = assetManager.sprites.get(IMAGES.OCTOPUS);
		if (!image) throw new Error('oh no');
		const sprite = new Sprite(image);
		super(x, y, sprite);

		console.log(image.image);
		// sprite.scale = ;
	}

	scaled = false;

	update(input: Input) {
		if (!this.scaled && assetManager.sprites.get(IMAGES.OCTOPUS)?.loaded) {
			this.graphic.scale = CELL_W / this.graphic.width;
			this.scaled = true;
		}

		const xDir =
			+input.keyCheck(Keys.ArrowRight) - +input.keyCheck(Keys.ArrowLeft);
		const yDir =
			+input.keyCheck(Keys.ArrowDown) - +input.keyCheck(Keys.ArrowUp);
		this.x += xDir;
		this.y += yDir;
	}
}
