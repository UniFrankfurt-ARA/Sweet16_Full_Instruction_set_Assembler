// Sweet16 — canonical full instruction set (instr_set_full.pdf)
// Logic: NOT, XOR, OR, AND, MKB, INB, SEB, CLB
// Shift: SHL, SHR, ROL, ROR
// Arithmetic: SUB, ADD, SBB, ADC
// Load: LDL, LDH
// Memory: STO [rs], rt   LDD rd, [rs]
// I/O:    OUT [rs], rt   IN  rd, [rs]
// Stack:  PSH, POP
// Jumps:  JZ, JC, JNZ, JNC, JS, JMP, BRA, RTS, RTI, HLT
// Aliases (expanded in normalize): NOP, SEI, CLI

const instructionSet = {
    "NOT": { params: 2, types: ["R", "R"] },
    "XOR": { params: 3, types: ["R", "R", "R"] },
    "OR":  { params: 3, types: ["R", "R", "R"] },
    "AND": { params: 3, types: ["R", "R", "R"] },
    "MKB": { params: 3, types: ["R", "R", "B"] },
    "INB": { params: 3, types: ["R", "R", "B"] },
    "SEB": { params: 3, types: ["R", "R", "B"] },
    "CLB": { params: 3, types: ["R", "R", "B"] },
    "SHL": { params: 2, types: ["R", "R"] },
    "SHR": { params: 2, types: ["R", "R"] },
    "ROL": { params: 2, types: ["R", "R"] },
    "ROR": { params: 2, types: ["R", "R"] },
    "SUB": { params: 3, types: ["R", "R", "R"] },
    "ADD": { params: 3, types: ["R", "R", "R"] },
    "SBB": { params: 3, types: ["R", "R", "R"] },
    "ADC": { params: 3, types: ["R", "R", "R"] },
    "LDL": { params: 2, types: ["R", "C"] },
    "LDH": { params: 2, types: ["R", "C"] },
    "STO": { params: 2, types: ["R", "R"] },
    "LDD": { params: 2, types: ["R", "R"] },
    "OUT": { params: 2, types: ["R", "R"] },
    "IN":  { params: 2, types: ["R", "R"] },
    "PSH": { params: 1, types: ["R"] },
    "POP": { params: 1, types: ["R"] },
    "JZ":  { params: 1, types: ["AD"] },
    "JC":  { params: 1, types: ["AD"] },
    "JNZ": { params: 1, types: ["AD"] },
    "JNC": { params: 1, types: ["AD"] },
    "JS":  { params: 1, types: ["AD"] },
    "JMP": { params: 1, types: ["AD"] },
    "BRA": { params: 2, types: ["COND", "AD"] },
    "RTS": { params: 0, types: [] },
    "RTI": { params: 0, types: [] },
    "HLT": { params: 0, types: [] }
};

const cleanLine = (line) => {
    return line
        .split('--')[0]
        .split(';')[0]
        .trim()
        .replace(/,+/g, ' ')
        .replace(/\s+/g, ' ');
};

function parseBracketReg(tok) {
    const m = tok && tok.match(/^\[R([0-7])\]$/i);
    if (!m) return null;
    return parseInt(m[1], 10);
}

const normalizeInstruction = (line) => {
    if (!line) return line;
    if (line.endsWith(':')) return line;
    const parts = line.split(' ');
    let op = parts[0].toUpperCase();

    const p = parts.map((tok, i) => {
        if (i === 0) return op;
        return tok.replace(/^(r)([0-7])$/i, (_, _r, n) => 'R' + n);
    });

    if (op === 'NOP') return 'LDL R0 #0x00';
    if (op === 'SEI') return 'LDL R1 #0x01';
    if (op === 'CLI') return 'LDL R1 #0x00';

    if ((op === 'LDLO' || op === 'LDHI') && p[2]) {
        const raw = p[2].replace(/^#/, '');
        let full = 0;
        if (/^0[xX][0-9a-fA-F]+$/.test(raw)) full = parseInt(raw, 16) & 0xFFFF;
        else if (/^\d+$/.test(raw)) full = parseInt(raw, 10) & 0xFFFF;
        else return p.join(' ');
        const byte = op === 'LDLO' ? (full & 0xFF) : ((full >> 8) & 0xFF);
        const newOp = op === 'LDLO' ? 'LDL' : 'LDH';
        return `${newOp} ${p[1]} #0x${byte.toString(16).toUpperCase()}`;
    }

    // STO [Rs], Rt  →  STO Rs Rt
    if (op === 'STO' && p[1]) {
        const ptr = parseBracketReg(p[1]);
        if (ptr !== null && p[2]) return `STO R${ptr} ${p[2]}`;
    }

    // LDD Rd, [Rs]  →  LDD Rd Rs
    if (op === 'LDD' && p[2]) {
        const ptr = parseBracketReg(p[2]);
        if (ptr !== null) return `LDD ${p[1]} R${ptr}`;
    }

    // OUT [Rs], Rt  →  OUT Rs Rt
    if (op === 'OUT' && p[1]) {
        const ptr = parseBracketReg(p[1]);
        if (ptr !== null && p[2]) return `OUT R${ptr} ${p[2]}`;
    }

    // IN Rd, [Rs]  →  IN Rd Rs
    if (op === 'IN' && p[2]) {
        const ptr = parseBracketReg(p[2]);
        if (ptr !== null) return `IN ${p[1]} R${ptr}`;
    }

    // Single-operand shift/rotate → rd, rd
    if ((op === 'SHL' || op === 'SHR' || op === 'ROL' || op === 'ROR') && p.length === 2) {
        return `${op} ${p[1]} ${p[1]}`;
    }

    // ROL/ROR two-operand: keep rd, rs (spec form)
    if ((op === 'ROL' || op === 'ROR') && p.length === 3) return p.join(' ');

    return p.join(' ');
};

const parseOperand = (operand, type, labels) => {
    if (type === "R" && operand.match(/^R[0-7]$/)) {
        return parseInt(operand.slice(1), 10);
    }
    if (type === "C" && operand.match(/^#0x[0-9A-Fa-f]+$/)) {
        return parseInt(operand.slice(1), 16);
    }
    if (type === "C" && operand.match(/^#\d+$/)) {
        return parseInt(operand.slice(1), 10);
    }
    if (type === "C" && operand.match(/^0x[0-9A-Fa-f]+$/)) {
        return parseInt(operand, 16);
    }
    if (type === "B") {
        const raw = operand.replace(/^#/, '');
        let bit;
        if (/^0[xX][0-9a-fA-F]+$/.test(raw)) bit = parseInt(raw, 16);
        else if (/^\d+$/.test(raw)) bit = parseInt(raw, 10);
        else throw new Error(`Invalid bit index "${operand}"`);
        if (bit < 0 || bit > 15) throw new Error(`Bit index must be 0..15, got ${bit}`);
        return bit;
    }
    if (type === "AD" && labels[operand] !== undefined) {
        return labels[operand];
    }
    if (type === "AD" && operand.match(/^0x[0-9A-Fa-f]+$/)) {
        return parseInt(operand, 16);
    }
    if (type === "COND" && operand.match(/^B[01]{3}$/i)) {
        return parseInt(operand.slice(1), 2);
    }
    throw new Error(`Invalid operand "${operand}" for expected type: ${type}`);
};

const parseLine = (line, lineNumber, labels) => {
    const parts = line.split(' ');
    const op = parts[0].toUpperCase();

    const instruction = instructionSet[op];
    if (!instruction) {
        throw new Error(`Unknown instruction "${op}" on line ${lineNumber}.`);
    }

    const { params, types } = instruction;

    if (parts.length - 1 !== params) {
        throw new Error(`"${op}" expects ${params} operands but got ${parts.length - 1} on line ${lineNumber}.`);
    }

    const operands = parts.slice(1).map((operand, index) => {
        return parseOperand(operand, types[index], labels);
    });

    return { op, args: operands };
};

function assemble(input) {
    const rawLines = input.split('\n');

    const indexedLines = [];
    rawLines.forEach((raw, srcIdx) => {
        const cleaned = cleanLine(raw);
        if (!cleaned) return;
        const normalized = normalizeInstruction(cleaned);
        if (normalized) indexedLines.push({ normalized, srcIdx });
    });

    const labels = {};
    const instructions = [];
    const sourceMap = [];
    let currentAddress = 0;

    indexedLines.forEach(({ normalized }) => {
        if (normalized.endsWith(':')) {
            const label = normalized.slice(0, -1);
            if (labels[label] !== undefined) {
                throw new Error(`Duplicate label "${label}" found.`);
            }
            labels[label] = currentAddress;
        } else {
            currentAddress += 1;
        }
    });

    indexedLines.forEach(({ normalized, srcIdx }, index) => {
        if (!normalized.endsWith(':')) {
            try {
                const instruction = parseLine(normalized, index + 1, labels);

                if (instruction.op === 'BRA') {
                    const pcOfBRA = instructions.length;
                    const offset = instruction.args[1] - pcOfBRA;
                    if (offset < -128 || offset > 127) {
                        throw new Error(
                            `BRA target is too far (offset ${offset} instructions). ` +
                            `BRA can only reach -128..+127 instructions; use JMP for longer jumps.`
                        );
                    }
                }

                instructions.push(instruction);
                sourceMap.push(srcIdx);
            } catch (error) {
                throw new Error(`Error on line ${index + 1}: ${error.message}`);
            }
        }
    });

    instructions.sourceMap = sourceMap;
    return instructions;
}

window.assemble = assemble;
