"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveTuple = exports.MoveEnum = exports.MoveStruct = void 0;
exports.getPureBcsSchema = getPureBcsSchema;
exports.normalizeMoveArguments = normalizeMoveArguments;
const bcs_1 = require("@mysten/sui/bcs");
const utils_1 = require("@mysten/sui/utils");
const transactions_1 = require("@mysten/sui/transactions");
const MOVE_STDLIB_ADDRESS = (0, utils_1.normalizeSuiAddress)('0x1');
const SUI_FRAMEWORK_ADDRESS = (0, utils_1.normalizeSuiAddress)('0x2');
const SUI_SYSTEM_ADDRESS = (0, utils_1.normalizeSuiAddress)('0x3');
function getPureBcsSchema(typeTag) {
    const parsedTag = typeof typeTag === 'string' ? bcs_1.TypeTagSerializer.parseFromStr(typeTag) : typeTag;
    if ('u8' in parsedTag) {
        return bcs_1.bcs.U8;
    }
    else if ('u16' in parsedTag) {
        return bcs_1.bcs.U16;
    }
    else if ('u32' in parsedTag) {
        return bcs_1.bcs.U32;
    }
    else if ('u64' in parsedTag) {
        return bcs_1.bcs.U64;
    }
    else if ('u128' in parsedTag) {
        return bcs_1.bcs.U128;
    }
    else if ('u256' in parsedTag) {
        return bcs_1.bcs.U256;
    }
    else if ('address' in parsedTag) {
        return bcs_1.bcs.Address;
    }
    else if ('bool' in parsedTag) {
        return bcs_1.bcs.Bool;
    }
    else if ('vector' in parsedTag) {
        const type = getPureBcsSchema(parsedTag.vector);
        return type ? bcs_1.bcs.vector(type) : null;
    }
    else if ('struct' in parsedTag) {
        const structTag = parsedTag.struct;
        const pkg = (0, utils_1.normalizeSuiAddress)(parsedTag.struct.address);
        if (pkg === MOVE_STDLIB_ADDRESS) {
            if ((structTag.module === 'ascii' || structTag.module === 'string') &&
                structTag.name === 'String') {
                return bcs_1.bcs.String;
            }
            if (structTag.module === 'option' && structTag.name === 'Option') {
                const type = getPureBcsSchema(structTag.typeParams[0]);
                return type ? bcs_1.bcs.vector(type) : null;
            }
        }
        if (pkg === SUI_FRAMEWORK_ADDRESS && structTag.module === 'Object' && structTag.name === 'ID') {
            return bcs_1.bcs.Address;
        }
    }
    return null;
}
function normalizeMoveArguments(args, argTypes, parameterNames) {
    const argLen = Array.isArray(args) ? args.length : Object.keys(args).length;
    if (parameterNames && argLen !== parameterNames.length) {
        throw new Error(`Invalid number of arguments, expected ${parameterNames.length}, got ${argLen}`);
    }
    const normalizedArgs = [];
    let index = 0;
    for (const [i, argType] of argTypes.entries()) {
        if (argType === `${SUI_FRAMEWORK_ADDRESS}::deny_list::DenyList`) {
            normalizedArgs.push((tx) => tx.object.denyList());
            continue;
        }
        if (argType === `${SUI_FRAMEWORK_ADDRESS}::random::Random`) {
            normalizedArgs.push((tx) => tx.object.random());
            continue;
        }
        if (argType === `${SUI_FRAMEWORK_ADDRESS}::clock::Clock`) {
            normalizedArgs.push((tx) => tx.object.clock());
            continue;
        }
        if (argType === `${SUI_SYSTEM_ADDRESS}::sui_system::SuiSystemState`) {
            normalizedArgs.push((tx) => tx.object.system());
            continue;
        }
        let arg;
        if (Array.isArray(args)) {
            if (index >= args.length) {
                throw new Error(`Invalid number of arguments, expected at least ${index + 1}, got ${args.length}`);
            }
            arg = args[index];
        }
        else {
            if (!parameterNames) {
                throw new Error(`Expected arguments to be passed as an array`);
            }
            const name = parameterNames[index];
            arg = args[name];
            if (arg == null) {
                throw new Error(`Parameter ${name} is required`);
            }
        }
        index += 1;
        if (typeof arg === 'function' || (0, transactions_1.isArgument)(arg)) {
            normalizedArgs.push(arg);
            continue;
        }
        const type = argTypes[i];
        const bcsType = getPureBcsSchema(type);
        if (bcsType) {
            const bytes = bcsType.serialize(arg);
            normalizedArgs.push((tx) => tx.pure(bytes));
            continue;
        }
        else if (typeof arg === 'string') {
            normalizedArgs.push((tx) => tx.object(arg));
            continue;
        }
        throw new Error(`Invalid argument ${stringify(arg)} for type ${type}`);
    }
    return normalizedArgs;
}
class MoveStruct extends bcs_1.BcsStruct {
}
exports.MoveStruct = MoveStruct;
class MoveEnum extends bcs_1.BcsEnum {
}
exports.MoveEnum = MoveEnum;
class MoveTuple extends bcs_1.BcsTuple {
}
exports.MoveTuple = MoveTuple;
function stringify(val) {
    if (typeof val === 'object') {
        return JSON.stringify(val, (val) => val);
    }
    if (typeof val === 'bigint') {
        return val.toString();
    }
    return val;
}
//# sourceMappingURL=index.js.map