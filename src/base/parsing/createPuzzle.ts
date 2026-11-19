import { Puzzle, PuzzleGrid, SquareGrid } from "..";
import { PuzzleVariable, PuzzleVariableValue } from "../PuzzleVariable";
import { PuzzleDefinition, PuzzleGridDefinition } from "./PuzzleDefinition";
import { PuzzleTypeDefinition } from "./PuzzleTypeDefinition";

export const createPuzzle = (
  puzzleType: PuzzleTypeDefinition,
  puzzleDefinition: PuzzleDefinition,
) => {
  const grid = createGrid(puzzleDefinition.grid);

  createAreas(grid, puzzleDefinition);

  const puzzle = new Puzzle(grid, puzzleType.renderSettings);

  if (puzzleType.inputs.hint_cells && puzzleDefinition.task) {
    addHints(grid, puzzleDefinition.task, puzzleType.inputs.hint_cells.empty_value);
  }

  createVariables(puzzle, puzzleType);
  if (puzzleType.inputs.given_cells && puzzleDefinition.task) {
    setGivens(grid, puzzleDefinition.task, puzzleType.inputs.given_cells.empty_value);
  }

  createConstraints(puzzle, puzzleType, puzzleDefinition);

  return puzzle;
};

const createGrid = (gridDefinition: PuzzleGridDefinition): PuzzleGrid => {
  switch (gridDefinition.type) {
    case "square":
      return SquareGrid.fromSize(gridDefinition.width, gridDefinition.height);
    default:
      throw new Error(`Unknown grid type: ${gridDefinition.type}`);
  }
};

const createAreas = (grid: PuzzleGrid, puzzleDefinition: PuzzleDefinition) => {
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
};

const addHints = (
  grid: PuzzleGrid,
  task: PuzzleVariableValue[][],
  emptyValue?: PuzzleVariableValue,
) => {
  grid.cellmap.map((cell, { x, y }) => {
    const hintValue = task[y]?.[x];
    if (hintValue !== undefined && hintValue !== emptyValue) {
      cell.hint = hintValue;
    }
  });
};

const createVariables = (puzzle: Puzzle, puzzleType: PuzzleTypeDefinition) => {
  for (const variableDef of puzzleType.variables) {
    const { on, value, required } = variableDef;
    const convertedValue = convertValueDefinition(value, puzzle);

    let variables: PuzzleVariable[] = [];
    if (on === "cells") {
      variables = puzzle.grid.cells;
      if (puzzleType.inputs.hint_cells && !puzzleType.inputs.hint_cells.variable_overlap) {
        variables = puzzle.grid.cells.filter((cell) => cell.hint === undefined);
      }
    } else if (on === "edges") {
      variables = puzzle.grid.edges;
    } else if (on === "inner_edges") {
      variables = puzzle.grid.edges.filter((edge) => edge.isInnerEdge());
    } else {
      throw new Error(`Unknown variable target: ${on}`);
    }

    for (const variable of variables) {
      puzzle.addVariable(variable, convertedValue, required);
    }
  }
};

const convertValueDefinition = (
  valueDef: string | PuzzleVariableValue[],
  puzzle: Puzzle,
): PuzzleVariableValue[] => {
  if (valueDef instanceof Array) {
    return valueDef;
  }

  switch (valueDef) {
    case "num_1_to_size":
      const length = puzzle.grid.width;
      return Array.from({ length }, (_, i) => i + 1);
    default:
      throw new Error(`Unknown value definition: ${valueDef}`);
  }
};

const setGivens = (
  grid: PuzzleGrid,
  task: PuzzleVariableValue[][],
  emptyValue?: PuzzleVariableValue,
) => {
  grid.cellmap.map((cell, { x, y }) => {
    const givenValue = task[y]?.[x];
    if (givenValue !== undefined && givenValue !== emptyValue) {
      cell.value = [givenValue];
    }
  });
};

const createConstraints = (
  puzzle: Puzzle,
  puzzleType: PuzzleTypeDefinition,
  puzzleDefinition: PuzzleDefinition,
) => {};
