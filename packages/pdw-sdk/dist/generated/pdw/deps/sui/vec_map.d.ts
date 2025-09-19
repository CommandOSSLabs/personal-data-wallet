/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { type BcsType } from '@mysten/sui/bcs';
/** An entry in the map */
export declare function Entry<K extends BcsType<any>, V extends BcsType<any>>(...typeParameters: [
    K,
    V
]): any;
/**
 * A map data structure backed by a vector. The map is guaranteed not to contain
 * duplicate keys, but entries are _not_ sorted by key--entries are included in
 * insertion order. All operations are O(N) in the size of the map--the intention
 * of this data structure is only to provide the convenience of programming against
 * a map API. Large maps should use handwritten parent/child relationships instead.
 * Maps that need sorted iteration rather than insertion order iteration should
 * also be handwritten.
 */
export declare function VecMap<K extends BcsType<any>, V extends BcsType<any>>(...typeParameters: [
    K,
    V
]): any;
//# sourceMappingURL=vec_map.d.ts.map