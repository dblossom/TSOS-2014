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

                case 178:
                    // so, it is the next 2 locations, we are little endian here...
                    // load low number then high number then add together
                    // I suppose A+B = B+A however for illistration ...
                    var low = parseInt(_MemManager.read(++_CPU.PC), 16);
                    var high = parseInt(_MemManager.read(++_CPU.PC), 16);
                    _CPU.Acc = (low + high); // store in ACC.
                    break;

                case 141:
                    // this is the second time I am doing this ... time for a function ... ?
                    var low = parseInt(_MemManager.read(++_CPU.PC), 16);
                    var high = parseInt(_MemManager.read(++_CPU.PC), 16);
                    _MemManager.write((low + high), _CPU.Acc.toString(16));
            }
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
