#!/usr/bin/env python3

from config import settings

print("Testing configuration loading...")
print(f"Google API Key: {'✓ Found' if settings.google_api_key else '✗ Missing'}")
print(f"OpenAI API Key: {'✓ Found' if settings.openai_api_key else '✗ Missing'}")
print(f"SUI Network: {settings.sui_network}")
print(f"SUI RPC URL: {settings.sui_rpc_url}")

if settings.google_api_key:
    print(f"Google API Key starts with: {settings.google_api_key[:10]}...")
else:
    print("Google API Key is None or empty")
