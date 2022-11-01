import { setMemoryCell } from "./memory";
import {binToDec, boolToDec, decToBin, decToHex, hexToDec, readValue} from "./util";
import { Instruction, InstructionName, Operand } from "./types";
import { setRegister } from "./register";
import { readOperandFlags } from "./operandFlags";

const instructionsAsNumberMap: Record<InstructionName, number> = {
  MOV: 1,
  SUM: 2,
  SUB: 3,
  EQ: 4,
  GT: 5,
  LT: 6,
  JUMP: 7,
  AND: 8,
  OR: 9,
  NOT: 10,
};

function convertDataToInstruction(data: number[]): Instruction {
  const [opCode, operand1, operand2, operandFlags] = data;

  const name = Object.entries(instructionsAsNumberMap).find(([_, value]) => opCode === value)?.[0] as
    | InstructionName
    | undefined;

  if (name === undefined) {
    throw new Error("Unknown opCode " + data[0]);
  }

  const { first, second } = readOperandFlags(operandFlags);
  const operands = [];
  operands[0] = first === 'value' ? decToHex(operand1) :
  return {
    name,
  };
}

const instructionMap: Record<InstructionName, (operands: Operand[]) => void> = {
  MOV: (operands) => {
    if (operands.length !== 2) {
      throw new Error(`MOV requires 2 operands`);
    }

    const [source, destination] = operands;

    setMemoryCell(hexToDec(destination), readValue(source));
  },
  SUM: (operands) => {
    if (operands.length !== 2) {
      throw new Error(`SUM requires 2 operands`);
    }

    const [sum1, sum2] = operands;
    const result = readValue(sum1) + readValue(sum2);
    setRegister("RR", result);
  },
  SUB: (operands) => {
    if (operands.length !== 2) {
      throw new Error(`SUB requires 2 operands`);
    }

    const [value1, value2] = operands;
    const result = readValue(value2) - readValue(value1);
    setRegister("RR", result);
  },
  EQ: (operands) => {
    if (operands.length !== 2) {
      throw new Error(`EQ requires 2 operands`);
    }

    const [value1, value2] = operands;
    const result = readValue(value1) === readValue(value2);

    setRegister("RR", boolToDec(result));
  },
  GT: (operands) => {
    if (operands.length !== 2) {
      throw new Error(`GT requires 2 operands`);
    }

    const [value1, value2] = operands;
    const result = readValue(value1) > readValue(value2);

    setRegister("RR", boolToDec(result));
  },
  LT: (operands) => {
    if (operands.length !== 2) {
      throw new Error(`LT requires 2 operands`);
    }

    const [value1, value2] = operands;
    const result = readValue(value1) < readValue(value2);

    setRegister("RR", boolToDec(result));
  },
  JUMP: (operands) => {
    if (operands.length !== 1) {
      throw new Error(`LT requires 1 operands`);
    }

    setRegister("IP", readValue(operands[0]));
  },
  AND: (operands) => {
    if (operands.length !== 2) {
      throw new Error(`AND requires 2 operands`);
    }

    const value1 = decToBin(readValue(operands[0]));
    const value2 = decToBin(readValue(operands[1]));

    let result = "";

    for (let i = 0; i < value1.length; i++) {
      result += value1[i] === "1" && value2[i] === "1" ? "1" : "0";
    }

    setRegister("RR", binToDec(result));
  },
  OR: (operands) => {
    if (operands.length !== 2) {
      throw new Error(`AND requires 2 operands`);
    }

    const value1 = decToBin(readValue(operands[0]));
    const value2 = decToBin(readValue(operands[1]));

    let result = "";

    for (let i = 0; i < value1.length; i++) {
      result += value1[i] === "1" || value2[i] === "1" ? "1" : "0";
    }

    setRegister("RR", binToDec(result));
  },
  NOT: (operands) => {
    if (operands.length !== 1) {
      throw new Error(`NOT requires 1 operands`);
    }

    const value1 = decToBin(readValue(operands[0]));

    let result = "";

    for (let i = 0; i < value1.length; i++) {
      result += value1[i] === "1" ? "0" : "1";
    }

    setRegister("RR", binToDec(result));
  },
};

export function runInstruction(instruction: Instruction) {
  const { name, operands } = instruction;
  try {
    instructionMap[name](operands);
  } catch (e: any) {
    throw new Error(
      "Error running instruction " + [name, ...operands].join(",") + ". Following error occured: " + e?.toString()
    );
  }
}
