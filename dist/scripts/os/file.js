/* ------------
file.ts
A class to define variables needed for keeping track
of filenames and their data locations
Author: D. Blossom
------------ */
var TSOS;
(function (TSOS) {
    var File = (function () {
        function File(name, tsb, tsbData) {
            if (typeof name === "undefined") { name = null; }
            if (typeof tsb === "undefined") { tsb = null; }
            if (typeof tsbData === "undefined") { tsbData = null; }
            this.name = name;
            this.tsb = tsb;
            this.tsbData = tsbData;
        }
        return File;
    })();
    TSOS.File = File;
})(TSOS || (TSOS = {}));
