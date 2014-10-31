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
var APP_NAME = "TSOS";
var APP_VERSION = "245";

var CPU_CLOCK_INTERVAL = 100;

var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;

// ADDED Interupts for assignment 2: Assume these constants to change!!!
var PCB_END_IRQ = 2;
var SYS_CALL_IRQ = 3;
var ILLEGAL_MEM_ACCESS = 4;
var ILLEGAL_OPCODE_IRQ = 5;
var STEP_CPU_IRQ = 6;
var EXEC_PROG_IRQ = 7;
var OUT_OF_MEM_IRQ = 8;
var CON_SWITCH_IRQ = 9;

// MEMORY STUFF
var MAX_MEM_SPACE = 256;
var MAX_MEM_LOCATIONS = 3;
var MAX_ADDRESS_SPACE = MAX_MEM_SPACE * MAX_MEM_LOCATIONS;

//
// Global Variables
//
var _CPU;
var _StepCPU = false;

var _OSclock = 0;

var _Mode = 0;

var _Canvas = null;
var _DrawingContext = null;
var _DefaultFontFamily = "sans";
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;

var _Trace = true;

// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;
var _KernelReadyQueue = null;

// Standard input and output
var _StdIn = null;
var _StdOut = null;

// UI
var _Console;
var _OsShell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID = null;

// Global variables for status canvas
var _Status = null;
var _StatusContext = null;

// Global variables for date/time canvas
var _DateTime = null;
var _DateTimeContext = null;

// Global for program text area
var _ProgramTextArea = null;

// for memory -- program loading stuff
var _Memory;
var _MemManager;
var _ActiveProgram;

// for display memory
var _MemoryDisplay = null;

// for CPU display
var _CPUdisplay = null;

// list for the programs, will hold programs
// TODO: Make it really a queue, I inializie it as
//       an array in kernel -> krnBootstrap()
//       also, consider renaming to be similar to
//       the ready queue's name since directed related
var _ResidentQueue = null;

// for pcb display
var _PCBdisplay = null;

// scheduling stuff
var _Quantum = 6000;
var _CPU_Schedule = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
