import asyncio
import json
import logging
from typing import Dict, Any, Optional, Callable
import httpx
from config import settings

logger = logging.getLogger(__name__)

class SuiEventsListener:
    """
    Listens to Sui blockchain events and notifies the HNSW indexer.
    Implements the event-driven architecture described in the document.
    """
    
    def __init__(self, indexer_service, walrus_client):
        self.rpc_url = settings.sui_rpc_url
        self.client = httpx.AsyncClient(timeout=30.0)
        self.indexer_service = indexer_service
        self.walrus_client = walrus_client
        self.is_running = False
        self.last_checkpoint = 0
        
        # Event handlers
        self.event_handlers = {
            "EmbeddingAdded": self._handle_embedding_added,
            "EmbeddingRemoved": self._handle_embedding_removed,
            "EmbeddingAccessed": self._handle_embedding_accessed
        }
        
        logger.info("Initialized Sui events listener")
    
    async def start(self):
        """Start listening to Sui events."""
        self.is_running = True
        logger.info("Starting Sui events listener")
        
        # Start the event polling loop
        asyncio.create_task(self._event_polling_loop())
    
    async def stop(self):
        """Stop the event listener."""
        self.is_running = False
        await self.client.aclose()
        logger.info("Stopped Sui events listener")
    
    async def _event_polling_loop(self):
        """
        Main event polling loop.
        In production, this would use Sui's event subscription API.
        """
        poll_interval = getattr(settings, 'sui_event_poll_interval', 5)
        
        while self.is_running:
            try:
                await self._poll_events()
                await asyncio.sleep(poll_interval)
            except Exception as e:
                logger.error(f"Error in event polling loop: {e}")
                await asyncio.sleep(poll_interval * 2)  # Back off on error
    
    async def _poll_events(self):
        """
        Poll for new events from Sui.
        In production, this would call sui_queryEvents RPC method.
        """
        try:
            # Simulate event polling
            # In production: response = await self._call_rpc("suix_queryEvents", {...})
            
            # For now, simulate events based on the known structure
            logger.debug(f"Polling events from checkpoint {self.last_checkpoint}")
            
            # This would normally parse real events from Sui
            # events = self._parse_events(response)
            # for event in events:
            #     await self._process_event(event)
            
        except Exception as e:
            logger.error(f"Failed to poll events: {e}")
    
    async def _process_event(self, event: Dict[str, Any]):
        """
        Process a single Sui event.
        
        Args:
            event: Event data from Sui blockchain
        """
        try:
            event_type = event.get("type", "").split("::")[-1]  # Extract event name
            
            if event_type in self.event_handlers:
                handler = self.event_handlers[event_type]
                await handler(event)
            else:
                logger.debug(f"No handler for event type: {event_type}")
                
        except Exception as e:
            logger.error(f"Failed to process event {event.get('id', 'unknown')}: {e}")
    
    async def _handle_embedding_added(self, event: Dict[str, Any]):
        """
        Handle EmbeddingAdded event from vector_index contract.
        This triggers the indexer to update its HNSW index.
        """
        try:
            parsed_event = event.get("parsedJson", {})
            
            embedding_id = parsed_event.get("embedding_id")
            owner = parsed_event.get("owner")
            walrus_hash = parsed_event.get("walrus_hash")
            metadata_vector = parsed_event.get("metadata_vector", [])
            category = parsed_event.get("category")
            ibe_identity = parsed_event.get("ibe_identity")
            timestamp = parsed_event.get("timestamp")
            
            logger.info(f"Processing EmbeddingAdded event: {embedding_id}")
            
            # Add to HNSW index
            await self.indexer_service.add_embedding(
                embedding_id=embedding_id,
                owner=owner,
                walrus_hash=walrus_hash,
                metadata_vector=metadata_vector,
                category=category,
                ibe_identity=ibe_identity,
                timestamp=timestamp
            )
            
            logger.info(f"Added embedding {embedding_id} to HNSW index")
            
        except Exception as e:
            logger.error(f"Failed to handle EmbeddingAdded event: {e}")
    
    async def _handle_embedding_removed(self, event: Dict[str, Any]):
        """Handle EmbeddingRemoved event."""
        try:
            parsed_event = event.get("parsedJson", {})
            embedding_id = parsed_event.get("embedding_id")
            
            logger.info(f"Processing EmbeddingRemoved event: {embedding_id}")
            
            # Remove from HNSW index
            await self.indexer_service.remove_embedding(embedding_id)
            
        except Exception as e:
            logger.error(f"Failed to handle EmbeddingRemoved event: {e}")
    
    async def _handle_embedding_accessed(self, event: Dict[str, Any]):
        """Handle EmbeddingAccessed event for analytics."""
        try:
            parsed_event = event.get("parsedJson", {})
            embedding_id = parsed_event.get("embedding_id")
            accessor = parsed_event.get("accessor")
            
            logger.debug(f"Embedding {embedding_id} accessed by {accessor}")
            
            # Could update access statistics here
            
        except Exception as e:
            logger.error(f"Failed to handle EmbeddingAccessed event: {e}")
    
    async def _call_rpc(self, method: str, params: list) -> Dict[str, Any]:
        """
        Make RPC call to Sui node.
        
        Args:
            method: RPC method name
            params: Method parameters
            
        Returns:
            RPC response
        """
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params
        }
        
        try:
            response = await self.client.post(
                self.rpc_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Sui RPC call failed: {e}")
            return {"error": str(e)}
    
    def simulate_embedding_added_event(self, 
                                     embedding_id: str,
                                     owner: str,
                                     walrus_hash: str,
                                     metadata_vector: list,
                                     category: str,
                                     ibe_identity: str):
        """
        Simulate an EmbeddingAdded event for testing.
        This allows testing the indexer without actual blockchain events.
        """
        event = {
            "id": {"txDigest": "mock_tx", "eventSeq": "0"},
            "packageId": "0x0",
            "transactionModule": "vector_index",
            "sender": owner,
            "type": "vector_index::EmbeddingAdded",
            "parsedJson": {
                "embedding_id": embedding_id,
                "owner": owner,
                "walrus_hash": walrus_hash,
                "metadata_vector": metadata_vector,
                "category": category,
                "ibe_identity": ibe_identity,
                "timestamp": str(int(asyncio.get_event_loop().time() * 1000))
            },
            "bcs": "mock_bcs_data",
            "timestampMs": str(int(asyncio.get_event_loop().time() * 1000))
        }
        
        # Process the simulated event
        asyncio.create_task(self._process_event(event))
        logger.info(f"Simulated EmbeddingAdded event for {embedding_id}")