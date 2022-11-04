export type Bit = "1" | "0";
export type Byte = `${Bit}${Bit}${Bit}${Bit}${Bit}${Bit}${Bit}${Bit}`;
export type HalfWord = [Byte, Byte];
export type Instructions = "LOAD" | "STORE" | "SET" | "LOADH" | "STOREH" | "ADD" | "SUB" | "CJUMP";
export type Register =
  | "RPC"
  | "RSP"
  | "R00"
  | "R01"
  | "R02"
  | "R03"
  | "R04"
  | "R05"
  | "R06"
  | "R07"
  | "R08"
  | "R09";
//export type Word = [Byte, Byte, Byte, Byte];
export type Instruction = { opcode: Byte; operand1: HalfWord; operand2: HalfWord };
export type Operation = (
  operand1: Instruction["operand1"],
  operand2: Instruction["operand2"]
) => void;
