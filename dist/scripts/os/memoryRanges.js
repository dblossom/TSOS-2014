/* ------------
MemoryRanges.ts
A class to define variables needed for keeping track
of a range of memory.
Author: D. Blossom
------------ */
var TSOS;
(function (TSOS) {
    var MemoryRange = (function () {
        function MemoryRange(inuse, base, limit) {
            if (typeof inuse === "undefined") { inuse = null; }
            if (typeof base === "undefined") { base = null; }
            if (typeof limit === "undefined") { limit = null; }
            this.inuse = inuse;
            this.base = base;
            this.limit = limit;
        }
        return MemoryRange;
    })();
    TSOS.MemoryRange = MemoryRange;
})(TSOS || (TSOS = {}));
