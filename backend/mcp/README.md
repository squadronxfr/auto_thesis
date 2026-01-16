# Auto Thesis MCP Server

HTTP server exposing MCP (Model Context Protocol) tools for automatic thesis generation.

## Quick Start

### With Docker (recommended)

```bash
# Build and start the container
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Without Docker

```bash
# Install dependencies
npm install

# Start the server
npm start

# Development mode with auto-reload
npm run dev
```

The server runs on `http://localhost:3000` by default.

## API Endpoints

### Core Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check - returns server status |
| `/tools` | GET | List all available tools with descriptions and parameters |
| `/tools/:toolName` | POST | Execute a specific tool by name |
| `/mcp/call` | POST | MCP-compatible endpoint for AI backends |

### Available Tool Routes

| Tool Name | Route | Description |
|-----------|-------|-------------|
| `read_pdf` | `POST /tools/read_pdf` | Read and extract text from PDF files |
| `fetch_url_content` | `POST /tools/fetch_url_content` | Search the web or fetch content from URLs |
| `append_to_file` | `POST /tools/append_to_file` | Append content to files |
| `generate_pdf` | `POST /tools/generate_pdf` | Convert markdown content to PDF |

## Available Tools

### 1. read_pdf

Read and extract text from PDF files.

**Request:**
```json
POST /tools/read_pdf
{
  "file_path": "methodology.pdf"
}
```

Or with base64 content:
```json
{
  "base64_content": "JVBERi0xLjQK..."
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "text": "Extracted text content...",
    "num_pages": 10,
    "info": { ... },
    "metadata": { ... }
  }
}
```

### 2. fetch_url_content

Search the web or fetch content from specific URLs.

**Search request:**
```json
POST /tools/fetch_url_content
{
  "search_query": "machine learning thesis methodology",
  "max_results": 5,
  "fetch_content": true
}
```

**Direct URL request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "query": "machine learning thesis methodology",
    "results": [
      {
        "title": "Article Title",
        "url": "https://...",
        "snippet": "...",
        "content": "Full article content..."
      }
    ]
  }
}
```

### 3. append_to_file

Append content to a file (creates it if missing).

**Request:**
```json
POST /tools/append_to_file
{
  "file_path": "thesis/chapter1.md",
  "content": "# Chapter 1\n\nIntroduction...",
  "add_newline": true,
  "create_if_missing": true
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "file_path": "thesis/chapter1.md",
    "bytes_written": 42,
    "total_size": 1024,
    "created": false
  }
}
```

### 4. generate_pdf

Convert markdown content to a professional PDF document.

**Request:**
```json
POST /tools/generate_pdf
{
  "file_path": "thesis.pdf",
  "content": "# My Thesis\n\n## Introduction\n\nContent...",
  "title": "My Academic Thesis"
}
```

**Parameters:**
- `file_path` (required): Output PDF file path relative to data directory
- `content` (required): Markdown content to convert to PDF
- `title` (optional): PDF document title (default: "Document")

**Response:**
```json
{
  "success": true,
  "result": {
    "format": "pdf",
    "size": 45678,
    "created": true,
    "path": "thesis.pdf"
  }
}
```



For AI backends using MCP protocol:

```json
POST /mcp/call
{
  "tool": "read_pdf",
  "arguments": {
    "file_path": "methodology.pdf"
  }
}
```

## Data Directory

Files are stored in the `./data` directory (mounted as `/app/data` in Docker).

Place PDF files to read in this directory, and thesis output files will be created here.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `DATA_DIR` | ./data | Data directory path |
| `NODE_ENV` | production | Node environment |

## Integration with AI Backend

Example Python code to call the MCP server:

```python
import requests

MCP_URL = "http://localhost:3000"

# 1. Read a PDF
response = requests.post(f"{MCP_URL}/tools/read_pdf", json={
    "file_path": "methodology.pdf"
})
pdf_content = response.json()["result"]["text"]

# 2. Search the web with AI-generated terms
response = requests.post(f"{MCP_URL}/tools/fetch_url_content", json={
    "search_query": "machine learning applications in healthcare",
    "max_results": 10,
    "fetch_content": True
})
search_results = response.json()["result"]["results"]

# 3. Fetch a specific URL
response = requests.post(f"{MCP_URL}/tools/fetch_url_content", json={
    "url": "https://example.com/article"
})
url_content = response.json()["result"]["content"]

# 4. Write content to a file
response = requests.post(f"{MCP_URL}/tools/append_to_file", json={
    "file_path": "thesis/chapter1.md",
    "content": "# Chapter 1\n\nIntroduction...",
    "add_newline": True,
    "create_if_missing": True
})

# 5. Generate a PDF from markdown
response = requests.post(f"{MCP_URL}/tools/generate_pdf", json={
    "file_path": "thesis_output.pdf",
    "content": "# My Thesis\n\n## Section 1\n\nContent...",
    "title": "My Academic Thesis"
})
pdf_info = response.json()["result"]

# Using MCP-compatible endpoint
response = requests.post(f"{MCP_URL}/mcp/call", json={
    "tool": "read_pdf",
    "arguments": {"file_path": "methodology.pdf"}
})
result = response.json()["content"][0]["text"]
```

## Complete Thesis Generation Workflow

Example workflow showing how to use all tools together:

```python
import requests
import json

MCP_URL = "http://localhost:3000"

# Step 1: Read methodology PDF
print("Step 1: Reading methodology...")
response = requests.post(f"{MCP_URL}/tools/read_pdf", json={
    "file_path": "methodologie.pdf"
})
methodology = response.json()["result"]["text"]

# Step 2: Search web for relevant sources
print("Step 2: Searching for sources...")
response = requests.post(f"{MCP_URL}/tools/fetch_url_content", json={
    "search_query": "artificial intelligence in healthcare 2024",
    "max_results": 10,
    "fetch_content": True
})
sources = response.json()["result"]["results"]

# Step 3: Compile thesis content (with AI/Gemini)
thesis_content = f"""# Thesis Title

## Methodology
{methodology[:500]}...

## Literature Review
Based on {len(sources)} sources found:
"""

for source in sources:
    thesis_content += f"- [{source['title']}]({source['url']})\n"

# Step 4: Generate PDF
print("Step 3: Generating PDF...")
response = requests.post(f"{MCP_URL}/tools/generate_pdf", json={
    "file_path": "complete_thesis.pdf",
    "content": thesis_content,
    "title": "Complete Thesis"
})
print(f"PDF generated: {response.json()['result']}")
```

## Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### List Available Tools
```bash
curl http://localhost:3000/tools
```

### Test read_pdf
```bash
curl -X POST http://localhost:3000/tools/read_pdf \
  -H "Content-Type: application/json" \
  -d '{"file_path": "methodology.pdf"}'
```

### Test fetch_url_content (Web Search)
```bash
curl -X POST http://localhost:3000/tools/fetch_url_content \
  -H "Content-Type: application/json" \
  -d '{
    "search_query": "artificial intelligence healthcare 2024",
    "max_results": 5,
    "fetch_content": true
  }'
```

### Test fetch_url_content (Direct URL)
```bash
curl -X POST http://localhost:3000/tools/fetch_url_content \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

### Test append_to_file
```bash
curl -X POST http://localhost:3000/tools/append_to_file \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "test.txt",
    "content": "Hello World",
    "add_newline": true,
    "create_if_missing": true
  }'
```

### Test generate_pdf
```bash
curl -X POST http://localhost:3000/tools/generate_pdf \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "output.pdf",
    "content": "# My Document\n\n## Section 1\n\nContent here...",
    "title": "My Document"
  }'
```

### Test MCP-compatible endpoint
```bash
curl -X POST http://localhost:3000/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "read_pdf",
    "arguments": {"file_path": "methodology.pdf"}
  }'
```
