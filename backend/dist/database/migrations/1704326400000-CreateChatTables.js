"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChatTables1704326400000 = void 0;
class CreateChatTables1704326400000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "chat_session" (
                "id" VARCHAR(255) PRIMARY KEY,
                "title" VARCHAR(255) NOT NULL,
                "summary" TEXT,
                "userAddress" VARCHAR(255) NOT NULL,
                "isArchived" BOOLEAN DEFAULT false,
                "metadata" JSONB,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "chat_message" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "role" VARCHAR(50) NOT NULL,
                "content" TEXT NOT NULL,
                "metadata" JSONB,
                "sessionId" VARCHAR(255) NOT NULL,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("sessionId") REFERENCES "chat_session" ("id") ON DELETE CASCADE
            );

            CREATE INDEX "IDX_CHAT_SESSION_USER_ADDRESS" ON "chat_session" ("userAddress");
            CREATE INDEX "IDX_CHAT_SESSION_CREATED_AT" ON "chat_session" ("createdAt");
            CREATE INDEX "IDX_CHAT_SESSION_UPDATED_AT" ON "chat_session" ("updatedAt");
            CREATE INDEX "IDX_CHAT_MESSAGE_SESSION_ID" ON "chat_message" ("sessionId");
            CREATE INDEX "IDX_CHAT_MESSAGE_CREATED_AT" ON "chat_message" ("createdAt");

            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW."updatedAt" = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            CREATE TRIGGER update_chat_session_updated_at 
            BEFORE UPDATE ON chat_session 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_chat_session_updated_at ON chat_session;
            DROP FUNCTION IF EXISTS update_updated_at_column();
            DROP TABLE IF EXISTS chat_message;
            DROP TABLE IF EXISTS chat_session;
        `);
    }
}
exports.CreateChatTables1704326400000 = CreateChatTables1704326400000;
//# sourceMappingURL=1704326400000-CreateChatTables.js.map