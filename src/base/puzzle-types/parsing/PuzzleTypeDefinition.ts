import { PuzzleVariableValue } from "@/base/PuzzleVariable";

export interface PuzzleTypeDefinition {
  name: string;
  renderSettings: RenderSettings;
  inputs: PuzzleInputsDefinition;
  variables: PuzzleVariablesDefinition;
  constraints: PuzzleConstraintDefinition[];
}

export interface RenderSettings {
  defaultScale: number;
  funcs: string[];
}

export interface PuzzleInputsDefinition {
  areas?: boolean;
  boxes?: boolean;
  task_cells?: PuzzleTaskDefinition;
}
export interface PuzzleTaskDefinition {
  type: string;
  empty_value?: PuzzleVariableValue;
}

export interface PuzzleVariablesDefinition {
  required: PuzzleVariableDefinition[];
  optional?: PuzzleVariableDefinition[];
}
export interface PuzzleVariableDefinition {
  on: string;
  value: string | PuzzleVariableValue[];
}

export interface PuzzleConstraintDefinition {
  on: string;
  check: PuzzleConstraintCheckDefinition;
}
export interface PuzzleConstraintCheckDefinition {
  [key: string]: string | (PuzzleVariableValue | PuzzleConstraintCheckDefinition)[];
}
