///<reference path="../globals.ts" />
/* ------------
     harddrive.ts
    
     HardDrive a representation of a physical disk "hardware"

     Requires globals.ts (actually ... )
     
     Author: D. Blossom

     ------------ */
     
module TSOS{
    export class HardDrive{
        constructor(public harddrive = window.sessionStorage){}
        
        public write(tsb:string, data:string){
            this.harddrive.setItem(tsb, data);
        }
        
        public read(tsb:string):string{
            return this.harddrive.getItem(tsb);
        }
    }

}