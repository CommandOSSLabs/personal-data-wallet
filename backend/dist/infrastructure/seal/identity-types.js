"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityType = void 0;
exports.createIdentityString = createIdentityString;
var IdentityType;
(function (IdentityType) {
    IdentityType["SELF"] = "self";
    IdentityType["APP"] = "app";
    IdentityType["TIME_LOCKED"] = "time_locked";
    IdentityType["ROLE"] = "role";
    IdentityType["CONDITIONAL"] = "conditional";
})(IdentityType || (exports.IdentityType = IdentityType = {}));
function createIdentityString(options) {
    switch (options.type) {
        case IdentityType.SELF:
            return `self:${options.userAddress}`;
        case IdentityType.APP:
            if (!options.targetAddress) {
                throw new Error('Target app address required for APP identity type');
            }
            return `app:${options.userAddress}:${options.targetAddress}`;
        case IdentityType.TIME_LOCKED:
            if (!options.expiresAt) {
                throw new Error('Expiration timestamp required for TIME_LOCKED identity type');
            }
            return `time:${options.userAddress}:${options.expiresAt}`;
        case IdentityType.ROLE:
            if (!options.role) {
                throw new Error('Role identifier required for ROLE identity type');
            }
            return `role:${options.userAddress}:${options.role}`;
        case IdentityType.CONDITIONAL:
            const condHash = options.conditions ?
                Buffer.from(JSON.stringify(options.conditions)).toString('hex').substring(0, 16) :
                '0000000000000000';
            return `cond:${options.userAddress}:${condHash}`;
        default:
            throw new Error(`Unknown identity type: ${options.type}`);
    }
}
//# sourceMappingURL=identity-types.js.map