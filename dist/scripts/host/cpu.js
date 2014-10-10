///<reference path="../globals.ts" />
/* ------------
CPU.ts
Requires global.ts.
Routines for the host CPU simulation, NOT for the OS itself.
In this manner, it's A LITTLE BIT like a hypervisor,
in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
TypeScript/JavaScript in both the host and client environments.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // So, let us read the next spot in memory at the current PC and execute it
            this.instructionSet(_MemManager.read(_CPU.PC));

            // let us update the CPU display
            this.initCPUDisplay();

            // update the current PCB with CPU's registers and such
            this.updatePCB(_ResidentQueue[TSOS.PCB.pid - 1]);

            // update the current PCB display <this is kinda a bug> but want to see it work
            _ResidentQueue[TSOS.PCB.pid - 1].setPCBDisplay();
        };

        /**
        * The instruction set we are using for this CPU mirrored from the 6502
        * It would seem logical to return a function, but for simplicity it will
        * just execute the command.
        *
        * Assume this will handle moving memory pointers around as we read memory.
        * ^ by "pointers" I am really saying -- inc the PC in the _CPU.
        *
        * TODO: does this need to be public? / rename too since it will execute?
        */
        Cpu.prototype.instructionSet = function (anyOpcode) {
            // convert the opcode to a number ...
            // here is where I am questioning if we should really be returning a string from memory!
            var opcode = parseInt(anyOpcode, 16);

            switch (opcode) {
                case 169:
                    // here is the exact point I am making! We already stored as number
                    // but since we are returning a string, we are converting again... STUPID!
                    _CPU.Acc = parseInt(_MemManager.read(++_CPU.PC), 16); // load ACC & inc PC
                    break;

                case 173:
                    var address = this.loadTwoBytes();
                    _CPU.Acc = (parseInt(_MemManager.read(address), 16)); // store in ACC.
                    break;

                case 141:
                    var address = this.loadTwoBytes();
                    _MemManager.write(address, _CPU.Acc.toString(16));
                    break;

                case 109:
                    var address = this.loadTwoBytes();
                    var num = parseInt(_MemManager.read(address), 16);
                    _CPU.Acc += num;
                    break;

                case 162:
                    _CPU.Xreg = parseInt(_MemManager.read(++_CPU.PC), 16);
                    break;

                case 174:
                    var address = this.loadTwoBytes();
                    _CPU.Xreg = parseInt(_MemManager.read(address), 16);
                    break;

                case 160:
                    _CPU.Yreg = parseInt(_MemManager.read(++_CPU.PC), 16);
                    break;

                case 172:
                    var address = this.loadTwoBytes();
                    _CPU.Yreg = parseInt(_MemManager.read(address), 16);
                    break;

                case 234:
                    break;

                case 0:
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PCB_END_IRQ, 0));
                    break;

                case 236:
                    var address = this.loadTwoBytes();
                    var data = parseInt(_MemManager.read(address), 16);
                    if (data === _CPU.Xreg) {
                        _CPU.Zflag = 1;
                    } else {
                        _CPU.Zflag = 0; // what if it used to be true?
                    }
                    break;

                case 208:
                    if (_CPU.Zflag === 0) {
                        var branch = parseInt(_MemManager.read(++_CPU.PC), 16);
                        _CPU.PC += branch;

                        // Are we branching past valid address space?
                        if (_CPU.PC > (MAX_MEM_SPACE - 1)) {
                            _CPU.PC = _CPU.PC - MAX_MEM_SPACE; // start over from begining
                        }
                        break;
                    } else {
                        break;
                    }

                case 238:
                    var address = this.loadTwoBytes();
                    var tempValue = parseInt(_MemManager.read(address), 16);
                    tempValue++; // add one to current value
                    _MemManager.write(address, tempValue.toString(16)); // store it back
                    break;

                case 255:
                    // put the sys call on the interrupt queue and pass the xreg as param.
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYS_CALL_IRQ, _CPU.Xreg));
                    break;

                default:
                    // call an interupt and pass the opcode to tell the user!
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ILLEGAL_OPCODE_IRQ, opcode));
            }
            _CPU.PC++; // inc past current location in memory to next to process.
        };

        /**
        * Method to initalize CPU display to all zeros
        * This ASSUMES CPU variables have been set!
        * TODO: rename to setCPUDisplay()
        */
        Cpu.prototype.initCPUDisplay = function () {
            document.getElementById('PC').innerHTML = _CPU.PC.toString();
            document.getElementById('ACC').innerHTML = _CPU.Acc.toString();
            document.getElementById('X').innerHTML = _CPU.Xreg.toString();
            document.getElementById('Y').innerHTML = _CPU.Yreg.toString();
            document.getElementById('Z').innerHTML = _CPU.Zflag.toString();
            document.getElementById('Status').innerHTML = _CPU.isExecuting.toString();
        };

        /**
        * Loads two bytes from memory little endian
        */
        Cpu.prototype.loadTwoBytes = function () {
            // so, it is the next 2 locations, we are little endian here...
            // load low number then high number then add together
            //I suppose A+B = B+A however for illistration ...
            var low = parseInt(_MemManager.read(++_CPU.PC), 16);
            var high = parseInt(_MemManager.read(++_CPU.PC), 16);
            return (low + high);
        };

        Cpu.prototype.updatePCB = function (pcb) {
            pcb.progCount = this.PC;
            pcb.ACC = this.Acc;
            pcb.X_reg = this.Xreg;
            pcb.Y_reg = this.Yreg;
            pcb.Z_flag = this.Zflag;
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
