import { Byte, HalfWord } from "./types";

// absolutely static
export const BYTE_LENGTH = 8;
export const MAX_BYTE_VALUE = Math.pow(2, BYTE_LENGTH) - 1;
export const HALF_WORD_LENGTH = BYTE_LENGTH * 2;
export const MAX_HALF_WORD_VALUE = Math.pow(2, HALF_WORD_LENGTH) - 1;
export const EMPTY_BYTE: Byte = "00000000";
export const EMPTY_HALF_WORD: HalfWord = [EMPTY_BYTE, EMPTY_BYTE];

// more variable
export const MEMORY_SIZE = Math.pow(2, HALF_WORD_LENGTH);

// every instruction consists of 5 bytes, 1 for opcode, 2 for operand1, 2 for operand2
export const INSTRUCTION_BYTE_LENGTH = 5;
