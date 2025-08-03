import { WalrusService } from '../../infrastructure/walrus/walrus.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';
interface Entity {
    id: string;
    label: string;
    type: string;
}
interface Relationship {
    source: string;
    target: string;
    label: string;
}
export interface KnowledgeGraph {
    entities: Entity[];
    relationships: Relationship[];
}
export declare class GraphService {
    private walrusService;
    private geminiService;
    private logger;
    constructor(walrusService: WalrusService, geminiService: GeminiService);
    createGraph(): KnowledgeGraph;
    extractEntitiesAndRelationships(text: string): Promise<{
        entities: Entity[];
        relationships: Relationship[];
    }>;
    addToGraph(graph: KnowledgeGraph, newEntities: Entity[], newRelationships: Relationship[]): KnowledgeGraph;
    findRelatedEntities(graph: KnowledgeGraph, seedVectorIds: number[], entityToVectorMap: Record<string, number>, maxHops?: number): string[];
    saveGraph(graph: KnowledgeGraph): Promise<string>;
    loadGraph(blobId: string): Promise<KnowledgeGraph>;
}
export {};
