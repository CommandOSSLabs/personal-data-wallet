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
   * Create a new empty knowledge graph
   * @returns An empty knowledge graph
   */
  createGraph(): KnowledgeGraph {
    return {
      entities: [],
      relationships: []
    };
  }
  
  /**
   * Extract entities and relationships from text using Gemini
   * @param text The text to analyze
   * @returns Extracted entities and relationships
   */
  async extractEntitiesAndRelationships(text: string): Promise<{
    entities: Entity[];
    relationships: Relationship[];
  }> {
    try {
      // Prompt template for entity and relationship extraction
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
      
      // Call Gemini to extract entities and relationships
      const responseText = await this.geminiService.generateContent(
        'gemini-1.5-pro', 
        [{ role: 'user', content: prompt }]
      );
      
      // Parse the response
      try {
        const result = JSON.parse(responseText);
        return {
          entities: result.entities || [],
          relationships: result.relationships || []
        };
      } catch (parseError) {
        this.logger.error(`Error parsing extraction result: ${parseError.message}`);
        return { entities: [], relationships: [] };
      }
    } catch (error) {
      this.logger.error(`Error extracting entities and relationships: ${error.message}`);
      return { entities: [], relationships: [] };
    }
  }
  
  /**
   * Add entities and relationships to the graph
   * @param graph The knowledge graph to update
   * @param newEntities New entities to add
   * @param newRelationships New relationships to add
   * @returns The updated graph
   */
  addToGraph(
    graph: KnowledgeGraph,
    newEntities: Entity[],
    newRelationships: Relationship[]
  ): KnowledgeGraph {
    try {
      // Create a copy of the graph
      const updatedGraph: KnowledgeGraph = {
        entities: [...graph.entities],
        relationships: [...graph.relationships]
      };
      
      // Add new entities if they don't already exist
      const existingEntityIds = new Set(updatedGraph.entities.map(e => e.id));
      for (const entity of newEntities) {
        if (!existingEntityIds.has(entity.id)) {
          updatedGraph.entities.push(entity);
          existingEntityIds.add(entity.id);
        }
      }
      
      // Add new relationships if they don't already exist
      const relationshipKey = (r: Relationship) => `${r.source}-${r.target}-${r.label}`;
      const existingRelationships = new Set(
        updatedGraph.relationships.map(relationshipKey)
      );
      
      for (const relationship of newRelationships) {
        const key = relationshipKey(relationship);
        if (!existingRelationships.has(key)) {
          // Only add relationships where both entities exist
          if (
            existingEntityIds.has(relationship.source) && 
            existingEntityIds.has(relationship.target)
          ) {
            updatedGraph.relationships.push(relationship);
            existingRelationships.add(key);
          }
        }
      }
      
      return updatedGraph;
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
   * @returns The blob ID of the saved graph
   */
  async saveGraph(graph: KnowledgeGraph): Promise<string> {
    try {
      const graphJson = JSON.stringify(graph);
      return await this.walrusService.uploadContent(graphJson);
    } catch (error) {
      this.logger.error(`Error saving graph: ${error.message}`);
      throw new Error(`Graph save error: ${error.message}`);
    }
  }
  
  /**
   * Load a graph from Walrus
   * @param blobId The blob ID of the graph
   * @returns The loaded knowledge graph
   */
  async loadGraph(blobId: string): Promise<KnowledgeGraph> {
    try {
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