# SWEET16 ASM Simulator — Full Instruction Set (Web, no install)

A browser-based **SWEET16** assembly editor + converter + step-by-step simulator implementing the **canonical full instruction set** from `instr_set_full.pdf` (`ADD`, `SUB`, `SHL`, `PSH`/`POP`, `STO [Rs], Rt`, `LDD Rd, [Rs]`, I/O, etc.). The UI matches **Sweeter16_RISC**; this project uses the **full** ISA only (no `MUL`/`DIV` extensions — those belong in **Sweet32_Complex**). Paste ASM, convert, and step through execution while watching registers, flags, stack, and memory.

This repo is **pure static HTML/CSS/JS** (no build step).

## Features

- **ASM editor + conversion**: convert input ASM to a memory-mapped program view.
- **Step execution**: run one instruction at a time (“Run Next”).
- **State visualization**:
  - **Registers** (R0–R7)
  - **Instruction Pointer (IP)** and **Stack Pointer (SP)**
  - **Carry Flag (CF)** and **Zero Flag (ZF)**
  - **Stack view** and **User memory**
- **Learning helpers**: tabs for **Sample Programs**, **Instruction Set**, and **User Manual**.

## Quick start (run locally)

### Option A: just open the file

Open `index.html` in your browser.

### Option B (recommended): run a tiny local web server

Some browsers behave better when opened via `http://` instead of `file://`.

```bash
cd Sweeter16
python3 -m http.server 8080
```

Then open `http://localhost:8080` and click `index.html`.

## How to use

1. **Paste ASM** into the left “Input ASM” textarea.
2. Click **Convert** to parse/convert the program into the memory-mapped view.
3. Click **Run Next** to execute one instruction at a time.
4. Watch updates in:
   - **Registers**, **IP/SP**, **CF/ZF**
   - **Stack**
   - **User Memory**
5. (Optional) Use **Sample Programs / Instruction Set / User Manual** tabs for reference.

### Adding user memory content

Use the “User Memory” input field format shown in the UI (example placeholder):

- `(8:10)` adds content `10` at memory address `0008H`

## Project structure

- `index.html`: main UI for the SWEETER16 simulator
- `style.css`: main UI styling
- `script.js`: UI wiring, tab switching, event handlers
- `assembler.js`: ASM parsing / conversion logic
- `simulator.js`: instruction execution + CPU state updates
- `Sample_program.js`: sample programs displayed in the UI
- `Sample_instructions.js`: instruction set information displayed in the UI
- `UserManual.js`: user manual content for the in-app “User Manual” tab
- `manual.html`, `style2.css`: standalone manual page
- `program.asm`: example ASM program

## Contributing / feedback

- **Issues**: bug reports and feature requests are welcome.
- **Pull requests**: also welcome; please keep changes focused and include a brief test/usage note.

## License

No license file is currently included in this repository. If you intend others to reuse/modify/distribute this project, consider adding a `LICENSE` file.

## Author

Dr. Gautam Dange  
Email: dange@fias.uni-frankfurt.de
