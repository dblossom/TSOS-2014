/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global "CONSTANTS" (There is currently no const or final or readonly type annotation in TypeScript.)
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var APP_NAME: string    = "TSOS";   // 'cause Bob and I were at a loss for a better name. (and I suck at naming).
var APP_VERSION: string = "245";   // What did you expect? <-- nothing less but I changed it.

var CPU_CLOCK_INTERVAL: number = 100;   // This is in ms, or milliseconds, so 1000 = 1 second.

var TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                            // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ: number = 1;

// ADDED Interupts for assignment 2: Assume these constants to change!!!
var PCB_END_IRQ: number = 2; // a process completed normally.
var SYS_CALL_IRQ: number = 3; // a system call was made
var ILLEGAL_MEM_ACCESS: number = 4; // memory was accessed illegally TODO: rename with _IRQ at end
var ILLEGAL_OPCODE_IRQ: number = 5; // bad opcode passed.
var STEP_CPU_IRQ: number = 6; // an IRQ for step.
var EXEC_PROG_IRQ: number = 7; // loads a program from ReadyQueue to krnProcess to execute (only way for my step to work)

// MEMORY STUFF
var MAX_MEM_SPACE = 256;
var MAX_MEM_LOCATIONS = 3;
var MAX_ADDRESS_SPACE = MAX_MEM_SPACE * MAX_MEM_LOCATIONS;


//
// Global Variables
//
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _StepCPU: boolean = false; // do we want to step each instruction.

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas: HTMLCanvasElement = null;  // Initialized in hostInit().
var _DrawingContext = null;             // Initialized in hostInit().
var _DefaultFontFamily = "sans";        // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;              // Additional space added to font size when advancing a line.


var _Trace: boolean = true;  // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers: any[] = null;
var _KernelInputQueue = null;
var _KernelReadyQueue = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID: number = null;

// Global variables for status canvas
var _Status: HTMLCanvasElement = null;
var _StatusContext = null;

// Global variables for date/time canvas
var _DateTime: HTMLCanvasElement = null;
var _DateTimeContext = null;

// Global for program text area
var _ProgramTextArea: HTMLTextAreaElement = null;

// for memory -- program loading stuff
var _Memory: TSOS.Memory; // do I need this ?
var _MemManager: TSOS.MemoryManager;

// for display memory
var _MemoryDisplay: HTMLTableElement = null;

// for CPU display
var _CPUdisplay: HTMLTableElement = null;

// list for the programs, will hold programs
// TODO: Make it really a queue, I inializie it as
//       an array in kernel -> krnBootstrap()
//       also, consider renaming to be similar to
//       the ready queue's name since directed related
var _ResidentQueue = null;

// for pcb display
var _PCBdisplay: HTMLTableElement = null;

// scheduling stuff
var _Quantum:number = 6; // default quantum == 6

// For testing...
var _GLaDOS: any = null;
var Glados: any = null;

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
