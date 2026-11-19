import DominosaPuzzle from "./dominosa";
import NorinoriPuzzle from "./norinori";
import SlitherlinkPuzzle from "./slitherlink";
import StarBattlePuzzle from "./star-battle";
import StitchesPuzzle from "./stitches";
import SudokuPuzzle from "./sudoku";
import ThermometersPuzzle from "./thermometers";
import YinYangPuzzle from "./yin-yang";

const puzzleTypes = [
  DominosaPuzzle,
  NorinoriPuzzle,
  SlitherlinkPuzzle,
  StarBattlePuzzle,
  StitchesPuzzle,
  SudokuPuzzle,
  ThermometersPuzzle,
  YinYangPuzzle,
];
export type PuzzleType = (typeof puzzleTypes)[number];

export const puzzleMap = new Map(puzzleTypes.map((puzzle) => [puzzle.type, puzzle]));
