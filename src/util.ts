import { readRegister } from "./register";
import { getMemoryCell } from "./memory";
import { MAX_VALUE } from "./consants";
import {Instruction} from "./types";

export const hexToDec = (hex: string): number => parseInt(hex.replaceAll("#", ""), 16);
export const decToHex = (dec: number, withPrefix: boolean = true): string => "#" + dec.toString(16);

export const decToBin = (dec: number): string => dec.toString(2).padStart(Math.ceil(getBaseLog(2, MAX_VALUE)));
export const binToDec = (bin: string): number => parseInt(bin, 2);

export const boolToDec = (bool: boolean): number => (bool ? MAX_VALUE : 0);
export const decToBool = (dec: number): boolean => dec !== 0;

export const validateBinaryString = (str: string): void => {
  if (str.replaceAll("1", "").replaceAll("0", "").length > 0) {
    throw new Error("str is not a valid binary string");
  }
};

// detects if a given string is a hex value, a register address or a memory address and returns the dec value
export const readValue = (input: string): number => {
  if (input.startsWith("%")) {
    if (input.includes("R")) {
      return readRegister(input);
    }

    return getMemoryCell(hexToDec(input.replace("%", "")));
  }

  return hexToDec(input);
};

function getBaseLog(x: number, y: number) {
  return Math.log(y) / Math.log(x);
}
