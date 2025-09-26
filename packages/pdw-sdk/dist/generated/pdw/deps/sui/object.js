"use strict";
/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.UID = void 0;
/** Sui object identifiers */
const index_1 = require("../../../utils/index");
const bcs_1 = require("@mysten/sui/bcs");
const $moduleName = '0x2::object';
exports.UID = new index_1.MoveStruct({ name: `${$moduleName}::UID`, fields: {
        id: bcs_1.bcs.Address
    } });
//# sourceMappingURL=object.js.map