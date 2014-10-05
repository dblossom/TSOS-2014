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
            
            this.instructionSet(_MemManager.read(_CPU.PC));
            this.initCPUDisplay();
            _MemManager.displayMemoryContents();
            
        }
        
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
         public instructionSet(anyOpcode:string):void{
         
             // convert the opcode to a number ... 
             // here is where I am questioning if we should really be returning a string from memory!
             var opcode:number = parseInt(anyOpcode, 16);        
             // what to do with the opcode
             // these will be laid out in the same order as the documentation
             switch(opcode){

                 case 169: // A9 - load the accumulator with a constant
                                // here is the exact point I am making! We already stored as number
                                // but since we are returning a string, we are converting again... STUPID!
                     _CPU.Acc = parseInt(_MemManager.read(++_CPU.PC),16); // load ACC & inc PC
                     break;
                     
                 case 173: // AD - load the accumulator from memory
                     var address:number = this.loadTwoBytes();
                     _CPU.Acc = (parseInt(_MemManager.read(address), 16)); // store in ACC.
                     break;
                     
                 case 141: // 8D - store the accumulator in memory (OH BOY)
                     var address:number = this.loadTwoBytes();
                     _MemManager.write(address, _CPU.Acc.toString(16));
                     break;
                     
                 case 109: // 6D - add with a carry
                     var address:number = this.loadTwoBytes();
                     var num:number = parseInt(_MemManager.read(address),16);    
                     _CPU.Acc += num;
                     break;
                     
                 case 162: // A2 - load X reg with constant
                     _CPU.Xreg = parseInt(_MemManager.read(++_CPU.PC),16);
                     break;
                     
                 case 174: // AE - load x reg from memory
                     var address:number = this.loadTwoBytes();
                     _CPU.Xreg = parseInt(_MemManager.read(address),16);
                     break;
                     
                 case 160: // A0 - load y reg with constant
                     _CPU.Yreg = parseInt(_MemManager.read(++_CPU.PC), 16);
                     break;
                     
                 case 172: // AC - load y reg from memory
                     var address:number = this.loadTwoBytes();
                     _CPU.Yreg = parseInt(_MemManager.read(address), 16);
                     break;
                     
                 case 234: // EA - no op
                     break; // yep, just keep on moving...
                     
                 case 0: // parseInt("00",16) returns 0. -> Break (system call)
                     _KernelInterruptQueue.enqueue(new Interrupt(PCB_END_IRQ, 0));
                     break; // ha ha a break for a break ...
                     
                 case 236: // EC - compare a byte in memory to X reg set Z flag if equal 
                     var address:number = this.loadTwoBytes();
                     var data:number = parseInt(_MemManager.read(address), 16);
                     if(data === _CPU.Xreg){
                         _CPU.Zflag = 1;
                     }else{
                         _CPU.Zflag = 0; // what if it used to be true?
                     }
                     break;
                 
                 case 208: // D0 - Branch X bytes if z flag = 0
                     if(_CPU.Zflag === 0){
                         var branch:number = parseInt(_MemManager.read(++_CPU.PC),16);
                         _CPU.PC += branch;
                         break;
                     }else{ // zflag is 1
                         break;
                     }
                     
                 case 238: // EE - Increment the value of a byte
                     var address:number = parseInt(_MemManager.read(++_CPU.PC),16);
                     var tempValue:number = parseInt(_MemManager.read(address),16);
                     tempValue++;
                     _MemManager.write(address,tempValue.toString(16));
                     break;
                     
                 case 255: // FF - System Call
                     _KernelInterruptQueue.enqueue(new Interrupt(SYS_CALL_IRQ, _CPU.Xreg));
                     break;
             }
             _CPU.PC++;
         
         }
        /**
         * Method to initalize CPU display to all zeros
         * This ASSUMES CPU variables have been set!
         * TODO: rename to setCPUDisplay()
         */
         public initCPUDisplay():void{
             document.getElementById('PC').innerHTML = _CPU.PC.toString();
             document.getElementById('ACC').innerHTML = _CPU.Acc.toString();
             document.getElementById('X').innerHTML = _CPU.Xreg.toString();
             document.getElementById('Y').innerHTML = _CPU.Yreg.toString();
             document.getElementById('Z').innerHTML = _CPU.Zflag.toString();
             document.getElementById('Status').innerHTML = _CPU.isExecuting.toString();
         }
         
         /**
          * Loads two bytes from memory little endian
          */
          private loadTwoBytes():number{
              // so, it is the next 2 locations, we are little endian here...
              // load low number then high number then add together
              //I suppose A+B = B+A however for illistration ...  
              var low:number = parseInt(_MemManager.read(++_CPU.PC),16); // load byte 1, inc PC
              var high:number = parseInt(_MemManager.read(++_CPU.PC),16); // load byte 2, inc PC
              return (low+high);
          }
         
    }
}
