var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatSession } from './ChatSession.js';
let ChatMessage = class ChatMessage {
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ChatMessage.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 16 }),
    __metadata("design:type", String)
], ChatMessage.prototype, "role", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], ChatMessage.prototype, "content", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ChatMessage.prototype, "metadata", void 0);
__decorate([
    Column({ type: 'uuid' }),
    __metadata("design:type", String)
], ChatMessage.prototype, "sessionId", void 0);
__decorate([
    ManyToOne(() => ChatSession, (session) => session.messages, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'session_id' }),
    __metadata("design:type", Object)
], ChatMessage.prototype, "session", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ChatMessage.prototype, "createdAt", void 0);
ChatMessage = __decorate([
    Entity({ name: 'chat_messages' })
], ChatMessage);
export { ChatMessage };
