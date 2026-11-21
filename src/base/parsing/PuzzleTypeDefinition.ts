import { PuzzleVariableValue } from "@/base/PuzzleVariable";

export interface PuzzleTypeDefinition {
  name: string;
  renderSettings: RenderSettings;
  inputs: PuzzleInputsDefinition;
  variables: PuzzleVariableDefinition[];
  constraints: PuzzleConstraintDefinition[];
}

export interface RenderSettings {
  defaultScale: number;
  funcs: string[];
}

export interface PuzzleInputsDefinition {
  areas?: boolean;
  boxes?: boolean;
  cell_hints?: PuzzleCellHintsDefinition;
  cell_givens?: PuzzleGivensDefinition;
  border_hints?: PuzzleBorderHintsDefinition;
  globals?: PuzzleGlobalsDefinition;
}
export interface PuzzleCellHintsDefinition {
  type: string;
  empty_value?: PuzzleVariableValue;
  variable_overlap?: boolean;
}
export interface PuzzleGivensDefinition {
  type: string;
  empty_value?: PuzzleVariableValue;
}
export interface PuzzleBorderHintsDefinition {
  type: string;
  empty_value?: PuzzleVariableValue;
  strategy: "top_left" | "surround";
}

export interface PuzzleGlobalsDefinition {
  [key: string]: string;
}

export interface PuzzleVariableDefinition {
  on: string | string[];
  value: string | PuzzleVariableValue[];
  required?: boolean;
}

export interface PuzzleConstraintDefinition {
  on: string | string[];
  check: PuzzleConstraintCheckDefinition;
}
export interface PuzzleConstraintCheckDefinition {
  [key: string]:
    | string
    | (PuzzleVariableValue | PuzzleVariableValue[] | PuzzleConstraintCheckDefinition)[];
}
