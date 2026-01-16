import express from 'express';
import cors from 'cors';
import { readPdfTool } from './tools/read_pdf/index.js';
import { fetchUrlContentTool } from './tools/fetch_url_content/index.js';
import { appendToFileTool } from './tools/append_to_file/index.js';
import { generatePdfTool } from './tools/generate_pdf/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Tool registry
const tools = {
  read_pdf: readPdfTool,
  fetch_url_content: fetchUrlContentTool,
  append_to_file: appendToFileTool,
  generate_pdf: generatePdfTool
};

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List available tools
app.get('/tools', (req, res) => {
  console.log('Tools list requested');
  const toolsList = Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters: tool.parameters
  }));
  res.json({ tools: toolsList });
});

// Execute a tool
app.post('/tools/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const params = req.body;

  console.log(`Tool execution requested: ${toolName}`);
  console.log(`Parameters: ${JSON.stringify(params)}`);

  const tool = tools[toolName];
  if (!tool) {
    console.log(`Tool not found: ${toolName}`);
    return res.status(404).json({ error: `Tool '${toolName}' not found` });
  }

  try {
    const result = await tool.execute(params);
    
    // Check if the result contains an error field
    if (result && result.error) {
      console.error(`Tool ${toolName} returned error: ${result.error}`);
      return res.json({ success: false, error: result.error, result });
    }
    
    console.log(`Tool ${toolName} executed successfully`);
    res.json({ success: true, result });
  } catch (error) {
    console.error(`Tool ${toolName} execution failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// MCP-style endpoint for compatibility
app.post('/mcp/call', async (req, res) => {
  const { tool, arguments: args } = req.body;

  console.log(`MCP call received for tool: ${tool}`);

  const toolHandler = tools[tool];
  if (!toolHandler) {
    console.log(`MCP tool not found: ${tool}`);
    return res.status(404).json({ error: `Tool '${tool}' not found` });
  }

  try {
    const result = await toolHandler.execute(args || {});
    console.log(`MCP tool ${tool} executed successfully`);
    res.json({ content: [{ type: 'text', text: JSON.stringify(result) }] });
  } catch (error) {
    console.error(`MCP tool ${tool} execution failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`MCP Server started on port ${PORT}`);
  console.log(`Available tools: ${Object.keys(tools).join(', ')}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Tools list: http://localhost:${PORT}/tools`);
});
