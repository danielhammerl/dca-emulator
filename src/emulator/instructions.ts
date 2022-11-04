import { Byte, HalfWord, Instruction, Instructions, Operation } from "./types";
import { getRegisterValue, setRegisterValue } from "./registers";
import { getMemoryCell, setMemoryCell } from "./memory";
import { EMPTY_BYTE, INSTRUCTION_BYTE_LENGTH } from "./consants";
import { decToHalfWord, halfWordToDec } from "./util";
import isEqual from "lodash.isequal";

export const InstructionMap: Record<Instructions, Operation> = {
  LOAD: (operand1, operand2) => {
    const memoryAddress = getRegisterValue(operand1);
    const valueInMemory = getMemoryCell(memoryAddress);
    setRegisterValue(operand2, [EMPTY_BYTE, valueInMemory]);
    loadNextInstruction();
  },
  STORE: (operand1, operand2) => {
    const data = getRegisterValue(operand1)[1];
    const memoryAddress = getRegisterValue(operand2);
    setMemoryCell(memoryAddress, data);
    loadNextInstruction();
  },
  SET: (operand1, operand2) => {
    setRegisterValue(operand1, operand2);
    loadNextInstruction();
  },
  LOADH: (operand1, operand2) => {
    const memoryAddressStartIndex = halfWordToDec(getRegisterValue(operand1));
    const valueInMemory: HalfWord = [
      getMemoryCell(memoryAddressStartIndex),
      getMemoryCell(memoryAddressStartIndex + 1),
    ];
    setRegisterValue(operand2, valueInMemory);
    loadNextInstruction();
  },
  STOREH: (operand1, operand2) => {
    const data = getRegisterValue(operand1);
    const memoryAddressStartIndex = halfWordToDec(getRegisterValue(operand2));
    setMemoryCell(memoryAddressStartIndex, data[0]);
    setMemoryCell(memoryAddressStartIndex + 1, data[1]);
    loadNextInstruction();
  },
  ADD: (operand1, operand2) => {
    const value1: number = halfWordToDec(getRegisterValue(operand1));
    const value2: number = halfWordToDec(getRegisterValue(operand2));
    const result = value1 + value2;
    setRegisterValue(operand1, decToHalfWord(result));
    loadNextInstruction();
  },
  SUB: (operand1, operand2) => {
    const minuend: number = halfWordToDec(getRegisterValue(operand1));
    const subtrahend: number = halfWordToDec(getRegisterValue(operand2));
    const result = minuend - subtrahend;
    setRegisterValue(operand1, decToHalfWord(result));
    loadNextInstruction();
  },
  CJUMP: (operand1, operand2) => {
    const jumpTo = getRegisterValue(operand1);
    const doJump = halfWordToDec(getRegisterValue(operand2)) === 0;

    if (doJump) {
      setRegisterValue("RPC", jumpTo, true);
    }
  },
};

export const loadNextInstruction = () => {
  const currentInstruction = getRegisterValue("RPC");
  const currentInstructionIndex = halfWordToDec(currentInstruction);
  const nextInstructionIndex = currentInstructionIndex + INSTRUCTION_BYTE_LENGTH;
  const nextInstruction = decToHalfWord(nextInstructionIndex);
  setRegisterValue("RPC", nextInstruction, true);
};

export const InstructionBinaryMap: Record<Instructions, Byte> = {
  LOAD: "00000001",
  STORE: "00000010",
  SET: "00000011",
  LOADH: "00000100",
  STOREH: "00000101",
  ADD: "00000110",
  SUB: "00000111",
  CJUMP: "00001000",
};

export const getInstructionFromOpCode = (opcode: Byte): Instructions => {
  const instruction = Object.entries(InstructionBinaryMap).find(([_, instructionOpCode]) =>
    isEqual(opcode, instructionOpCode)
  );

  if (!instruction) {
    throw new Error("Invalid opcode " + opcode);
  }

  return instruction[0] as Instructions;
};
