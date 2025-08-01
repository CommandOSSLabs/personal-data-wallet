import pytest
import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch
from typing import List

# Import our modules
from services.walrus_client import WalrusClient
from services.vector_store import VectorStore
from models import (
    ALRIQuiltBlob as QuiltBlob, QuiltResponse, QuiltPatchInfo, EmbeddingResult, 
    EmbeddingQuiltData, VectorIndexQuiltData
)


class TestWalrusClient:
    """Test suite for WalrusClient with Quilt functionality"""
    
    @pytest.fixture
    def walrus_client(self):
        """Create a WalrusClient instance for testing"""
        return WalrusClient()
    
    @pytest.fixture
    def sample_blob_data(self):
        """Sample blob data for testing"""
        return b"Hello, Walrus! This is test data."
    
    @pytest.fixture
    def sample_quilt_blobs(self):
        """Sample QuiltBlob objects for testing"""
        return [
            QuiltBlob(
                identifier="test_blob_1",
                data=b"First blob data",
                metadata={"type": "test", "index": "1"}
            ),
            QuiltBlob(
                identifier="test_blob_2", 
                data=b"Second blob data",
                metadata={"type": "test", "index": "2"}
            ),
            QuiltBlob(
                identifier="test_blob_3",
                data=b"Third blob data", 
                metadata={"type": "test", "index": "3"}
            )
        ]
    
    @pytest.fixture
    def sample_embeddings(self):
        """Sample embedding data for testing"""
        return [
            EmbeddingResult(
                vector=[0.1, 0.2, 0.3, 0.4],
                text="This is the first test embedding"
            ),
            EmbeddingResult(
                vector=[0.5, 0.6, 0.7, 0.8],
                text="This is the second test embedding"
            ),
            EmbeddingResult(
                vector=[0.9, 1.0, 1.1, 1.2],
                text="This is the third test embedding"
            )
        ]

    @pytest.mark.asyncio
    async def test_store_blob_success(self, walrus_client, sample_blob_data):
        """Test successful blob storage"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "newlyCreated": {
                "blobObject": {
                    "blobId": "test_blob_id_123"
                }
            }
        }
        
        with patch.object(walrus_client.client, 'put', return_value=mock_response):
            result = await walrus_client.store_blob(sample_blob_data)
            
        assert result == "test_blob_id_123"

    @pytest.mark.asyncio
    async def test_store_blob_already_certified(self, walrus_client, sample_blob_data):
        """Test blob storage when blob is already certified"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "alreadyCertified": {
                "blobId": "existing_blob_id_456"
            }
        }
        
        with patch.object(walrus_client.client, 'put', return_value=mock_response):
            result = await walrus_client.store_blob(sample_blob_data)
            
        assert result == "existing_blob_id_456"

    @pytest.mark.asyncio
    async def test_store_blob_failure(self, walrus_client, sample_blob_data):
        """Test blob storage failure"""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        
        with patch.object(walrus_client.client, 'put', return_value=mock_response):
            result = await walrus_client.store_blob(sample_blob_data)
            
        assert result is None

    @pytest.mark.asyncio
    async def test_retrieve_blob_success(self, walrus_client, sample_blob_data):
        """Test successful blob retrieval"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = sample_blob_data
        
        with patch.object(walrus_client.client, 'get', return_value=mock_response):
            result = await walrus_client.retrieve_blob("test_blob_id")
            
        assert result == sample_blob_data

    @pytest.mark.asyncio
    async def test_retrieve_blob_not_found(self, walrus_client):
        """Test blob retrieval when blob not found"""
        mock_response = MagicMock()
        mock_response.status_code = 404
        
        with patch.object(walrus_client.client, 'get', return_value=mock_response):
            result = await walrus_client.retrieve_blob("nonexistent_blob_id")
            
        assert result is None

    @pytest.mark.asyncio
    async def test_store_quilt_success(self, walrus_client, sample_quilt_blobs):
        """Test successful quilt storage"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "newlyCreated": {
                "quiltId": "test_quilt_id_789",
                "cost": 12345
            }
        }
        
        with patch.object(walrus_client.client, 'put', return_value=mock_response):
            result = await walrus_client.store_quilt(sample_quilt_blobs)
            
        assert result is not None
        assert result.quilt_id == "test_quilt_id_789"
        assert result.total_cost == 12345
        assert len(result.patches) == 3

    @pytest.mark.asyncio
    async def test_retrieve_from_quilt_by_patch_id(self, walrus_client):
        """Test retrieval from quilt by patch ID"""
        test_data = b"Retrieved blob data"
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = test_data
        
        with patch.object(walrus_client.client, 'get', return_value=mock_response):
            result = await walrus_client.retrieve_from_quilt_by_patch_id("patch_123")
            
        assert result == test_data

    @pytest.mark.asyncio
    async def test_retrieve_from_quilt_by_id(self, walrus_client):
        """Test retrieval from quilt by quilt ID and identifier"""
        test_data = b"Retrieved quilt blob data"
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = test_data
        
        with patch.object(walrus_client.client, 'get', return_value=mock_response):
            result = await walrus_client.retrieve_from_quilt_by_id("quilt_123", "identifier_456")
            
        assert result == test_data

    @pytest.mark.asyncio
    async def test_store_embeddings_quilt(self, walrus_client, sample_embeddings):
        """Test storing embeddings as a quilt"""
        embedding_data = EmbeddingQuiltData(
            user_id="test_user",
            embeddings=sample_embeddings,
            metadata={"source": "test"}
        )
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "newlyCreated": {
                "quiltId": "embeddings_quilt_123"
            }
        }
        
        with patch.object(walrus_client.client, 'put', return_value=mock_response):
            result = await walrus_client.store_embeddings_quilt(embedding_data)
            
        assert result == "embeddings_quilt_123"

    @pytest.mark.asyncio
    async def test_store_hnsw_index_quilt(self, walrus_client):
        """Test storing HNSW index as a quilt"""
        index_data = VectorIndexQuiltData(
            user_id="test_user",
            index_files={
                "index.hnsw": b"mock_hnsw_index_data",
                "index.meta": b'{"dimension": 768, "max_elements": 1000}'
            },
            metadata={"version": "1.0"}
        )
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "newlyCreated": {
                "quiltId": "index_quilt_456"
            }
        }
        
        with patch.object(walrus_client.client, 'put', return_value=mock_response):
            result = await walrus_client.store_hnsw_index_quilt(index_data)
            
        assert result == "index_quilt_456"

    @pytest.mark.asyncio
    async def test_retrieve_embeddings_from_quilt(self, walrus_client):
        """Test retrieving embeddings from quilt"""
        # Mock responses for embedding retrieval
        embedding_responses = [
            b'{"vector": [0.1, 0.2], "text": "First embedding"}',
            b'{"vector": [0.3, 0.4], "text": "Second embedding"}',
            None  # End of embeddings
        ]
        
        async def mock_get_side_effect(url):
            response = MagicMock()
            if "embedding_000000" in url:
                response.status_code = 200
                response.content = embedding_responses[0]
            elif "embedding_000001" in url:
                response.status_code = 200
                response.content = embedding_responses[1]
            else:
                response.status_code = 404
                response.content = None
            return response
        
        with patch.object(walrus_client, 'retrieve_from_quilt_by_id', side_effect=[
            embedding_responses[0], embedding_responses[1], None
        ]):
            result = await walrus_client.retrieve_embeddings_from_quilt("test_quilt")
            
        assert result is not None
        assert len(result) == 2
        assert result[0].text == "First embedding"
        assert result[1].text == "Second embedding"

    @pytest.mark.asyncio
    async def test_retry_mechanism(self, walrus_client, sample_blob_data):
        """Test retry mechanism for failed requests"""
        import httpx
        
        # First two calls fail, third succeeds
        call_count = 0
        async def mock_put(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count <= 2:
                raise httpx.TimeoutException("Timeout")
            
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "newlyCreated": {
                    "blobObject": {
                        "blobId": "retry_success_blob"
                    }
                }
            }
            return mock_response
        
        with patch.object(walrus_client.client, 'put', side_effect=mock_put):
            with patch('asyncio.sleep'):  # Speed up test by mocking sleep
                result = await walrus_client.store_blob(sample_blob_data)
                
        assert result == "retry_success_blob"
        assert call_count == 3

    @pytest.mark.asyncio
    async def test_retry_exhaustion(self, walrus_client, sample_blob_data):
        """Test retry mechanism when all attempts fail"""
        import httpx
        
        async def mock_put_always_fail(*args, **kwargs):
            raise httpx.TimeoutException("Always timeout")
        
        with patch.object(walrus_client.client, 'put', side_effect=mock_put_always_fail):
            with patch('asyncio.sleep'):  # Speed up test
                result = await walrus_client.store_blob(sample_blob_data)
                
        assert result is None


class TestVectorStoreWalrusIntegration:
    """Test suite for VectorStore integration with Walrus-Quilt"""
    
    @pytest.fixture
    def vector_store(self):
        """Create a VectorStore instance for testing"""
        return VectorStore(dimension=4, max_elements=100)
    
    @pytest.fixture
    def mock_walrus_client(self):
        """Create a mock WalrusClient for testing"""
        return AsyncMock(spec=WalrusClient)
    
    @pytest.fixture
    def sample_embeddings(self):
        """Sample embeddings for VectorStore"""
        return [
            EmbeddingResult(vector=[0.1, 0.2, 0.3, 0.4], text="Test 1"),
            EmbeddingResult(vector=[0.5, 0.6, 0.7, 0.8], text="Test 2"),
            EmbeddingResult(vector=[0.9, 1.0, 1.1, 1.2], text="Test 3")
        ]

    def test_vector_store_basic_operations(self, vector_store, sample_embeddings):
        """Test basic VectorStore operations before Walrus integration"""
        # Add embeddings
        ids = []
        for embedding in sample_embeddings:
            id = vector_store.add_embedding(embedding)
            ids.append(id)
        
        assert len(ids) == 3
        assert vector_store.current_id == 3
        
        # Test search
        query = [0.1, 0.2, 0.3, 0.4]  # Same as first embedding
        results = vector_store.search(query, k=2)
        
        assert len(results) == 2
        assert results[0][0] == "Test 1"  # Should be most similar

    @pytest.mark.asyncio
    async def test_save_to_walrus_quilt(self, vector_store, mock_walrus_client, sample_embeddings):
        """Test saving VectorStore to Walrus Quilt"""
        # Add some embeddings to the store
        for embedding in sample_embeddings:
            vector_store.add_embedding(embedding)
        
        # Mock successful storage
        mock_walrus_client.store_hnsw_index_quilt.return_value = "test_quilt_id"
        
        result = await vector_store.save_to_walrus_quilt(
            mock_walrus_client, 
            "test_user", 
            {"version": "1.0"}
        )
        
        assert result == "test_quilt_id"
        mock_walrus_client.store_hnsw_index_quilt.assert_called_once()

    @pytest.mark.asyncio
    async def test_load_from_walrus_quilt(self, vector_store, mock_walrus_client):
        """Test loading VectorStore from Walrus Quilt"""
        # Mock index files retrieval
        mock_index_files = {
            "index.hnsw": b"mock_hnsw_data",
            "index.meta": b'{"id_to_text": {"0": "Test"}, "current_id": 1, "dimension": 4, "max_elements": 100}'
        }
        mock_walrus_client.retrieve_hnsw_index_from_quilt.return_value = mock_index_files
        
        # Mock file operations
        with patch('tempfile.TemporaryDirectory') as mock_temp_dir:
            mock_temp_dir.return_value.__enter__.return_value = "/tmp/test"
            with patch('builtins.open', create=True) as mock_open:
                with patch.object(vector_store, 'load_from_file') as mock_load:
                    result = await vector_store.load_from_walrus_quilt(mock_walrus_client, "test_quilt_id")
        
        assert result is True
        mock_walrus_client.retrieve_hnsw_index_from_quilt.assert_called_once_with("test_quilt_id")

    @pytest.mark.asyncio
    async def test_backup_embeddings_to_quilt(self, vector_store, mock_walrus_client, sample_embeddings):
        """Test backing up embeddings to Walrus Quilt"""
        # Add embeddings to store
        for embedding in sample_embeddings:
            vector_store.add_embedding(embedding)
        
        # Mock successful backup
        mock_walrus_client.store_embeddings_quilt.return_value = "backup_quilt_id"
        
        result = await vector_store.backup_embeddings_to_quilt(
            mock_walrus_client,
            "test_user",
            {"backup_reason": "testing"}
        )
        
        assert result == "backup_quilt_id"
        mock_walrus_client.store_embeddings_quilt.assert_called_once()


class TestQuiltDataModels:
    """Test suite for Quilt-related data models"""
    
    def test_quilt_blob_model(self):
        """Test QuiltBlob model"""
        blob = QuiltBlob(
            identifier="test_blob",
            data=b"test data",
            metadata={"type": "test", "size": "9"}
        )
        
        assert blob.identifier == "test_blob"
        assert blob.data == b"test data"
        assert blob.metadata["type"] == "test"

    def test_quilt_response_model(self):
        """Test QuiltResponse model"""
        patches = [
            QuiltPatchInfo(patch_id="patch_1", identifier="blob_1", size=100),
            QuiltPatchInfo(patch_id="patch_2", identifier="blob_2", size=200)
        ]
        
        response = QuiltResponse(
            quilt_id="test_quilt",
            patches=patches,
            total_cost=1000
        )
        
        assert response.quilt_id == "test_quilt"
        assert len(response.patches) == 2
        assert response.total_cost == 1000

    def test_embedding_quilt_data_model(self):
        """Test EmbeddingQuiltData model"""
        embeddings = [
            EmbeddingResult(vector=[1.0, 2.0], text="Test 1"),
            EmbeddingResult(vector=[3.0, 4.0], text="Test 2")
        ]
        
        data = EmbeddingQuiltData(
            user_id="test_user",
            embeddings=embeddings,
            metadata={"source": "test"}
        )
        
        assert data.user_id == "test_user"
        assert len(data.embeddings) == 2
        assert data.metadata["source"] == "test"

    def test_vector_index_quilt_data_model(self):
        """Test VectorIndexQuiltData model"""
        index_files = {
            "index.hnsw": b"hnsw_data",
            "index.meta": b"meta_data"
        }
        
        data = VectorIndexQuiltData(
            user_id="test_user",
            index_files=index_files,
            metadata={"version": "1.0"}
        )
        
        assert data.user_id == "test_user"
        assert len(data.index_files) == 2
        assert data.metadata["version"] == "1.0"


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])