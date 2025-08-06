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
        Extract entities and relationships from the following text. 
        Format your response as a valid JSON object with "entities" and "relationships" arrays.
        
        For entities, include:
        - "id": a unique identifier (use meaningful names with underscores)
        - "label": a display name
        - "type": entity type (person, concept, organization, location, event, etc.)
        
        For relationships, include:
        - "source": the id of the source entity
        - "target": the id of the target entity
        - "label": a description of the relationship
        
        TEXT:
        ${text}
        
        RESPONSE (JSON only):
      `;
            const response = await this.geminiService.generateContent('gemini-1.5-flash', [{ role: 'user', content: prompt }]);
            try {
                const parsed = JSON.parse(response);
                if (!parsed.entities || !Array.isArray(parsed.entities) ||
                    !parsed.relationships || !Array.isArray(parsed.relationships)) {
                    throw new Error('Invalid response format');
                }
                const sanitizeId = (id) => {
                    return id.replace(/[^\w_-]/g, '_').toLowerCase();
                };
                const entities = parsed.entities.map((e) => ({
                    id: sanitizeId(e.id || `entity_${Math.random().toString(36).substring(2, 10)}`),
                    label: e.label || 'Unnamed Entity',
                    type: e.type || 'concept'
                }));
                const idMap = new Map();
                parsed.entities.forEach((e, i) => {
                    idMap.set(e.id || '', entities[i].id);
                });
                const relationships = parsed.relationships
                    .filter((r) => r.source && r.target && idMap.has(r.source) && idMap.has(r.target))
                    .map((r) => ({
                    source: idMap.get(r.source) || '',
                    target: idMap.get(r.target) || '',
                    label: r.label || 'related to'
                }));
                return { entities, relationships };
            }
            catch (parseError) {
                this.logger.error(`Failed to parse extraction response: ${parseError.message}`);
                return { entities: [], relationships: [] };
            }
        }
        catch (error) {
            this.logger.error(`Entity extraction error: ${error.message}`);
            return { entities: [], relationships: [] };
        }
    }
    addToGraph(graph, newEntities, newRelationships) {
        try {
            const existingEntities = [...graph.entities];
            const existingRelationships = [...graph.relationships];
            const existingEntityIds = new Set(existingEntities.map(e => e.id));
            const addedEntities = newEntities.filter(e => !existingEntityIds.has(e.id));
            const relationshipKey = (r) => `${r.source}-${r.target}-${r.label}`;
            const existingRelationshipKeys = new Set(existingRelationships.map(relationshipKey));
            const addedRelationships = newRelationships.filter(r => {
                const key = relationshipKey(r);
                return !existingRelationshipKeys.has(key);
            });
            return {
                entities: [...existingEntities, ...addedEntities],
                relationships: [...existingRelationships, ...addedRelationships]
            };
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
    async saveGraph(graph, userAddress) {
        try {
            this.logger.log(`Saving knowledge graph for user ${userAddress}`);
            const graphJson = JSON.stringify(graph);
            const adminAddress = this.walrusService.getAdminAddress();
            return await this.walrusService.uploadContent(graphJson, adminAddress, 12, {
                'user-address': userAddress,
                'content-type': 'application/json',
                'data-type': 'knowledge-graph',
                'version': '1.0'
            });
        }
        catch (error) {
            this.logger.error(`Error saving graph: ${error.message}`);
            throw new Error(`Graph save error: ${error.message}`);
        }
    }
    async loadGraph(blobId, userAddress) {
        try {
            this.logger.log(`Loading graph from blobId: ${blobId}`);
            if (userAddress) {
                const hasAccess = await this.walrusService.verifyUserAccess(blobId, userAddress);
                if (!hasAccess) {
                    this.logger.warn(`User ${userAddress} attempted to access graph without permission: ${blobId}`);
                }
            }
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