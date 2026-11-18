import { Puzzle } from "@/base";
import { SquareGrid } from "@/base/grids";
const createGrid = (gridDefinition) => {
    switch (gridDefinition.type) {
        case "square":
            return SquareGrid.fromSize(gridDefinition.width, gridDefinition.height);
        default:
            throw new Error(`Unknown grid type: ${gridDefinition.type}`);
    }
};
const createAreas = (grid, puzzleDefinition) => {
    if (puzzleDefinition.boxes) {
        const { width, height } = puzzleDefinition.boxes;
        grid.cellmap.map((cell, { x, y }) => {
            cell.area_id = ((x / width) | 0) + height * ((y / height) | 0);
        });
    }
    else if (puzzleDefinition.areas) {
        puzzleDefinition.areas.forEach((area, index) => {
            for (const pos of area) {
                grid.cellmap.get2D(pos.x, pos.y).area_id = index;
            }
        });
    }
};
const addHints = (grid, task, emptyValue) => {
    grid.cellmap.map((cell, { x, y }) => {
        const hintValue = task[y]?.[x];
        if (hintValue !== undefined && hintValue !== emptyValue) {
            cell.hint = hintValue;
        }
    });
};
const convertValueDefinition = (valueDef, puzzle) => {
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
const createVariables = (puzzle, puzzleType) => {
    for (const variableDef of puzzleType.variables) {
        const { on, value, required } = variableDef;
        const convertedValue = convertValueDefinition(value, puzzle);
        let variables = [];
        if (on === "cells") {
            variables = puzzle.grid.cells;
            if (puzzleType.inputs.hint_cells && !puzzleType.inputs.hint_cells.variable_overlap) {
                variables = puzzle.grid.cells.filter((cell) => cell.hint !== undefined);
            }
        }
        else if (on === "edges") {
            variables = puzzle.grid.edges;
        }
        else if (on === "inner_edges") {
            variables = puzzle.grid.edges.filter((edge) => edge.isInnerEdge());
        }
        else {
            throw new Error(`Unknown variable target: ${on}`);
        }
        for (const variable of variables) {
            puzzle.addVariable(variable, convertedValue, required);
        }
    }
};
export const createPuzzle = (puzzleType, puzzleDefinition) => {
    const grid = createGrid(puzzleDefinition.grid);
    createAreas(grid, puzzleDefinition);
    const puzzle = new Puzzle(grid, puzzleType.renderSettings);
    if (puzzleType.inputs.hint_cells && puzzleDefinition.task) {
        addHints(grid, puzzleDefinition.task, puzzleType.inputs.hint_cells.empty_value);
    }
    createVariables(puzzle, puzzleType);
    return puzzle;
};
