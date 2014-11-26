/* ------------
   file.ts

   A class to define variables needed for keeping track
   of filenames and their data locations
   
   Author: D. Blossom
   ------------ */
   
module TSOS {
    export class File{
        constructor(public name: string = null,
                    public tsb: string = null,
                    public tsbData: string = null) { }
    }
}   