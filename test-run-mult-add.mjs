#!/usr/bin/env node
/**
 * Headless assemble + run for S16_13 multiply-by-addition (Node 12+).
 */
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const asm = process.argv[2] || `#DEF MULT_20 = #0x0014;
#DEF MULT_A = #0x000A;
LDL R2, MULT_20
STO [R0], R2
LDL R3, MULT_A
STO [R1], R3
LDD R2, [R0]
LDD R3, [R1]
XOR R4, R4, R4
loop:
ADD R4, R4, R2
SUB R3, R3, R1
JNZ loop
STO [R0], R4
HLT`;

const sandbox = { console, window: null };
sandbox.window = sandbox;
vm.runInContext(fs.readFileSync(path.join(__dirname, 'AliasResolver.js'), 'utf8'), vm.createContext(sandbox));
vm.runInContext(fs.readFileSync(path.join(__dirname, 'assembler.js'), 'utf8'), vm.createContext(sandbox));

const resolved = sandbox.window.resolveAliasesWithMap(asm).resolved;
console.log('--- Resolved ASM ---\n' + resolved + '\n');

let program;
try {
  program = sandbox.window.assemble(resolved);
} catch (e) {
  console.error('ASSEMBLY FAILED:', e.message);
  process.exit(1);
}

console.log('Assembly OK:', program.length, 'instructions\n');
program.forEach((inst, i) => {
  console.log(`  ${String(i).padStart(2)}: ${inst.op.padEnd(4)} [${inst.args.join(', ')}]`);
});

const regs = new Uint16Array(8);
const mem = new Uint16Array(0x1000);
const u16 = (x) => x & 0xffff;
let zf = 0;
let ip = 0;
let halted = false;
let steps = 0;

const setZf = (v) => {
  zf = (u16(v) === 0) ? 1 : 0;
};
const fix01 = () => {
  regs[0] = 0;
  regs[1] = 1;
};

while (!halted && ip < program.length && steps < 500) {
  const { op, args } = program[ip++];
  steps++;
  switch (op) {
    case 'LDL':
      regs[args[0]] = u16((regs[args[0]] & 0xff00) | args[1]);
      break;
    case 'STO':
      mem[regs[args[0]]] = regs[args[1]];
      break;
    case 'LDD':
      regs[args[0]] = mem[regs[args[1]]];
      break;
    case 'XOR':
      regs[args[0]] = u16(regs[args[1]] ^ regs[args[2]]);
      setZf(regs[args[0]]);
      break;
    case 'ADD':
      regs[args[0]] = u16(regs[args[1]] + regs[args[2]]);
      setZf(regs[args[0]]);
      break;
    case 'SUB':
      regs[args[0]] = u16(regs[args[1]] - regs[args[2]]);
      setZf(regs[args[0]]);
      break;
    case 'JNZ':
      if (zf === 0) ip = args[0];
      break;
    case 'HLT':
      halted = true;
      break;
    default:
      console.error('Unimplemented:', op);
      process.exit(1);
  }
  fix01();
}

console.log('\nAfter', steps, 'steps:');
console.log('  halted:', halted, '  ZF:', zf);
console.log('  R2:', '0x' + regs[2].toString(16).toUpperCase());
console.log('  R3:', '0x' + regs[3].toString(16).toUpperCase());
console.log('  R4:', '0x' + regs[4].toString(16).toUpperCase());
console.log('  Mem[00]:', '0x' + mem[0].toString(16).toUpperCase(), '(expect 0x00C8)');

const ok = halted && mem[0] === 0x00c8;
console.log(ok ? '\nPASS' : '\nFAIL');
process.exit(ok ? 0 : 1);
