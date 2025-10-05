var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ChatMessage } from './ChatMessage.js';
let ChatSession = class ChatSession {
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ChatSession.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ChatSession.prototype, "title", void 0);
__decorate([
    Column({ type: 'varchar', length: 128 }),
    __metadata("design:type", String)
], ChatSession.prototype, "userAddress", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ChatSession.prototype, "archived", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ChatSession.prototype, "metadata", void 0);
__decorate([
    OneToMany(() => ChatMessage, (message) => message.session),
    __metadata("design:type", Object)
], ChatSession.prototype, "messages", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ChatSession.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ChatSession.prototype, "updatedAt", void 0);
ChatSession = __decorate([
    Entity({ name: 'chat_sessions' })
], ChatSession);
export { ChatSession };
