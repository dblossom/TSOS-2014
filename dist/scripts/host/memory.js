///<reference path="../globals.ts" />
/* ------------
Memory.ts
This is a memory representation of hardware.
Requires globals.ts
Author: D. Blossom
------------ */
var TSOS;
(function (TSOS) {
    /*
    * This class represents memory as a hardware device
    * it contains functions to initialize a new memory address
    * read, write, clearall, and clear a block of managed memory
    */
    var Memory = (function () {
        function Memory(memoryArray) {
            this.memoryArray = memoryArray;
        }
        /**
        * This will write a byte to memory
        */
        Memory.prototype.write = function (address, hexbyte) {
            // so this at its very basic form will put a "hex byte" in a memory location
            this.memoryArray[address] = parseInt(hexbyte, 16); //store as int.
        };

        /**
        * This will read contents from memory
        */
        Memory.prototype.read = function (address) {
            // so this will read an item from memory
            return this.memoryArray[address].toString(16);
        };

        /**
        * returns the size of length of memory
        */
        Memory.prototype.size = function () {
            return this.memoryArray.length;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
