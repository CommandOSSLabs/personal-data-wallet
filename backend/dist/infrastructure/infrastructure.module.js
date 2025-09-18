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
const cached_walrus_service_1 = require("./walrus/cached-walrus.service");
const seal_service_1 = require("./seal/seal.service");
const gemini_service_1 = require("./gemini/gemini.service");
const local_storage_service_1 = require("./local-storage/local-storage.service");
const storage_service_1 = require("./storage/storage.service");
const demo_storage_service_1 = require("./demo-storage/demo-storage.service");
const memory_module_1 = require("../memory/memory.module");
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
            (0, common_1.forwardRef)(() => memory_module_1.MemoryModule),
        ],
        providers: [
            sui_service_1.SuiService,
            walrus_service_1.WalrusService,
            cached_walrus_service_1.CachedWalrusService,
            seal_service_1.SealService,
            gemini_service_1.GeminiService,
            local_storage_service_1.LocalStorageService,
            storage_service_1.StorageService,
            demo_storage_service_1.DemoStorageService,
        ],
        exports: [
            sui_service_1.SuiService,
            walrus_service_1.WalrusService,
            cached_walrus_service_1.CachedWalrusService,
            seal_service_1.SealService,
            gemini_service_1.GeminiService,
            local_storage_service_1.LocalStorageService,
            storage_service_1.StorageService,
            demo_storage_service_1.DemoStorageService,
        ]
    })
], InfrastructureModule);
//# sourceMappingURL=infrastructure.module.js.map