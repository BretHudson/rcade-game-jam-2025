import { Game } from 'canvas-lord';
import { Player } from './player';
import { GameScene } from './scene';
import './style.css';

export const initGame = () => {
	const game = new Game('octo', {
		fps: 60,
		gameLoopSettings: {
			updateMode: 'always',
			renderMode: 'onUpdate',
		},
	});
	game.backgroundColor = 'cornflowerblue';
	game.focusElement = document.body; // hack

	const entity = new Player();

	const scene = new GameScene();

	scene.addEntity(entity);

	game.pushScene(scene);
	return game;
};
