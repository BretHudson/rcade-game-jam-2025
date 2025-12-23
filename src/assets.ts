import { AssetManager } from 'canvas-lord';

export const GAME_SIZE = {
	W: 336,
	H: 262,
};

export const GRID_W = 10;
export const GRID_H = 11;
const SIZE = Math.floor(GAME_SIZE.H / GRID_H) - 1;
export const CELL_W = SIZE;
export const CELL_H = SIZE;

export const BOARD_W = GRID_W * CELL_W;
export const BOARD_H = GRID_H * CELL_H;

export const IMAGES = {
	OCTOPUS: 'octopus.png',
	SNAKETOPUS: 'snaketopus.png',
};

export const FONTS = {
	CANDY_BEANS: 'fonts/Candy Beans/Candy Beans.otf',
	VIRIDIAN_COLLEGE: 'fonts/Viridian College/Viridian College.otf',
};

export const assetManager = new AssetManager('./assets/');

Object.values(IMAGES).forEach((image) => {
	assetManager.addImage(image);
});

export const COLLISION_TAG = {
	PLAYER: 'player',
	BABY: 'baby',
	EGG: 'egg',
};
