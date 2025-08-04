import { SealService } from './seal.service';
interface SessionMessageDto {
    userAddress: string;
}
export declare class SealController {
    private readonly sealService;
    constructor(sealService: SealService);
    getSessionMessage(dto: SessionMessageDto): Promise<{
        message: string;
    }>;
}
export {};
