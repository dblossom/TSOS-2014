///<reference path="../globals.ts" />
///<reference path="../host/memory.ts" />
/* ------------
MemoryManager.ts
This has all the routines (methods) required for the MMU
It communicates between the OS and hardware
Requires globals.ts
Author: D. Blossom
------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            // An array that will tell us about our free ranges of memory.
            this.memoryRanges = new Array();
            // initialize our memory object.
            this.memoryModule = new TSOS.Memory(new Array());

            // initalize our memory locations
            this.initMemoryRanges(this.memoryRanges);
        }
        /**
        * writes a "byte string" to a memory address then updates the display
        *
        * @ params - address: where to write
        * @ params - byte: what to write
        */
        MemoryManager.prototype.write = function (address, byte, pcb) {
            // so we want to write within our bounds
            // otherwise throw an interrupt
            if (address + pcb.base > pcb.limit || address + pcb.base < pcb.base) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ILLEGAL_MEM_ACCESS, 0));
            } else {
                this.memoryModule.write((address + pcb.base), byte);
                this.updateMemoryCell(address + pcb.base, byte);
            }
        };

        /**
        * Will read contents (if any) from a location in memory given an address
        *
        * TODO: consider returning a NUMBER vs STRING since we are storing NUMBER.
        *
        * @param address - the address of the content of memory
        * @return string - a string representation of what is in memory
        */
        MemoryManager.prototype.read = function (address, pcb) {
            // just like write, we want to ensure we are only reading memory we have access too
            if (address + pcb.base > pcb.limit || address + pcb.base < pcb.base) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ILLEGAL_MEM_ACCESS, 0));
            } else {
                return this.memoryModule.read(address + pcb.base);
            }
        };

        /**
        * Allocate memory to a given PCB
        * @return - the free memory location
        *           (-)1 indicates no mem to allocate
        */
        MemoryManager.prototype.allocate = function () {
            // assume no free space
            var partition = -1;

            for (var i = 0; i < this.memoryRanges.length; i++) {
                // if inuse is false, we can use it
                if (this.memoryRanges[i].inuse === false) {
                    // what partition are we in?
                    partition = i;

                    // clearn the memory ... do we clear in load too ? whatever
                    this.clearPartition(i);

                    // do not let anyone else use this until we are done
                    this.memoryRanges[i].inuse = true;

                    break;
                }
            }

            // FINALLY, where is that free space ... or -1 if none.
            return partition;
        };

        /**
        * Deallocate memory for a given PCB
        */
        MemoryManager.prototype.deallocate = function (pcb) {
            // what was the base of the PCB
            var base = pcb.base;

            for (var i = 0; i < this.memoryRanges.length; i++) {
                // okay, found it - now set it for someone else to use...
                // NOT clearing memory here so we can see it on the display
                if (this.memoryRanges[i].base === base) {
                    this.memoryRanges[i].inuse = false;
                }
            }
        };

        /**
        * This will clear all memory.
        * TODO: Still not a fan of having clear() in "memory.ts" or the "system memory"
        *       clear is just clearRange(x,y) with all our memory... so why have both?
        */
        MemoryManager.prototype.clearAllMemory = function () {
            for (var i = 0; i < MAX_MEM_LOCATIONS; i++) {
                this.clearPartition(i);
            }

            // re-initalize the display
            this.initMemoryDisplay(_MemoryDisplay);
        };

        /**
        * This will clear a partition of memory
        * @params - the memory partition to clear
        */
        MemoryManager.prototype.clearPartition = function (partitionNumber) {
            // so set the range to no longer be in use so another process can have it
            this.memoryRanges[partitionNumber].inuse = false;

            switch (partitionNumber) {
                case 0:
                    this.writeZeroToBlock(0, 255);
                    break;
                case 1:
                    this.writeZeroToBlock(256, 511);
                    break;
                case 2:
                    this.writeZeroToBlock(512, 767);
                    break;
                default:
            }
        };

        /**
        * Retuns if there is available memory
        */
        MemoryManager.prototype.memoryAvailable = function () {
            // Assume no free memory
            var returnBool = false;

            for (var i = 0; i < this.memoryRanges.length; i++) {
                // if we find one, set our return boolean to true and bust outta this loop
                if (this.memoryRanges[i].inuse === false) {
                    returnBool = true;
                    break;
                }
            }

            // finally, return what happened
            return returnBool;
        };

        /**
        * This will write zeros to whichever block
        * TODO: consider making this public
        */
        MemoryManager.prototype.writeZeroToBlock = function (start, end) {
            for (; start < end + 1; start++) {
                this.memoryModule.write(start, "00");
                this.updateMemoryCell(start, "00");
            }
        };

        /**
        * This updates the memory after it has been loaded
        * If  you have seen previous commits, all issues have been resovlved
        * @params address to updated, data to put there
        */
        MemoryManager.prototype.updateMemoryCell = function (address, data) {
            // using the address, find the row and the cell that needs updatimg
            var row = Math.floor(address / 8);
            var cell = (address % 8) + 1;

            // grab the row
            var requestedRow = null;
            requestedRow = _MemoryDisplay.rows[row];

            // grab the cell
            var requestedCell = null;
            requestedCell = requestedRow.cells[cell];

            // finally update the cell
            requestedCell.innerHTML = data.toUpperCase();
        };

        /**
        * This initalizes memory display to all zeros
        */
        MemoryManager.prototype.initMemoryDisplay = function (tblElement) {
            // if a table exists, delete it for the new table
            this.deleteMemoryTable(tblElement);

            // variable for row, and row count to count the number of rows
            var row = null;
            var rowcount = 0;

            for (var i = 0; i < MAX_ADDRESS_SPACE; i++) {
                if (i % 8 === 0) {
                    row = tblElement.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                }
                row.insertCell((i % 8) + 1).innerHTML = "00";
            }
        };

        /**
        * Clear / delete memory table (all rows ... BYE).
        */
        MemoryManager.prototype.deleteMemoryTable = function (tblElement) {
            // so get the first row, if null then we do nothing
            // otherwise we delete all rows in the table. This
            // check is basically to ensure it is not the first time
            // the table is being initalized.
            var row = null;
            row = tblElement.rows[0];

            if (typeof row !== 'undefined') {
                for (var i = 0; i < (MAX_MEM_SPACE / 8); i++) {
                    tblElement.deleteRow(0);
                }
            }
        };

        /**
        * Initalizes our free memory ranges and sets them all to available
        */
        MemoryManager.prototype.initMemoryRanges = function (memoryRanges) {
            for (var i = 0; i < MAX_ADDRESS_SPACE; i += MAX_MEM_SPACE) {
                this.memoryRanges.push(new TSOS.MemoryRange(false, i, (i + (MAX_MEM_SPACE - 1))));
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
