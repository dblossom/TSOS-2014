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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }
        
        /**
         * The instruction set we are using for this CPU mirrored from the 6502
         * It would seem logical to return a function, but for simplicity it will
         * just execute the command.
         *
         * Assume this will handle moving memory pointers around as we read memory.
         *
         * TODO: does this need to be public? / rename too since it will execute?
         */
         public instructionSet(anyOpcode:string):void{
         
             // convert the opcode to a number ... 
             // here is where I am questioning if we should really be returning a string from memory!
             var opcode:number = parseInt(anyOpcode, 16);
             
             // what to do with the opcode
             switch(opcode){
                 
                 //scase
                 
             }
         
         }
    }
}
