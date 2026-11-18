import { PuzzleVariableValue } from "@/base/PuzzleVariable";

export interface PuzzleDefinition {
  type: string;
  grid: PuzzleGridDefinition;
  task?: PuzzleVariableValue[][];
  sums?: number[];
  boxes?: { width: number; height: number };
  areas?: CellCollections;
  lines?: { [type: string]: CellCollections };
}

export interface PuzzleGridDefinition {
  type: string;
  width: number;
  height: number;
}

type CellCollections = { x: number; y: number }[][];
