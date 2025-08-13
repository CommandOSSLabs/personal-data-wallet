"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
const chat_session_entity_1 = require("../chat/entities/chat-session.entity");
const chat_message_entity_1 = require("../chat/entities/chat-message.entity");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'postgres'),
    database: configService.get('DB_DATABASE', 'personal_data_wallet'),
    entities: [chat_session_entity_1.ChatSession, chat_message_entity_1.ChatMessage],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: true,
    ssl: configService.get('DB_SSL') === 'true' ? {
        rejectUnauthorized: false
    } : false,
});
//# sourceMappingURL=database.config.js.map