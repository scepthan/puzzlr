import { PuzzleGrid } from "@/base";
import { SquareGrid } from "@/base/grids";
import Puzzle from "@/base/Puzzle";
import { PuzzleDefinition, PuzzleGridDefinition } from "./PuzzleDefinition";
import { PuzzleTypeDefinition } from "./PuzzleTypeDefinition";

const createGrid = (gridDefinition: PuzzleGridDefinition): PuzzleGrid => {
  switch (gridDefinition.type) {
    case "square":
      return SquareGrid.fromSize(gridDefinition.width, gridDefinition.height);
    default:
      throw new Error(`Unknown grid type: ${gridDefinition.type}`);
  }
};

export const createPuzzle = (
  puzzleType: PuzzleTypeDefinition,
  puzzleDefinition: PuzzleDefinition,
) => {
  const grid = createGrid(puzzleDefinition.grid);

  if (puzzleDefinition.boxes) {
    const { width, height } = puzzleDefinition.boxes;
    grid.cellmap.map((cell, { x, y }) => {
      cell.area_id = ((x / width) | 0) + height * ((y / height) | 0);
    });
  } else if (puzzleDefinition.areas) {
    puzzleDefinition.areas.forEach((area, index) => {
      for (const pos of area) {
        grid.cellmap.get2D(pos.x, pos.y).area_id = index;
      }
    });
  }

  const puzzle = new Puzzle(grid, puzzleType.renderSettings);

  return puzzle;
};
