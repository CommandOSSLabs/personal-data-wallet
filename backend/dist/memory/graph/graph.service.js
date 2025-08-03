"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GraphService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphService = void 0;
const common_1 = require("@nestjs/common");
const walrus_service_1 = require("../../infrastructure/walrus/walrus.service");
const gemini_service_1 = require("../../infrastructure/gemini/gemini.service");
let GraphService = GraphService_1 = class GraphService {
    walrusService;
    geminiService;
    logger = new common_1.Logger(GraphService_1.name);
    constructor(walrusService, geminiService) {
        this.walrusService = walrusService;
        this.geminiService = geminiService;
    }
    createGraph() {
        return {
            entities: [],
            relationships: []
        };
    }
    async extractEntitiesAndRelationships(text) {
        try {
            const prompt = `
Extract entities and relationships from the following text. Format your response exactly as JSON without any explanations:

Text: ${text}

Response format:
{
  "entities": [
    {"id": "unique_id", "label": "entity_name", "type": "person|location|organization|date|concept|other"}
  ],
  "relationships": [
    {"source": "source_entity_id", "target": "target_entity_id", "label": "relationship_description"}
  ]
}`;
            const responseText = await this.geminiService.generateContent('gemini-1.5-pro', [{ role: 'user', content: prompt }]);
            try {
                const result = JSON.parse(responseText);
                return {
                    entities: result.entities || [],
                    relationships: result.relationships || []
                };
            }
            catch (parseError) {
                this.logger.error(`Error parsing extraction result: ${parseError.message}`);
                return { entities: [], relationships: [] };
            }
        }
        catch (error) {
            this.logger.error(`Error extracting entities and relationships: ${error.message}`);
            return { entities: [], relationships: [] };
        }
    }
    addToGraph(graph, newEntities, newRelationships) {
        try {
            const updatedGraph = {
                entities: [...graph.entities],
                relationships: [...graph.relationships]
            };
            const existingEntityIds = new Set(updatedGraph.entities.map(e => e.id));
            for (const entity of newEntities) {
                if (!existingEntityIds.has(entity.id)) {
                    updatedGraph.entities.push(entity);
                    existingEntityIds.add(entity.id);
                }
            }
            const relationshipKey = (r) => `${r.source}-${r.target}-${r.label}`;
            const existingRelationships = new Set(updatedGraph.relationships.map(relationshipKey));
            for (const relationship of newRelationships) {
                const key = relationshipKey(relationship);
                if (!existingRelationships.has(key)) {
                    if (existingEntityIds.has(relationship.source) &&
                        existingEntityIds.has(relationship.target)) {
                        updatedGraph.relationships.push(relationship);
                        existingRelationships.add(key);
                    }
                }
            }
            return updatedGraph;
        }
        catch (error) {
            this.logger.error(`Error adding to graph: ${error.message}`);
            return graph;
        }
    }
    findRelatedEntities(graph, seedVectorIds, entityToVectorMap, maxHops = 1) {
        try {
            const vectorToEntityMap = {};
            for (const [entityId, vectorId] of Object.entries(entityToVectorMap)) {
                vectorToEntityMap[vectorId] = entityId;
            }
            const seedEntityIds = seedVectorIds
                .map(vectorId => vectorToEntityMap[vectorId])
                .filter(Boolean);
            const visited = new Set(seedEntityIds);
            const relatedEntityIds = new Set(seedEntityIds);
            let currentHop = 0;
            let frontier = seedEntityIds;
            while (currentHop < maxHops && frontier.length > 0) {
                const nextFrontier = [];
                for (const entityId of frontier) {
                    const relationships = graph.relationships.filter(r => r.source === entityId || r.target === entityId);
                    for (const relationship of relationships) {
                        const neighborId = relationship.source === entityId ?
                            relationship.target : relationship.source;
                        if (!visited.has(neighborId)) {
                            visited.add(neighborId);
                            relatedEntityIds.add(neighborId);
                            nextFrontier.push(neighborId);
                        }
                    }
                }
                frontier = nextFrontier;
                currentHop++;
            }
            return Array.from(relatedEntityIds);
        }
        catch (error) {
            this.logger.error(`Error finding related entities: ${error.message}`);
            return [];
        }
    }
    async saveGraph(graph) {
        try {
            const graphJson = JSON.stringify(graph);
            return await this.walrusService.uploadContent(graphJson);
        }
        catch (error) {
            this.logger.error(`Error saving graph: ${error.message}`);
            throw new Error(`Graph save error: ${error.message}`);
        }
    }
    async loadGraph(blobId) {
        try {
            const graphJson = await this.walrusService.retrieveContent(blobId);
            try {
                return JSON.parse(graphJson);
            }
            catch (parseError) {
                this.logger.error(`Error parsing graph JSON: ${parseError.message}`);
                return this.createGraph();
            }
        }
        catch (error) {
            this.logger.error(`Error loading graph: ${error.message}`);
            throw new Error(`Graph load error: ${error.message}`);
        }
    }
};
exports.GraphService = GraphService;
exports.GraphService = GraphService = GraphService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [walrus_service_1.WalrusService,
        gemini_service_1.GeminiService])
], GraphService);
//# sourceMappingURL=graph.service.js.map