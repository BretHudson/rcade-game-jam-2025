import { Game } from 'canvas-lord';
import { assetManager } from './assets';
import { GameScene } from './scene';
import './style.css';

export const initGame = async () => {
	const game = new Game('octo', {
		fps: 60,
		gameLoopSettings: {
			updateMode: 'always',
			renderMode: 'onUpdate',
		},
		assetManager,
	});

	await assetManager.loadAssets();

	game.backgroundColor = 'cornflowerblue';
	game.focusElement = document.body; // hack

	const scene = new GameScene();

	game.pushScene(scene);

	return game;
};
