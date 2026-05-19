// Sample_program.js — examples using instr_set_full.pdf syntax only

const samplePrograms = [
    {
        name: "Basic Arithmetic (ADD / SUB)",
        code: `
LDL R2, #0x0005
LDL R3, #0x0003
ADD R4, R2, R3
SUB R5, R4, R2
HLT
`
    },
    {
        name: "Multiplication by Repeated Addition",
        code: `
LDL R2, #0x0005
LDL R3, #0x0004
LDL R5, #0x0000
LDL R4, #0x0001
LDL R7, #0x0000
LOOP:
    ADD R5, R5, R2
    SUB R3, R3, R4
    SBB R0, R3, R7
    JNZ LOOP
HLT
`
    },
    {
        name: "Logical Operations",
        code: `
LDL R2, #0xAAAA
LDL R3, #0x5555
OR R6, R2, R3
AND R7, R2, R3
LDL R4, #0x3333
LDL R5, #0x4444
XOR R2, R4, R5
NOT R3, R4
HLT
`
    },
    {
        name: "Shift and Rotate",
        code: `
LDL R2, #0x3333
SHL R2, R2
LDL R3, #0x5555
SHR R3, R3
LDL R4, #0x6666
ROL R4, R4
LDL R5, #0x3333
ROR R5, R5
HLT
`
    },
    {
        name: "Indirect Load and Store",
        code: `
LDL R2, #0x0008
LDL R3, #0x0042
STO [R2], R3
LDD R4, [R2]
HLT
`
    },
    {
        name: "Stack Operations",
        code: `
LDL R2, #0x0005
LDL R3, #0x0010
PSH R2
PSH R3
POP R3
POP R4
HLT
`
    },
    {
        name: "Full ISA Coverage Test (all mnemonics)",
        code: `
; Every instr_set_full.pdf mnemonic once (+ NOP, SEI, CLI).
; Expected at LAB_AFTER_RTI: R7=0xBE, R5/R6 mem=0xAA, Mem[0x30]=0xAA

JMP MAIN

SUB_RTS:
    LDL R7, #0x00BE
    RTS

DO_RTI:
    RTI

MAIN:
    NOP
    SEI
    CLI

    LDL R2, #0x00F0
    NOT R3, R2
    LDL R4, #0x0F0F
    LDL R5, #0x00FF
    XOR R6, R4, R5
    OR R7, R4, R5
    AND R2, R4, R5

    MKB R3, R2, #0
    INB R4, R3, #1
    SEB R5, R4, #2
    CLB R6, R5, #3

    LDL R2, #0x0008
    SHL R3, R2
    SHR R4, R3
    ROR R0
    ROL R5, R4
    ROR R1
    ROR R6, R5

    LDL R2, #0x000A
    LDL R3, #0x0003
    ADD R4, R2, R3
    SUB R5, R4, R3
    ROR R1
    ADC R6, R2, R3
    SBB R7, R6, R2

    LDLO R2, 0x30
    LDHI R2, 0x00
    LDL R3, #0x00AA
    STO [R2], R3
    LDD R4, [R2]

    OUT [R2], R4
    IN R5, [R2]

    PSH R4
    POP R6

    SUB R2, R2, R2
    JZ LAB_JZ_OK
    JMP DONE

LAB_JZ_OK:
    LDL R2, #0x0002
    LDL R3, #0x0001
    SUB R4, R2, R3
    JNZ LAB_JNZ_OK
    JMP DONE

LAB_JNZ_OK:
    SUB R2, R2, R2
    BRA B100, LAB_BRA_Z
    JMP DONE

LAB_BRA_Z:
    LDLO R2, 0xFFFF
    LDHI R2, 0xFFFF
    LDL R3, #0x0001
    ADD R4, R2, R3
    JC LAB_JC_OK
    JMP DONE

LAB_JC_OK:
    ROR R0
    JNC LAB_JNC_OK
    JMP DONE

LAB_JNC_OK:
    ROR R1
    ADD R4, R2, R3
    BRA B101, LAB_BRA_C
    JMP DONE

LAB_BRA_C:
    LDLO R2, 0x7FFF
    LDHI R2, 0x7FFF
    LDL R3, #0x0001
    ADD R4, R2, R3
    BRA B110, LAB_BRA_V
    JMP DONE

LAB_BRA_V:
    LDLO R2, 0
    LDHI R2, 0
    LDLO R3, 1
    LDHI R3, 0
    SUB R4, R2, R3
    BRA B111, LAB_BRA_N
    JMP DONE

LAB_BRA_N:
    BRA B000, LAB_BRA_U
    JMP DONE

LAB_BRA_U:
    JMP LAB_JS_CALL

LAB_JS_CALL:
    JS SUB_RTS

    LDL R6, #0x0005
    PSH R6
    JS DO_RTI

LAB_AFTER_RTI:
    HLT

DONE:
    HLT
`
    }
];

window.samplePrograms = samplePrograms;
