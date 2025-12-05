import { PLAYER_1 } from '@rcade/plugin-input-classic';
import { type Input, Keys, Scene } from 'canvas-lord';

const preventDefault = () => {
	// leave empty
};

export class GameScene extends Scene {
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
