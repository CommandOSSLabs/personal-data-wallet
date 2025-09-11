"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sui_service_1 = require("./sui/sui.service");
const walrus_service_1 = require("./walrus/walrus.service");
const seal_service_1 = require("./seal/seal.service");
<<<<<<< HEAD
const session_key_service_1 = require("./seal/session-key.service");
const session_controller_1 = require("./seal/session.controller");
const gemini_service_1 = require("./gemini/gemini.service");
=======
const seal_controller_1 = require("./seal/seal.controller");
const gemini_service_1 = require("./gemini/gemini.service");
const session_store_1 = require("./seal/session-store");
>>>>>>> 175a8dbc02e99cdf82f694d8be93c895b23ba1e0
let InfrastructureModule = class InfrastructureModule {
};
exports.InfrastructureModule = InfrastructureModule;
exports.InfrastructureModule = InfrastructureModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
        ],
<<<<<<< HEAD
        controllers: [session_controller_1.SessionController],
=======
        controllers: [seal_controller_1.SealController],
>>>>>>> 175a8dbc02e99cdf82f694d8be93c895b23ba1e0
        providers: [
            sui_service_1.SuiService,
            walrus_service_1.WalrusService,
            seal_service_1.SealService,
<<<<<<< HEAD
            session_key_service_1.SessionKeyService,
=======
>>>>>>> 175a8dbc02e99cdf82f694d8be93c895b23ba1e0
            gemini_service_1.GeminiService,
        ],
        exports: [
            sui_service_1.SuiService,
            walrus_service_1.WalrusService,
            seal_service_1.SealService,
<<<<<<< HEAD
            session_key_service_1.SessionKeyService,
=======
>>>>>>> 175a8dbc02e99cdf82f694d8be93c895b23ba1e0
            gemini_service_1.GeminiService,
        ]
    })
], InfrastructureModule);
//# sourceMappingURL=infrastructure.module.js.map