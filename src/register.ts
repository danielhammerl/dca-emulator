import { MAX_VALUE } from "./consants";

const registers: Record<string, number> = {
  IP: 0, // instruction pointer
  SP: 0, // stack pointer
  RR: 0, // result register
} as const;

export const registerMap: Record<keyof typeof registers, number> = {
  IP: 1,
  SP: 2,
  RR: 3,
};

export function readRegister(register: string) {
  if (!(register in registers)) {
    throw new Error("unknown register " + register);
  }

  return registers[register];
}

export function setRegister(register: string, value: number) {
  if (!(register in registers)) {
    throw new Error("unknown register " + register);
  }

  if (value >= MAX_VALUE) {
    throw new Error("trying to set a register to more then MAX_VALUE");
  }

  registers[register] = value;
}
