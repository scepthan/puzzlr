import { ConstraintCheck, Puzzle, PuzzleGrid, SquareGrid } from "..";
import { PuzzleVariable, PuzzleVariableValue } from "../PuzzleVariable";
import { PuzzleDefinition, PuzzleGridDefinition } from "./PuzzleDefinition";
import { PuzzleConstraintCheckDefinition, PuzzleTypeDefinition } from "./PuzzleTypeDefinition";

export const createPuzzle = (
  puzzleType: PuzzleTypeDefinition,
  puzzleDefinition: PuzzleDefinition,
) => {
  const grid = createGrid(puzzleDefinition.grid);

  createAreas(grid, puzzleDefinition);

  const puzzle = new Puzzle(grid, puzzleType.renderSettings);

  let hintsSet = false;
  if (puzzleType.inputs.hint_cells && puzzleDefinition.task) {
    addHints(grid, puzzleDefinition.task, puzzleType.inputs.hint_cells.empty_value);
    hintsSet = true;
  }

  createVariables(puzzle, puzzleType);
  if (puzzleType.inputs.given_cells && puzzleDefinition.task) {
    setGivens(grid, puzzleDefinition.task, puzzleType.inputs.given_cells.empty_value, !hintsSet);
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
    const convertedValue = parseValueDefinition(value, puzzle);

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

const parseValueDefinition = (
  valueDef: string | PuzzleVariableValue[],
  puzzle: Puzzle,
): PuzzleVariableValue[] => {
  if (valueDef instanceof Array) {
    return valueDef;
  }

  switch (valueDef) {
    case "binary":
      return [0, 1];

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
  setHints?: boolean,
) => {
  grid.cellmap.map((cell, { x, y }) => {
    const givenValue = task[y]?.[x];
    if (givenValue !== undefined && givenValue !== emptyValue) {
      cell.value = [givenValue];
      if (setHints) cell.hint = givenValue;
    }
  });
};

const createConstraints = (
  puzzle: Puzzle,
  puzzleType: PuzzleTypeDefinition,
  puzzleDefinition: PuzzleDefinition,
) => {
  for (const constraintDefinition of puzzleType.constraints) {
    const variableGroups = [];
    for (const variableGrouping of constraintDefinition.on.split(/, */)) {
      variableGroups.push(...parseVariableGrouping(puzzle, variableGrouping));
    }
    console.log(constraintDefinition.on, variableGroups);
  }
};

const parseVariableGrouping = (puzzle: Puzzle, groupName: string): PuzzleVariable[][] => {
  switch (groupName) {
    case "cells":
      return puzzle.grid.cells.map((cell) => [cell]);

    case "cell_lines":
      if (puzzle.grid.cellLines) return puzzle.grid.cellLines;
      throw new Error(`Could not determine cell lines for grid type ${puzzle.grid.type}`);

    case "areas":
      const areaMap = new Map<number, PuzzleVariable[]>();
      for (const cell of puzzle.grid.cells)
        if (cell.area_id !== null) {
          const area = areaMap.getOrInsert(cell.area_id, []);
          area.push(cell);
        }
      return Array.from(areaMap.values());

    default:
      throw new Error(`Unknown variable grouping: ${groupName}`);
  }
};

const parseConstraintCheck = <T extends PuzzleVariable>(
  check: PuzzleConstraintCheckDefinition,
  puzzle: Puzzle,
): ConstraintCheck<T> => {
  const { key, value } = convertConstraintCheckPart(check);

  switch (key) {
    case "contains_all":
      if (!(value instanceof Array) || value.length !== 2)
        throw new Error("`contains_all` constraint part needs exactly two arguments");

      const groupDefinition = value[0];
      if (typeof groupDefinition !== "string")
        throw new Error("Constraint check variable group definition must be a string");
      const group = parseConstraintCheckVariableGroup(groupDefinition);

      const valuesDefinition = value[1];
      if (typeof valuesDefinition === "object" && !(valuesDefinition instanceof Array))
        throw new Error("Constraint check value definition must be a number, shorthand, or array");
      const values = parseConstraintValueDefinition(valuesDefinition, puzzle);

      console.log(group, values);

      throw "Unimplemented";

    default:
      throw new Error(`Unknown constraint check: ${key}`);
  }
};

const parseConstraintCheckVariableGroup = (
  groupDefinition: string,
): ((variables: PuzzleVariable[]) => PuzzleVariable[]) => {
  switch (groupDefinition) {
    case "cells":
    case "vars":
      return (variables) => variables;

    case "cell":
    case "var":
      return (variables) => variables.slice(0, 1);

    default:
      throw new Error(`Unknown variable group definition: ${groupDefinition}`);
  }
};

const parseConstraintValueDefinition = (
  value: number | string | PuzzleVariableValue[],
  puzzle: Puzzle,
): PuzzleVariableValue | PuzzleVariableValue[] => {
  if (typeof value === "number") return value;
  return parseValueDefinition(value, puzzle);
};

const convertConstraintCheckPart = (part: PuzzleConstraintCheckDefinition) => {
  if (Object.keys(part).length !== 1)
    throw new Error("Puzzle constraint check part needs exactly one argument");

  const [key] = Object.keys(part);
  return { key, value: part[key] };
};
