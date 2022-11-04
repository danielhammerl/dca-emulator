import cloneDeep from "lodash.clonedeep";
import isEqual from "lodash.isequal";
import {
  EMPTY_HALF_WORD,
  HalfWord,
  Register,
  registerBinaryCode,
} from "@danielhammerl/dca-architecture";

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
