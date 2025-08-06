import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class GraphService {
  private logger = new Logger(GraphService.name);

  constructor(
    private walrusService: WalrusService,
    private geminiService: GeminiService
  ) {}

  /**
   * Create an empty knowledge graph
   * @returns Empty knowledge graph
   */
  createGraph(): KnowledgeGraph {
    return {
      entities: [],
      relationships: []
    };
  }

  /**
   * Extract entities and relationships from text using Gemini
   * @param text The text to extract from
   * @returns Extracted entities and relationships
   */
  async extractEntitiesAndRelationships(text: string): Promise<{
    entities: Entity[];
    relationships: Relationship[];
  }> {
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
      
      // Fix: Pass responseFormat as part of the options object in the correct format
      const response = await this.geminiService.generateContent(
        'gemini-1.5-flash', 
        [{ role: 'user', content: prompt }]
      );
      
      try {
        const parsed = JSON.parse(response);
        
        // Validate the response structure
        if (!parsed.entities || !Array.isArray(parsed.entities) || 
            !parsed.relationships || !Array.isArray(parsed.relationships)) {
          throw new Error('Invalid response format');
        }
        
        // Sanitize IDs to ensure they're valid and unique
        const sanitizeId = (id: string) => {
          return id.replace(/[^\w_-]/g, '_').toLowerCase();
        };
        
        // Process entities
        const entities: Entity[] = parsed.entities.map((e: any) => ({
          id: sanitizeId(e.id || `entity_${Math.random().toString(36).substring(2, 10)}`),
          label: e.label || 'Unnamed Entity',
          type: e.type || 'concept'
        }));
        
        // Create a map of original IDs to sanitized IDs
        const idMap = new Map<string, string>();
        parsed.entities.forEach((e: any, i: number) => {
          idMap.set(e.id || '', entities[i].id);
        });
        
        // Process relationships using sanitized IDs
        const relationships: Relationship[] = parsed.relationships
          .filter((r: any) => r.source && r.target && idMap.has(r.source) && idMap.has(r.target))
          .map((r: any) => ({
            source: idMap.get(r.source) || '',
            target: idMap.get(r.target) || '',
            label: r.label || 'related to'
          }));
        
        return { entities, relationships };
      } catch (parseError) {
        this.logger.error(`Failed to parse extraction response: ${parseError.message}`);
        return { entities: [], relationships: [] };
      }
    } catch (error) {
      this.logger.error(`Entity extraction error: ${error.message}`);
      return { entities: [], relationships: [] };
    }
  }

  /**
   * Add new entities and relationships to a graph
   * @param graph The knowledge graph
   * @param newEntities New entities to add
   * @param newRelationships New relationships to add
   * @returns Updated knowledge graph
   */
  addToGraph(
    graph: KnowledgeGraph,
    newEntities: Entity[],
    newRelationships: Relationship[]
  ): KnowledgeGraph {
    try {
      // Create copies to avoid mutation
      const existingEntities = [...graph.entities];
      const existingRelationships = [...graph.relationships];
      
      // Track existing entity IDs for deduplication
      const existingEntityIds = new Set(existingEntities.map(e => e.id));
      
      // Add new entities (avoiding duplicates)
      const addedEntities = newEntities.filter(e => !existingEntityIds.has(e.id));
      
      // Track relationship keys for deduplication
      const relationshipKey = (r: Relationship) => `${r.source}-${r.target}-${r.label}`;
      const existingRelationshipKeys = new Set(existingRelationships.map(relationshipKey));
      
      // Add new relationships (avoiding duplicates)
      const addedRelationships = newRelationships.filter(r => {
        const key = relationshipKey(r);
        return !existingRelationshipKeys.has(key);
      });
      
      return {
        entities: [...existingEntities, ...addedEntities],
        relationships: [...existingRelationships, ...addedRelationships]
      };
    } catch (error) {
      this.logger.error(`Error adding to graph: ${error.message}`);
      return graph; // Return original graph on error
    }
  }

  /**
   * Find related entities in the graph
   * @param graph The knowledge graph
   * @param seedEntityIds Starting entity IDs
   * @param entityToVectorMap Map of entity IDs to vector IDs
   * @param maxHops Maximum traversal distance
   * @returns Array of related entity IDs
   */
  findRelatedEntities(
    graph: KnowledgeGraph,
    seedVectorIds: number[],
    entityToVectorMap: Record<string, number>,
    maxHops: number = 1
  ): string[] {
    try {
      // Create a reverse mapping from vector IDs to entity IDs
      const vectorToEntityMap: Record<number, string> = {};
      for (const [entityId, vectorId] of Object.entries(entityToVectorMap)) {
        vectorToEntityMap[vectorId] = entityId;
      }
      
      // Get seed entity IDs from vector IDs
      const seedEntityIds = seedVectorIds
        .map(vectorId => vectorToEntityMap[vectorId])
        .filter(Boolean);
      
      // BFS to find related entities
      const visited = new Set<string>(seedEntityIds);
      const relatedEntityIds = new Set<string>(seedEntityIds);
      
      let currentHop = 0;
      let frontier = seedEntityIds;
      
      while (currentHop < maxHops && frontier.length > 0) {
        const nextFrontier: string[] = [];
        
        for (const entityId of frontier) {
          // Find all relationships involving this entity
          const relationships = graph.relationships.filter(
            r => r.source === entityId || r.target === entityId
          );
          
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
    } catch (error) {
      this.logger.error(`Error finding related entities: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Save the graph to Walrus
   * @param graph The knowledge graph to save
   * @param userAddress The user's address for access control
   * @returns The blob ID of the saved graph
   */
  async saveGraph(graph: KnowledgeGraph, userAddress: string): Promise<string> {
    try {
      this.logger.log(`Saving knowledge graph for user ${userAddress}`);
      
      const graphJson = JSON.stringify(graph);
      
      // Get admin address for blob ownership (ensures backend access)
      const adminAddress = this.walrusService.getAdminAddress();
      
      // Save to Walrus with dual-ownership pattern
      // - Admin as the actual owner (for backend access)
      // - User address stored in metadata (for permission checks)
      return await this.walrusService.uploadContent(
        graphJson, 
        adminAddress, // Admin as owner for backend access
        12, // Default epochs
        { 
          'user-address': userAddress,  // Record actual user for permission checks
          'content-type': 'application/json',
          'data-type': 'knowledge-graph',
          'version': '1.0'
        }
      );
    } catch (error) {
      this.logger.error(`Error saving graph: ${error.message}`);
      throw new Error(`Graph save error: ${error.message}`);
    }
  }

  /**
   * Load a graph from Walrus
   * @param blobId The blob ID of the graph
   * @param userAddress The user's address for access verification
   * @returns The loaded knowledge graph
   */
  async loadGraph(blobId: string, userAddress?: string): Promise<KnowledgeGraph> {
    try {
      this.logger.log(`Loading graph from blobId: ${blobId}`);
      
      // Verify user access if an address is provided
      if (userAddress) {
        const hasAccess = await this.walrusService.verifyUserAccess(blobId, userAddress);
        if (!hasAccess) {
          this.logger.warn(`User ${userAddress} attempted to access graph without permission: ${blobId}`);
          // Continue anyway since we're using admin to access
        }
      }
      
      const graphJson = await this.walrusService.retrieveContent(blobId);
      
      try {
        return JSON.parse(graphJson);
      } catch (parseError) {
        this.logger.error(`Error parsing graph JSON: ${parseError.message}`);
        return this.createGraph(); // Return an empty graph on parse error
      }
    } catch (error) {
      this.logger.error(`Error loading graph: ${error.message}`);
      throw new Error(`Graph load error: ${error.message}`);
    }
  }
}