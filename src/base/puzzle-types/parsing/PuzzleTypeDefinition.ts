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
  hint_cells?: PuzzleHintsDefinition;
  given_cells?: PuzzleGivensDefinition;
}
export interface PuzzleHintsDefinition {
  type: string;
  empty_value?: PuzzleVariableValue;
  variable_overlap?: boolean;
}
export interface PuzzleGivensDefinition {
  type: string;
  empty_value?: PuzzleVariableValue;
}

export interface PuzzleVariableDefinition {
  on: string;
  value: string | PuzzleVariableValue[];
  required?: boolean;
}

export interface PuzzleConstraintDefinition {
  on: string;
  check: PuzzleConstraintCheckDefinition;
}
export interface PuzzleConstraintCheckDefinition {
  [key: string]: string | (PuzzleVariableValue | PuzzleConstraintCheckDefinition)[];
}
