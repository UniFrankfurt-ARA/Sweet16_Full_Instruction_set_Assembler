/**
 * Sweet-16 full instruction set — 16-bit machine word encoder.
 * Bit layout matches instr_set_full (see docs/instr_set_full.tex in this repo;
 * also teaching_ara2026/exercises/pool/S16_1_intro/instr_set_full.tex).
 *
 * Registers R0–R7 only (rd[3], rs[3], rt[3] are encoded but zero for this ISA profile).
 *
 * @param {number} pc - Instruction address (for BRA PC-relative offset).
 * @param {string} op - Mnemonic (canonical form after assembler normalize).
 * @param {number[]} args - Parsed operand values from assemble().
 * @returns {number|null} 16-bit word, or null if unknown opcode.
 */
(function () {
  const OP5 = {
    NOT: 0b00000,
    XOR: 0b00001,
    OR: 0b00010,
    AND: 0b00011,
    MKB: 0b10000,
    INB: 0b10001,
    SEB: 0b10010,
    CLB: 0b10011,
    SHL: 0b00100,
    SHR: 0b00101,
    ROL: 0b10100,
    ROR: 0b10101,
    SUB: 0b00110,
    ADD: 0b00111,
    SBB: 0b10110,
    ADC: 0b10111,
    JZ: 0b01100,
    JC: 0b01101,
    JNZ: 0b11100,
    JNC: 0b11101,
    JS: 0b01110,
    JMP: 0b11110,
  };

  function mask16(w) {
    return w & 0xffff;
  }

  /** Three-register ALU / logic (XOR, OR, AND, SUB, ADD, SBB, ADC). */
  function encReg3(op5, rd, rs, rt) {
    let w = op5 << 11;
    w |= (rd & 7) << 8;
    w |= ((rd >> 3) & 1) << 7;
    w |= ((rt >> 3) & 1) << 6;
    w |= (rs & 7) << 3;
    w |= rt & 7;
    return mask16(w);
  }

  /** Bit-index ops (MKB, INB, SEB, CLB): third operand is bit 0..15. */
  function encBitOp(op5, rd, rs, bit) {
    let w = op5 << 11;
    w |= (rd & 7) << 8;
    w |= ((rd >> 3) & 1) << 7;
    w |= ((bit >> 3) & 1) << 6;
    w |= (rs & 7) << 3;
    w |= bit & 7;
    return mask16(w);
  }

  /** NOT, SHL, SHR, ROL, ROR — rd, rs form. */
  function encUnary(op5, rd, rs) {
    let w = op5 << 11;
    w |= (rd & 7) << 8;
    w |= ((rd >> 3) & 1) << 7;
    w |= (rs & 0xf) << 3;
    return mask16(w);
  }

  /** STO / OUT: Mem[rs]=rt or IO[rs]=rt (bit 9 distinguishes OUT). */
  function encMemStore(isOut, rs, rt) {
    let w = 0b01010 << 11;
    if (isOut) w |= 1 << 9;
    w |= ((rs >> 3) & 1) << 7;
    w |= ((rt >> 3) & 1) << 6;
    w |= (rs & 7) << 3;
    w |= rt & 7;
    return mask16(w);
  }

  /** LDD / IN: rd = Mem[rs] or rd = IO[rs] (bits 7 and 2 per instr_set_full). */
  function encMemLoad(isIn, rd, rs) {
    let w = 0b01011 << 11;
    w |= (rd & 7) << 8;
    w |= ((rd >> 3) & 1) << 7;
    if (isIn) w |= 1 << 7;
    w |= (rs & 0xf) << 3;
    w |= 1; // bit 0 = w
    if (isIn) w |= 1 << 2;
    return mask16(w);
  }

  function encLD(isHigh, rd, imm8) {
    let w = ((rd >> 3) & 1) << 15;
    w |= (isHigh ? 0b1001 : 0b1000) << 11;
    w |= (rd & 7) << 8;
    w |= imm8 & 0xff;
    return mask16(w);
  }

  function encAbsJump(op5, address) {
    return mask16((op5 << 11) | (address & 0x7ff));
  }

  function encBRA(pc, cond3, target) {
    const O = (target - pc) & 0xff;
    return mask16((0b11111 << 11) | ((cond3 & 7) << 8) | O);
  }

  function encPSH(rt) {
    let w = 0b11010 << 11;
    w |= ((rt >> 3) & 1) << 6;
    w |= rt & 7;
    return mask16(w);
  }

  function encPOP(rd) {
    let w = 0b11011 << 11;
    w |= (rd & 7) << 8;
    w |= ((rd >> 3) & 1) << 7;
    w |= 1; // bit 0 = w
    return mask16(w);
  }

  function encRTS() {
    return mask16((0b01111 << 11) | (1 << 0));
  }

  function encRTI() {
    return mask16((0b01111 << 11) | (1 << 10) | (1 << 7) | 1);
  }

  function encodeSweet16Word(pc, op, args) {
    const a = args || [];
    switch (op) {
      case "NOT":
        return encUnary(OP5.NOT, a[0], a.length > 1 ? a[1] : a[0]);
      case "XOR":
        return encReg3(OP5.XOR, a[0], a[1], a[2]);
      case "OR":
        return encReg3(OP5.OR, a[0], a[1], a[2]);
      case "AND":
        return encReg3(OP5.AND, a[0], a[1], a[2]);
      case "MKB":
        return encBitOp(OP5.MKB, a[0], a[1], a[2]);
      case "INB":
        return encBitOp(OP5.INB, a[0], a[1], a[2]);
      case "SEB":
        return encBitOp(OP5.SEB, a[0], a[1], a[2]);
      case "CLB":
        return encBitOp(OP5.CLB, a[0], a[1], a[2]);
      case "SHL":
        return encUnary(OP5.SHL, a[0], a[1]);
      case "SHR":
        return encUnary(OP5.SHR, a[0], a[1]);
      case "ROL":
        return encUnary(OP5.ROL, a[0], a.length > 1 ? a[1] : a[0]);
      case "ROR":
        return encUnary(OP5.ROR, a[0], a.length > 1 ? a[1] : a[0]);
      case "SUB":
        return encReg3(OP5.SUB, a[0], a[1], a[2]);
      case "ADD":
        return encReg3(OP5.ADD, a[0], a[1], a[2]);
      case "SBB":
        return encReg3(OP5.SBB, a[0], a[1], a[2]);
      case "ADC":
        return encReg3(OP5.ADC, a[0], a[1], a[2]);
      case "LDL":
        return encLD(false, a[0], a[1] & 0xff);
      case "LDH":
        return encLD(true, a[0], a[1] & 0xff);
      case "STO":
        return encMemStore(false, a[0], a[1]);
      case "OUT":
        return encMemStore(true, a[0], a[1]);
      case "LDD":
        return encMemLoad(false, a[0], a[1]);
      case "IN":
        return encMemLoad(true, a[0], a[1]);
      case "PSH":
        return encPSH(a[0]);
      case "POP":
        return encPOP(a[0]);
      case "JZ":
        return encAbsJump(OP5.JZ, a[0]);
      case "JC":
        return encAbsJump(OP5.JC, a[0]);
      case "JNZ":
        return encAbsJump(OP5.JNZ, a[0]);
      case "JNC":
        return encAbsJump(OP5.JNC, a[0]);
      case "JS":
        return encAbsJump(OP5.JS, a[0]);
      case "JMP":
        return encAbsJump(OP5.JMP, a[0]);
      case "BRA":
        return encBRA(pc, a[0], a[1]);
      case "RTS":
        return encRTS();
      case "RTI":
        return encRTI();
      case "HLT":
        return 0xf800;
      default:
        return null;
    }
  }

  function toHexWord(w) {
    return "0x" + (w & 0xffff).toString(16).toUpperCase().padStart(4, "0");
  }

  /** Placeholder in UI/export when an instruction has no Sweet-16 machine word yet. */
  const NO_MACHINE_CODE = "NONE";

  function formatMachineCodeWord(w) {
    return w == null ? NO_MACHINE_CODE : toHexWord(w);
  }

  if (typeof window !== "undefined") {
    window.encodeSweet16Word = encodeSweet16Word;
    window.sweet16ToHexWord = toHexWord;
    window.sweet16NoMachineCode = NO_MACHINE_CODE;
    window.formatSweet16MachineCode = formatMachineCodeWord;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      encodeSweet16Word,
      toHexWord,
      NO_MACHINE_CODE,
      formatMachineCodeWord,
    };
  }
})();
