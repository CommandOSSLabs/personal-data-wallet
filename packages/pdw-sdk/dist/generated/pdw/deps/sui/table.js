"use strict";
/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
/**
 * A table is a map-like collection. But unlike a traditional collection, it's keys
 * and values are not stored within the `Table` value, but instead are stored using
 * Sui's object system. The `Table` struct acts only as a handle into the object
 * system to retrieve those keys and values. Note that this means that `Table`
 * values with exactly the same key-value mapping will not be equal, with `==`, at
 * runtime. For example
 *
 * ```
 * let table1 = table::new<u64, bool>();
 * let table2 = table::new<u64, bool>();
 * table::add(&mut table1, 0, false);
 * table::add(&mut table1, 1, true);
 * table::add(&mut table2, 0, false);
 * table::add(&mut table2, 1, true);
 * // table1 does not equal table2, despite having the same entries
 * assert!(&table1 != &table2);
 * ```
 */
const index_js_1 = require("../../utils/index.js");
const bcs_1 = require("@mysten/sui/bcs");
const object = __importStar(require("./object.js"));
const $moduleName = '0x2::table';
exports.Table = new index_js_1.MoveStruct({ name: `${$moduleName}::Table`, fields: {
        /** the ID of this table */
        id: object.UID,
        /** the number of key-value pairs in the table */
        size: bcs_1.bcs.u64()
    } });
//# sourceMappingURL=table.js.map