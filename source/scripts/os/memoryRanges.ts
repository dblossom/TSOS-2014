
/* ------------
   MemoryRanges.ts

   A class to define variables needed for keeping track
   of a range of memory.
   
   Author: D. Blossom
   ------------ */
   
module TSOS {
    export class MemoryRange{
        constructor(public inuse: boolean = null,
                    public base: number = null,
                    public limit: number =  null) { }
    }
}   