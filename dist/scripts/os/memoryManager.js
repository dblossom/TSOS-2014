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
        // TODO: add a way to keep track of the 3 different address spaces
        //       need to know when one will be in use as to not overwrite
        //       a program that has not run yet -- not needed for project 1
        //       but will be a key part for project 2!!
        function MemoryManager() {
            // initialize our memory object.
            this.memoryModule = new TSOS.Memory(new Array());
        }
        /**
        * writes a "byte string" to a memory address then updates the display
        *
        * @ params - address: where to write
        * @ params - byte: what to write
        */
        MemoryManager.prototype.write = function (address, byte) {
            // just hard coding for now since we are only working with 0 - 255
            // if we try to write at address 256 we should toss an error
            // TODO: create a function that checks the range of incoming address.
            if (address > MAX_MEM_SPACE) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ILLEGAL_MEM_ACCESS, 0));
            } else {
                this.memoryModule.write(address, byte);
                this.updateMemoryCell(address, byte);
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
        MemoryManager.prototype.read = function (address) {
            // same as write, just hard coding the max address for now
            // we cannot read from any address past 255.
            // TODO: create a function that checks the range of an address
            if (address > MAX_MEM_SPACE) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ILLEGAL_MEM_ACCESS, 0));
            } else {
                return this.memoryModule.read(address);
            }
        };

        /**
        * Will clear a section of memory given a starting address and "offset" or end address
        * @ param start: where to start
        * @ param end: where to ... well ... wait for it ... END
        */
        MemoryManager.prototype.clearRange = function (start, end) {
            this.memoryModule.clearBlock(start, end);
        };

        /**
        * This updates the memory after it has been loaded
        *
        * I had a lot of issues with typescript and updating a table
        * feel free to read the angry comments but the really do not outline
        * the issues I was having. Simply put, the typechecking was not allowing
        * what would have been valid javascript to run. Gave various compile errors
        *
        * @params -- both are meaning less right now.
        */
        MemoryManager.prototype.updateMemoryCell = function (address, data) {
            for (var i = 0; i < (MAX_MEM_SPACE / 8); i++) {
                _MemoryDisplay.deleteRow(0);
            }

            var row = null;
            var rowcount = 0;

            for (var i = 0; i < this.memoryModule.size(); i++) {
                if (i % 8 === 0) {
                    row = _MemoryDisplay.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                }
                row.insertCell((i % 8) + 1).innerHTML = (("00" + this.memoryModule.read(i)).slice(-2)).toUpperCase();
            }
        };

        /**
        * This initalizes memory to all zeros
        */
        MemoryManager.prototype.initMemoryDisplay = function (tblElement) {
            var row = null;
            var rowcount = 0;
            for (var i = 0; i < MAX_MEM_SPACE; i++) {
                if (i % 8 === 0) {
                    row = tblElement.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                }
                row.insertCell((i % 8) + 1).innerHTML = "00";
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
