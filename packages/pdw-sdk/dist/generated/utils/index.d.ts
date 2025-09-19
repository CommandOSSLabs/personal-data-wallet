import { BcsType, TypeTag, BcsStruct, BcsEnum, BcsTuple } from '@mysten/sui/bcs';
import { TransactionArgument } from '@mysten/sui/transactions';
export type RawTransactionArgument<T> = T | TransactionArgument;
export declare function getPureBcsSchema(typeTag: string | TypeTag): BcsType<any> | null;
export declare function normalizeMoveArguments(args: unknown[] | object, argTypes: string[], parameterNames?: string[]): TransactionArgument[];
export declare class MoveStruct<T extends Record<string, BcsType<any>>, const Name extends string = string> extends BcsStruct<T, Name> {
}
export declare class MoveEnum<T extends Record<string, BcsType<any> | null>, const Name extends string> extends BcsEnum<T, Name> {
}
export declare class MoveTuple<T extends readonly BcsType<any>[], const Name extends string> extends BcsTuple<T, Name> {
}
//# sourceMappingURL=index.d.ts.map