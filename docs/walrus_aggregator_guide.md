# Complete Guide to Walrus Aggregators

## Table of Contents
1. [Overview](#overview)
2. [What is a Walrus Aggregator?](#what-is-a-walrus-aggregator)
3. [Architecture & Role in the Ecosystem](#architecture--role-in-the-ecosystem)
4. [HTTP API Reference](#http-api-reference)
5. [Setting Up an Aggregator](#setting-up-an-aggregator)
6. [Public Aggregators](#public-aggregators)
7. [SDK Integration](#sdk-integration)
8. [Performance & Caching](#performance--caching)
9. [Monitoring & Operations](#monitoring--operations)
10. [Security Considerations](#security-considerations)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

## Overview

**Walrus Aggregators** are essential HTTP services that provide read access to data stored in the Walrus decentralized storage network. They serve as the bridge between client applications and the underlying storage nodes, offering a familiar HTTP interface for retrieving blobs without requiring direct interaction with the Walrus storage infrastructure.

### Key Functions
- **HTTP blob retrieval** via REST API endpoints
- **Data aggregation** from multiple storage nodes
- **Load balancing** across storage nodes
- **Data verification** and integrity checking
- **Header management** for blob attributes
- **Caching capabilities** for improved performance

## What is a Walrus Aggregator?

An aggregator is a service that allows reading blobs via HTTP requests. The steps involved in the read operation are performed by the binary client, or the aggregator service that exposes an HTTP interface to read blobs.

### Core Responsibilities

1. **Blob Reconstruction**: Reads are extremely resilient and will succeed in recovering the blob in all cases even if up to one-third of storage nodes are unavailable. In most cases, after synchronization is complete, blob can be read even if two-thirds of storage nodes are down.

2. **HTTP Interface**: Provides standard HTTP GET endpoints for blob retrieval, making it easy for web applications and traditional services to access Walrus data.

3. **Metadata Management**: The aggregator uses this facility for returning common HTTP headers by converting blob attributes to HTTP headers.

4. **No On-Chain Actions**: The aggregator does not perform any on-chain actions, and only requires specifying the address on which it listens.

## Architecture & Role in the Ecosystem

### Walrus Components Overview

From a developer perspective, some Walrus components are objects and smart contracts on Sui, and some components are Walrus-specific binaries and services. As a rule, Sui is used to manage blob and storage node metadata, while Walrus-specific services are used to store and read blob contents.

```
┌─────────────────────────────────────────┐
│               Client Apps               │
├─────────────────────────────────────────┤
│            HTTP/REST API                │
├─────────────────────────────────────────┤
│          Walrus Aggregator              │
├─────────────────────────────────────────┤
│          Storage Node Network           │
│   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │
│   │Node1│  │Node2│  │Node3│  │ ... │   │
│   └─────┘  └─────┘  └─────┘  └─────┘   │
└─────────────────────────────────────────┘
```

### Data Flow

1. **Client Request**: Client makes HTTP GET request to aggregator
2. **Node Query**: A number of storage nodes are queried for blob metadata and the slivers they store
3. **Reconstruction**: The blob is reconstructed from the recovered slivers and checked against the blob ID
4. **Response**: Aggregator returns the reconstructed blob with appropriate headers

## HTTP API Reference

### Base Endpoint Structure
```
GET /v1/blobs/{blob_id}
```

### Reading Blobs

Blobs may be read from an aggregator or daemon using HTTP GET:

```bash
# Read blob and save to file
curl "$AGGREGATOR/v1/blobs/<blob_id>" -o output_file.dat

# Print blob contents to terminal  
curl "$AGGREGATOR/v1/blobs/<blob_id>"
```

### HTTP Headers

Walrus allows a set of key-value attribute pairs to be associated with a blob object. While the key and values may be arbitrary strings to accommodate any needs of dapps, specific keys are converted to HTTP headers when serving blobs through aggregators.

**Configurable Headers**: Each aggregator can decide which headers it allows through the --allowed-headers CLI option; the defaults can be viewed through walrus aggregator --help.

#### Example Headers
```http
GET /v1/blobs/abc123 HTTP/1.1
Host: aggregator.example.com

HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 1024768
Cache-Control: public, max-age=3600
X-Walrus-Blob-ID: abc123
X-Walrus-Certified: true
```

### Content Type Detection

Modern browsers will attempt to sniff the content type for such resources, and will generally do a good job of inferring content types for media.

### API Specification

SDKs can retrieve the API specification:
```bash
# Get aggregator API spec
curl "$AGGREGATOR/v1/api"
```

## Setting Up an Aggregator

### Installation Requirements
- Walrus binary
- Network configuration
- Storage for caching (optional)

### Basic Configuration

walrus aggregator starts an "aggregator" that offers an HTTP interface to read blobs from Walrus.

```bash
# Basic aggregator setup
walrus aggregator --bind-address "127.0.0.1:31415"
```

### Advanced Configuration

```bash
# Aggregator with custom settings
walrus aggregator \
  --bind-address "0.0.0.0:8080" \
  --allowed-headers "content-type,cache-control,x-custom-header" \
  --cache-size 1GB \
  --max-concurrent-requests 100
```

### Configuration File

Create a configuration file at `~/.config/walrus/client_config.yaml`:

```yaml
# Aggregator specific configuration
aggregator:
  bind_address: "0.0.0.0:8080"
  allowed_headers:
    - content-type
    - cache-control  
    - x-walrus-*
  cache:
    enabled: true
    size: "1GB"
    ttl: "1h"
  
# Network configuration
sui:
  rpc_url: "https://fullnode.testnet.sui.io:443"
  
walrus:
  system_object: "0x..." # System object ID
```

### Docker Deployment

```dockerfile
FROM ubuntu:22.04

# Install Walrus binary
COPY walrus /usr/local/bin/
COPY client_config.yaml /app/config/

WORKDIR /app

EXPOSE 8080

CMD ["walrus", "aggregator", "--bind-address", "0.0.0.0:8080"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  walrus-aggregator:
    build: .
    ports:
      - "8080:8080"
    environment:
      - WALRUS_CONFIG_PATH=/app/config/client_config.yaml
    volumes:
      - ./cache:/app/cache
      - ./logs:/app/logs
    restart: unless-stopped
```

## Public Aggregators

For some use cases (e.g., a public website), or to just try out the HTTP API, a publicly accessible aggregator and/or publisher is required. Several entities run such aggregators and publishers.

### Known Public Aggregators

**Note**: These are periodically checked but may be temporarily unavailable:

#### Testnet
- `https://aggregator.walrus-testnet.walrus.space`
- `https://wal-aggregator-testnet.staketab.org`
- `https://walrus-testnet-aggregator.natsai.xyz`

#### Mainnet  
- `https://aggregator.walrus.space`
- `https://wal-aggregator.staketab.org`

### Environment Variables

```bash
# Set aggregator endpoint
export AGGREGATOR="https://aggregator.walrus-testnet.walrus.space"

# Test the connection
curl "$AGGREGATOR/v1/blobs/test" -I
```

### Service Limitations
Public publishers limit requests to 10 MiB by default. If you want to upload larger files, you need to run your own publisher or use the CLI.

## SDK Integration

### TypeScript SDK

For many applications, using publishers and aggregators is recommended, but the TS SDK can be useful when building applications where the application needs to directly interact with walrus or users need to pay for their own storage directly.

#### Basic Setup
```typescript
import { WalrusClient } from '@mysten/walrus';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
});

// Read blob via aggregator
const blobData = await walrusClient.readBlob({
  blobId: 'your-blob-id'
});
```

#### Error Handling
During epoch changes there may be times when the data cached in the WalrusClient can become invalid. Errors that result from this situation will extend the RetryableWalrusClientError class:

```typescript
import { RetryableWalrusClientError } from '@mysten/walrus';

try {
  const blob = await walrusClient.readBlob({ blobId });
} catch (error) {
  if (error instanceof RetryableWalrusClientError) {
    walrusClient.reset();
    // Retry your operation
    const blob = await walrusClient.readBlob({ blobId });
  }
}
```

### Go SDK Integration

```go
import "github.com/namihq/walrus-go"

// Create client with custom aggregator
client := walrus.NewClient(
    walrus.WithAggregatorURLs([]string{
        "https://custom-aggregator.example.com",
    }),
)

// Read blob data
data, err := client.Read("blob-id", &walrus.ReadOptions{})
if err != nil {
    log.Fatal(err)
}

// Read to file
err = client.ReadToFile("blob-id", "/path/to/output", nil)
if err != nil {
    log.Fatal(err)
}
```

### Building Custom Aggregators

There are a number of simple examples you can reference in the ts-sdks repo that show things like building simple aggregators and publishers with the walrus SDK.

#### Simple HTTP Server
```typescript
import express from 'express';
import { WalrusClient } from '@mysten/walrus';

const app = express();
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient: new SuiClient({
    url: getFullnodeUrl('testnet'),
  }),
});

app.get('/v1/blobs/:blobId', async (req, res) => {
  try {
    const { blobId } = req.params;
    const data = await walrusClient.readBlob({ blobId });
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('X-Walrus-Blob-ID', blobId);
    
    res.send(Buffer.from(data));
  } catch (error) {
    if (error instanceof RetryableWalrusClientError) {
      walrusClient.reset();
      res.status(503).json({ error: 'Service temporarily unavailable' });
    } else {
      res.status(404).json({ error: 'Blob not found' });
    }
  }
});

app.listen(8080, () => {
  console.log('Custom aggregator running on port 8080');
});
```

## Performance & Caching

### Nginx Caching Configuration

By layering a local Nginx cache with Cloudflare's Tiered Cache and Cache Reserve, you ensure that frequently requested blobs stay hot in memory or on-disk near users. This significantly reduces blob reconstruction overhead on storage nodes and accelerates response times for all clients.

```nginx
# nginx.conf
http {
    proxy_cache_path /cache levels=1:2 keys_zone=walrus_cache:10m 
                     max_size=16g inactive=1h use_temp_path=off;
    
    upstream walrus_aggregator {
        server walrus-node1:8080;
        server walrus-node2:8080;
        server walrus-node3:8080;
    }
    
    server {
        listen 80;
        server_name aggregator.example.com;
        
        location /v1/blobs/ {
            proxy_pass http://walrus_aggregator;
            
            # Caching configuration
            proxy_cache walrus_cache;
            proxy_cache_valid 200 1h;
            proxy_cache_valid 404 5m;
            
            # Add cache status headers
            add_header X-Cache-Status $upstream_cache_status;
            
            # Optimize for large files
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }
    }
}
```

### Cloudflare Integration

```nginx
# Enhanced caching with Cloudflare
server {
    location /v1/blobs/ {
        # Cache control headers
        expires 1h;
        add_header Cache-Control "public, immutable";
        
        # Cloudflare cache headers
        add_header CF-Cache-Status $http_cf_cache_status;
        
        proxy_pass http://walrus_aggregator;
        proxy_cache walrus_cache;
    }
}
```

### Performance Monitoring

Below is a Python script that: Publishes random data as a blob on your Walrus publisher. Fetches each published blob from the aggregator endpoint. Logs timing information to roughly distinguish cache hits from disk/origin fetches:

```python
import requests
import time
import datetime

AGGREGATOR_URL = "https://aggregator.example.com/v1/blobs/"

def benchmark_read(blob_id):
    start_time = datetime.datetime.now()
    
    response = requests.get(f"{AGGREGATOR_URL}{blob_id}")
    
    end_time = datetime.datetime.now()
    duration = (end_time - start_time).total_seconds() * 1000
    
    cache_status = response.headers.get('X-Cache-Status', 'UNKNOWN')
    
    print(f"Blob ID: {blob_id}")
    print(f"Response time: {duration:.2f}ms")
    print(f"Cache status: {cache_status}")
    
    if duration < 100:
        print("Data likely fetched from cache")
    else:
        print("Data likely fetched from disk or origin")
```

## Monitoring & Operations

### Health Checks

```bash
# Check aggregator health
curl -f http://localhost:8080/health || exit 1

# Check specific blob availability
curl -I "$AGGREGATOR/v1/blobs/test-blob-id"
```

### Metrics Collection

All services, from the storage node to aggregator and publisher export metrics that can be used to build dashboards, and logs at multiple levels to troubleshoot their operation.

#### Prometheus Configuration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'walrus-aggregator'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
```

#### Key Metrics to Monitor

- **Request rate**: `walrus_aggregator_requests_total`
- **Response latency**: `walrus_aggregator_request_duration_seconds`
- **Cache hit ratio**: `walrus_aggregator_cache_hits_total / walrus_aggregator_cache_requests_total`
- **Error rate**: `walrus_aggregator_errors_total`
- **Storage node availability**: `walrus_aggregator_nodes_available`

### Logging

```yaml
# Log configuration
logging:
  level: info
  format: json
  outputs:
    - file: /var/log/walrus-aggregator.log
    - stdout
    
  fields:
    - timestamp
    - level
    - blob_id
    - request_id
    - duration
    - cache_status
    - error
```

### Load Balancing

```yaml
# HAProxy configuration for multiple aggregators
backend walrus_aggregators
    balance roundrobin
    option httpchk GET /health
    
    server agg1 aggregator1.example.com:8080 check
    server agg2 aggregator2.example.com:8080 check
    server agg3 aggregator3.example.com:8080 check backup
```

## Security Considerations

### Access Control

```nginx
# Basic authentication
location /v1/blobs/ {
    auth_basic "Walrus Aggregator";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    proxy_pass http://walrus_aggregator;
}

# IP restrictions
location /admin/ {
    allow 192.168.1.0/24;
    deny all;
    
    proxy_pass http://walrus_aggregator;
}
```

### Rate Limiting

```nginx
# Rate limiting configuration
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        location /v1/blobs/ {
            limit_req zone=api burst=20 nodelay;
            limit_req_status 429;
            
            proxy_pass http://walrus_aggregator;
        }
    }
}
```

### HTTPS/TLS Configuration

Storage nodes can now be configured to serve TLS certificates that are publicly trusted, such as those issues by cloud providers and public authorities such as Let's Encrypt. This allows JavaScript clients to directly store and retrieve blobs from Walrus.

```nginx
server {
    listen 443 ssl http2;
    server_name aggregator.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Modern TLS configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    location /v1/blobs/ {
        proxy_pass http://walrus_aggregator;
        
        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

## Troubleshooting

### Common Issues

#### 1. **Blob Not Found (404)**
- Verify blob ID is correct
- Check if blob has expired
- Ensure aggregator can reach storage nodes

```bash
# Debug blob status
walrus blob-status <BLOB_ID>

# Check blob availability  
curl -I "$AGGREGATOR/v1/blobs/<BLOB_ID>"
```

#### 2. **Slow Response Times**
- Check cache configuration
- Monitor storage node health
- Verify network connectivity

```bash
# Test direct storage node access
walrus health --committee

# Check cache statistics
curl "$AGGREGATOR/metrics" | grep cache
```

#### 3. **Service Unavailable (503)**
- During epoch changes there may be times when the data cached in the WalrusClient can become invalid
- Check storage node availability
- Verify epoch transition status

#### 4. **Memory Issues**
Reading and writing blobs directly from storage nodes requires a lot of requests. The walrus SDK will issue all requests needed to complete these operations, but does not handling all the complexities a robust aggregator or publisher might encounter.

### Debug Commands

```bash
# Check aggregator configuration
walrus aggregator --help

# Test blob retrieval
curl -v "$AGGREGATOR/v1/blobs/test" 2>&1 | grep -E "(< |> )"

# Monitor real-time logs
tail -f /var/log/walrus-aggregator.log | jq .

# Check resource usage
docker stats walrus-aggregator
```

### Error Response Format

```json
{
  "error": {
    "code": "blob_not_found",
    "message": "The specified blob was not found",
    "blob_id": "abc123",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

## Best Practices

### 1. **High Availability Setup**
- Deploy multiple aggregator instances
- Use load balancing
- Implement health checks
- Set up monitoring alerts

### 2. **Performance Optimization**
- Enable caching at multiple levels (Nginx, CDN)
- Use appropriate cache TTL values
- Monitor cache hit ratios
- Optimize network configuration

### 3. **Security Hardening**
- Implement rate limiting
- Use HTTPS/TLS encryption
- Set up proper authentication for admin endpoints  
- Regular security updates

### 4. **Operational Excellence**
- Implement comprehensive monitoring
- Set up log aggregation
- Use infrastructure as code
- Regular backup and disaster recovery testing

### 5. **Cost Management**
- Monitor bandwidth usage
- Optimize caching strategies
- Use efficient storage node selection
- Regular performance reviews

### 6. **Development Guidelines**

```typescript
// Good: Implement retry logic
async function safeReadBlob(blobId: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await walrusClient.readBlob({ blobId });
    } catch (error) {
      if (error instanceof RetryableWalrusClientError && i < maxRetries - 1) {
        walrusClient.reset();
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}

// Good: Implement caching
const blobCache = new Map<string, { data: Uint8Array; timestamp: number }>();

async function cachedReadBlob(blobId: string, ttl = 3600000) { // 1 hour TTL
  const cached = blobCache.get(blobId);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await safeReadBlob(blobId);
  blobCache.set(blobId, { data, timestamp: Date.now() });
  return data;
}
```

---

**Walrus Aggregators** are the backbone of the Walrus ecosystem's read operations, providing reliable, scalable, and performant access to decentralized storage. By following this guide, you can effectively deploy, configure, and operate aggregators that meet the needs of modern web applications while maintaining the security and reliability expected in production environments.