# Sweet16_Full_Instruction_set_Assembler — SWEET16 Simulator (Full Instruction Set)

**This project — FULL** (complete instruction set, including everything in RISC plus the rest): [https://unifrankfurt-ara.github.io/Sweet16_Full_Instruction_set_Assembler/](https://unifrankfurt-ara.github.io/Sweet16_Full_Instruction_set_Assembler/)

**Also available:**

- **RISC** (reduced instruction set for core teaching): [https://unifrankfurt-ara.github.io/Sweet16-ASM/](https://unifrankfurt-ara.github.io/Sweet16-ASM/)
- **EXTENDED** (full ISA + MUL, DIV, PSH/POP-style extras and more): [https://unifrankfurt-ara.github.io/Sweeter16_ExtendedPlus/](https://unifrankfurt-ara.github.io/Sweeter16_ExtendedPlus/)

Use **FULL** here for the canonical `instr_set_full` ISA. Switch to **RISC** for the smaller list, or **EXTENDED** for extra mnemonics.

---

## About this project (Full instruction set)

**Sweet16_Full_Instruction_set_Assembler** is a browser-based assembler and step-by-step simulator for the **canonical full SWEET16 instruction set** (`instr_set_full.pdf`). It implements everything in the reduced RISC list **and** the remaining instructions: arithmetic (`ADD`, `SUB`), shifts (`SHL`, `SHR`), single-bit operations (`MKB`, `INB`, `SEB`, `CLB`), memory and I/O with bracket syntax (`STO [Rs], Rt`, `LDD Rd, [Rs]`, `OUT`, `IN`), stack (`PSH`, `POP`), subroutine/interrupt returns (`RTS`, `RTI`), and more.

Pure static **HTML / CSS / JavaScript** — no build step.

### Full ISA highlights (vs RISC)

| Area | Examples in this project |
|------|---------------------------|
| Arithmetic | `ADD`, `SUB`, `ADC`, `SBB` |
| Shifts | `SHL`, `SHR`, `ROL`, `ROR` |
| Bit manipulation | `MKB`, `INB`, `SEB`, `CLB` |
| Memory / I/O | `STO`, `LDD`, `OUT`, `IN` |
| Stack | **`PSH`, `POP`** (hardware stack in data memory) |
| Jumps | `JZ`, `JC`, `JNZ`, `JNC`, `JS`, `JMP`, `BRA`, `HLT` |
| Aliases | `NOP`, `SEI`, `CLI` (expanded to `LDL` tricks) |

The **machine-code column** uses `machineCode.js` aligned with `docs/instr_set_full.tex` (LaTeX source of the opcode table). Build PDF locally: `cd docs && pdflatex instr_set_full.tex`.

### Main features

- ASM editor with `#DEF` preprocessor (`AliasResolver.js`)
- **Convert** + **Run Next** / **Run All** with register, flag, stack, and user-memory views
- Hex per instruction (`0x….`) for all full-ISA mnemonics
- Sample programs including **Full ISA Coverage** test
- EN/DE UI strings

### Quick start (local)

```bash
cd Sweet16_Full_Instruction_set_Assembler
python3 -m http.server 8080
```

Open [http://localhost:8080/index.html](http://localhost:8080/index.html).

Published demo: [https://unifrankfurt-ara.github.io/Sweet16_Full_Instruction_set_Assembler/](https://unifrankfurt-ara.github.io/Sweet16_Full_Instruction_set_Assembler/)

### How to use

1. Paste ASM into **Input ASM** (supports `STO [R2], R3`, `LDLO`/`LDHI`, labels, `#DEF`).
2. Click **Convert** to assemble.
3. **Run Next** to step; watch **IP**, **SP**, flags, stack, and **machine code**.
4. Use **Sample Programs / Instruction Set / User Manual** tabs for reference.
5. Copy machine-code column or export — lines without a hardware word are omitted from clipboard export if marked `NONE` (not used in full ISA when encoder is loaded).

### Project structure

| File | Role |
|------|------|
| `index.html` | Main UI |
| `AliasResolver.js` | `#DEF`, comments, label splitting |
| `assembler.js` | Full ISA parse + normalize |
| `machineCode.js` | 16-bit word encoder (`instr_set_full`) |
| `simulator.js` | Execution + hex column |
| `script.js` | UI, tabs, hex export |
| `docs/instr_set_full.tex` | Opcode / bit-layout reference |
| `Sample_*.js`, `i18n/` | Samples and translations |

### Relation to RISC and Extended

- **RISC project** omits `ADD`/`SUB`/stack/I/O bit-ops; uses `ADC`/`SBB` and teaching-specific `STR` idioms.
- **Extended project** adds this full set **plus** simulator-only instructions (`MUL`, `DIV`, `CMP`, `STOA`, …) — use Extended only when you need those extras.

### Contributing / feedback

Issues and pull requests welcome. Please test with the **Full ISA Coverage** sample when changing encoding.

### License

No `LICENSE` file is included yet. Add one if you plan redistribution.

### Author

**Dr. Gautam Dange**  
FIAS / Goethe University Frankfurt  
Email: dange@fias.uni-frankfurt.de
