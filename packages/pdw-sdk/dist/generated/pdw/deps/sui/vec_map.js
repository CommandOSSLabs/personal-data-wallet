"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entry = Entry;
exports.VecMap = VecMap;
/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
const bcs_1 = require("@mysten/sui/bcs");
const index_1 = require("../../../utils/index");
const $moduleName = '0x2::vec_map';
/** An entry in the map */
function Entry(...typeParameters) {
    return new index_1.MoveStruct({ name: `${$moduleName}::Entry<${typeParameters[0].name}, ${typeParameters[1].name}>`, fields: {
            key: typeParameters[0],
            value: typeParameters[1]
        } });
}
/**
 * A map data structure backed by a vector. The map is guaranteed not to contain
 * duplicate keys, but entries are _not_ sorted by key--entries are included in
 * insertion order. All operations are O(N) in the size of the map--the intention
 * of this data structure is only to provide the convenience of programming against
 * a map API. Large maps should use handwritten parent/child relationships instead.
 * Maps that need sorted iteration rather than insertion order iteration should
 * also be handwritten.
 */
function VecMap(...typeParameters) {
    return new index_1.MoveStruct({ name: `${$moduleName}::VecMap<${typeParameters[0].name}, ${typeParameters[1].name}>`, fields: {
            contents: bcs_1.bcs.vector(Entry(typeParameters[0], typeParameters[1]))
        } });
}
//# sourceMappingURL=vec_map.js.map