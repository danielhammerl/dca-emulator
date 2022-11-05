import { getRegisterValue, registerDump, setRegisterValue } from "./registers";
import { decToHalfWord, halfWordToDec, isByte, logOnDebug } from "./util";
import { getMemoryCell, setMemoryCell } from "./memory";
import { getInstructionFromOpCode, InstructionMap } from "./instructions";
import isEqual from "lodash.isequal";
import { Instruction } from "@danielhammerl/dca-architecture";

export const run = (instructionsFromFile: string) => {
  logOnDebug("starting in debug mode");
  const instructionsFromFileAsArray = instructionsFromFile.split(" ");

  if (instructionsFromFileAsArray.length === 0 || instructionsFromFile.length === 0) {
    console.log("No instructions specified");
    return;
  }

  const instructionsByteLength = instructionsFromFileAsArray.length;

  instructionsFromFileAsArray.forEach((value, index) => {
    if (!isByte(value)) {
      throw new Error("Invalid instruction: " + value + " is not a byte representation");
    }

    setMemoryCell(index, value);
  });

  setRegisterValue("RSP", decToHalfWord(instructionsByteLength), true);
  let programFinished: boolean = false;

  while (!programFinished) {
    const currentInstruction = getRegisterValue("RPC");
    const currentInstructionIndex = halfWordToDec(currentInstruction);
    logOnDebug("Run instruction at: " + currentInstruction);
    const instruction: Instruction = {
      opcode: getMemoryCell(currentInstructionIndex),
      operand1: [
        getMemoryCell(currentInstructionIndex + 1),
        getMemoryCell(currentInstructionIndex + 2),
      ],
      operand2: [
        getMemoryCell(currentInstructionIndex + 3),
        getMemoryCell(currentInstructionIndex + 4),
      ],
    };
    logOnDebug("Instruction is " + JSON.stringify(instruction));

    const instructionName = getInstructionFromOpCode(instruction.opcode);
    try {
      InstructionMap[instructionName](instruction.operand1, instruction.operand2);
      logOnDebug("Instruction finished");
      logOnDebug("cpu dump:");
      logOnDebug(registerDump());
    } catch (e) {
      throw new Error(
        "Error while running instruction " + currentInstructionIndex + " with error " + e
      );
    }

    const nextInstruction = getRegisterValue("RPC");

    if (isEqual(nextInstruction, getRegisterValue("RSP"))) {
      programFinished = true;
      logOnDebug("Program finished");
    }
  }
};
