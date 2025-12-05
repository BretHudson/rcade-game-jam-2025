import { PLAYER_1, SYSTEM } from '@rcade/plugin-input-classic';
import { initGame } from './game';
import './style.css';

// 336 x 262
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
	<div id="controls"></div>
	<canvas id="octo" width="336px" height="262px"></canvas>
`;

// const status = document.querySelector<HTMLParagraphElement>('#status')!;
const controls = document.querySelector<HTMLDivElement>('#controls')!;

let gameStarted = false;

function update() {
	if (!gameStarted) {
		if (SYSTEM.ONE_PLAYER) {
			gameStarted = true;
			// status.textContent = 'Game Started!';
		}
	} else {
		const inputs: string[] = [];
		if (PLAYER_1.DPAD.up) inputs.push('↑');
		if (PLAYER_1.DPAD.down) inputs.push('↓');
		if (PLAYER_1.DPAD.left) inputs.push('←');
		if (PLAYER_1.DPAD.right) inputs.push('→');
		if (PLAYER_1.A) inputs.push('A');
		if (PLAYER_1.B) inputs.push('B');

		controls.textContent = inputs.length > 0 ? inputs.join(' ') : '-';
		console.log(controls.textContent);
	}

	requestAnimationFrame(update);
}

const game = initGame();
game.start();
