import mosaic from "./mosaic.yaml?raw";
import norinori from "./norinori.yaml?raw";
import sudoku from "./sudoku.yaml?raw";

const defs = { mosaic, norinori, sudoku };
export const PuzzleDefinitions = new Map(Object.entries(defs));
