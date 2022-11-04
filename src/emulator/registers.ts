import { HalfWord, Register } from "./types";
import { EMPTY_BYTE, EMPTY_HALF_WORD } from "./consants";
import cloneDeep from "lodash.clonedeep";
import isEqual from "lodash.isequal";

const readOnlyRegisterList: Register[] = ["RPC", "RSP"];

const registerData: Record<Register, HalfWord> = {
  RPC: EMPTY_HALF_WORD,
  RSP: EMPTY_HALF_WORD,
  R00: EMPTY_HALF_WORD,
  R01: EMPTY_HALF_WORD,
  R02: EMPTY_HALF_WORD,
  R03: EMPTY_HALF_WORD,
  R04: EMPTY_HALF_WORD,
  R05: EMPTY_HALF_WORD,
  R06: EMPTY_HALF_WORD,
  R07: EMPTY_HALF_WORD,
  R08: EMPTY_HALF_WORD,
  R09: EMPTY_HALF_WORD,
};

const registerBinaryCode: Record<Register, HalfWord> = {
  RPC: [EMPTY_BYTE, "00000001"],
  R00: [EMPTY_BYTE, "00000010"],
  R01: [EMPTY_BYTE, "00000011"],
  R02: [EMPTY_BYTE, "00000100"],
  R03: [EMPTY_BYTE, "00000101"],
  R04: [EMPTY_BYTE, "00000110"],
  R05: [EMPTY_BYTE, "00000111"],
  R06: [EMPTY_BYTE, "00001000"],
  R07: [EMPTY_BYTE, "00001001"],
  R08: [EMPTY_BYTE, "00001010"],
  R09: [EMPTY_BYTE, "00001011"],
  RSP: [EMPTY_BYTE, "00100000"],
};

const getRegisterNameByBinaryCode = (data: HalfWord): Register => {
  const x = Object.entries(registerBinaryCode).find(([_, registerBinaryCode]) =>
    isEqual(registerBinaryCode, data)
  );

  if (!x) {
    throw new Error("Unknown register " + data);
  }

  return x[0] as Register;
};

export const setRegisterValue = (register: Register | HalfWord, data: HalfWord, unsafe = false) => {
  const registerName =
    typeof register === "string" ? register : getRegisterNameByBinaryCode(register);
  if (readOnlyRegisterList.includes(registerName)) {
    if (!unsafe) {
      throw new Error(`try to set read-only register ${register}`);
    }
  }
  registerData[registerName] = data;
};

export const getRegisterValue = (register: Register | HalfWord) => {
  const registerName =
    typeof register === "string" ? register : getRegisterNameByBinaryCode(register);

  return registerData[registerName];
};

export const registerDump = (): typeof registerData => {
  return cloneDeep(registerData);
};
