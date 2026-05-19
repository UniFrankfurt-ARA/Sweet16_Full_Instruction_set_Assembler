# Instruction set reference

The simulator encodes 16-bit machine words per **`instr_set_full.tex`** (Sweet-16 full ISA bit table).

- **In this repo:** `instr_set_full.tex` (LaTeX source for the opcode table)
- **Also mirrored from teaching materials:** `Linux/teaching_ara2026/exercises/pool/S16_1_intro/instr_set_full.tex`

There is **no PDF checked into git**; the UI refers to `instr_set_full.pdf`, which is normally built from the `.tex` file, e.g.:

```bash
cd docs && pdflatex instr_set_full.tex
```

Encoder implementation: `../machineCode.js` (used by `simulator.js` machine-code column and hex export in `script.js`).
