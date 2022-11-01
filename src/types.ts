export type Operand = string;
export type InstructionName = "MOV" | "SUM" | "SUB" | "EQ" | "GT" | "LT" | "JUMP" | "AND" | "OR" | "NOT";
export type Instruction = {
  name: InstructionName;
  operands: Operand[];
};
