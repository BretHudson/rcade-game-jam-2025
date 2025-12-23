import { Game, Text } from 'canvas-lord';
import { assetManager, FONTS } from './assets';
import { GameScene } from './scene';
import './style.css';

const loadFont = async (name: string, fileName: string) => {
	const font = new FontFace(name, `url("./assets/${fileName}")`);
	await font.load();
	// @ts-ignore - this is valid despite TS saying it's not
	document.fonts.add(font);
};

export const initGame = async () => {
	const game = new Game('octo', {
		fps: 60,
		gameLoopSettings: {
			updateMode: 'always',
			renderMode: 'onUpdate',
		},
		assetManager,
	});

	await loadFont('Candy Beans', FONTS.CANDY_BEANS);
	await loadFont('Viridian College', FONTS.VIRIDIAN_COLLEGE);

	Text.updateDefaultOptions({
		font: 'Candy Beans',
		size: 24,
		color: '#fff',
	});

	await assetManager.loadAssets();

	game.backgroundColor = 'forestgreen';
	game.focusElement = document.body; // hack

	game.ctx.imageSmoothingEnabled = true;

	const scene = new GameScene();

	game.pushScene(scene);

	return game;
};
