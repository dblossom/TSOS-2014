/* -------------------------
    pcb.ts
       
    A process control block
    
    Keeps track of a processes current state.
    
    Author: D. Blossom
    ------------------------ */
    
module TSOS{

    export enum State{ 
            NEW, // new = 0
            RUNNING, // running = 1
            TERMINATED, // terminated = 2
            WAITING, // waiting = 3
            READY // ready = 4
    }

    export class PCB{
    
        // we need to increment everytime
        public static pid:number = 0;
        
        // CPU State information
        // kept var names similar to CPU with slight difference for sanity.
        public progCount: number = 0;
        public ACC: number = 0;
        public X_reg: number = 0;
        public Y_reg: number = 0;
        public Z_flag: number = 0;
        public currentState: State; 
        
        // base and limit information
        public base: number;
        public limit: number;
        
        constructor(base:number, limit:number){
            // increment the pid everytime we create a PCB
            // so we do not want to start at zero but rather
            // whatever the next number will be.
            PCB.pid++;
            
            // mark the base and limit
            this.base = base;
            this.limit = limit;
            this.currentState = State.NEW;
        }
        
        /**
         * Method to initalize PCB display to all zeros
         * This ASSUMES PCB variables have been set!
         */
         public setPCBDisplay(tblElement: HTMLTableElement):void{
             
             // for some reason, this seems to work best when we first set to "null"
             var row = null;
             // get the "active" row, which will always be row 1, row 0 is reserved for header
             row = tblElement.rows[1];
             
             // get the cells within row 1.
             var cellsInRow = null;
             cellsInRow = row.cells;
         
             // set the cell with the new state information
             // the order matters here!
             cellsInRow[0].innerHTML = (PCB.pid - 1).toString();
             cellsInRow[1].innerHTML = this.base.toString();
             cellsInRow[2].innerHTML = this.limit.toString();
             cellsInRow[3].innerHTML = State[this.currentState].toString();
             cellsInRow[4].innerHTML = this.progCount.toString();
             cellsInRow[5].innerHTML = this.ACC.toString();
             cellsInRow[6].innerHTML = this.X_reg.toString();
             cellsInRow[7].innerHTML = this.Y_reg.toString();
             cellsInRow[8].innerHTML = this.Z_flag.toString();
         }
         
         /**
          * Will add a new row the the table for display of PCB information
          */
         public pcbNewRow(tblElement: HTMLTableElement):void{
             // only seems to work if we create a null first ... (?)
             var row = null;
             // insert a row "on top" of the others
             row = tblElement.insertRow(1);
             
             //these have to be in the correct order!
             row.insertCell(0).innerHTML = (PCB.pid - 1).toString();
             row.insertCell(1).innerHTML = this.base.toString();
             row.insertCell(2).innerHTML = this.limit.toString();
             row.insertCell(3).innerHTML = State[this.currentState].toString();
             row.insertCell(4).innerHTML = this.progCount.toString();
             row.insertCell(5).innerHTML = this.ACC.toString();
             row.insertCell(6).innerHTML = this.X_reg.toString();
             row.insertCell(7).innerHTML = this.Y_reg.toString();
             row.insertCell(8).innerHTML = this.Z_flag.toString();
         }
    }
}