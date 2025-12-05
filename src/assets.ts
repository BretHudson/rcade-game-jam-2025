import { AssetManager } from 'canvas-lord';

export const GAME_SIZE = {
	W: 336,
	H: 262,
};

export const GRID_W = 15;
export const GRID_H = 17;
const SIZE = Math.floor(GAME_SIZE.H / GRID_H) - 1;
export const CELL_W = SIZE;
export const CELL_H = SIZE;

export const IMAGES = {
	OCTOPUS: 'octopus.png',
};

export const assetManager = new AssetManager('./assets/');

Object.values(IMAGES).forEach((image) => {
	assetManager.addImage(image);
});
