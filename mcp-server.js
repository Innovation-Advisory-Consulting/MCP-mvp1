import { spawn } from 'child_process';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

class MCPClient {
  constructor() {
    this.process = null;
    this.messageId = 0;
    this.pendingRequests = new Map();
    this.buffer = '';
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.process = spawn(
        '/mnt/c/Users/jassi/.dotnet/tools/Microsoft.PowerPlatform.Dataverse.MCP.exe',
        [
          '--EnvironmentUrl', 'https://org1a5040d9.crm.dynamics.com/',
          '--ConnectionUrl', 'https://make.powerautomate.com/environments/Default-844828a2-3531-4c98-ad21-6ef60f8a3ef9/connections?apiName=shared_commondataserviceforapps&connectionName=shared-commondataser-0d3c25a4-193b-4cfe-82dc-2f88c41b1e50',
          '--MCPServerName', 'DataverseMCPServer',
          '--TenantId', '844828a2-3531-4c98-ad21-6ef60f8a3ef9',
          '--BackendProtocol', 'HTTPS'
        ]
      );

      this.process.stdout.on('data', (data) => {
        this.buffer += data.toString();
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop();
        lines.forEach(line => line && this.handleMessage(line));
      });

      this.process.stderr.on('data', (data) => {
        console.error('MCP Error:', data.toString());
      });

      this.process.on('error', reject);
      setTimeout(() => resolve(), 2000);
    });
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
        this.pendingRequests.delete(message.id);
      }
    } catch (e) {
      console.error('Failed to parse:', e);
    }
  }

  async sendRequest(method, params = {}) {
    const id = ++this.messageId;
    const request = { jsonrpc: '2.0', id, method, params };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.process.stdin.write(JSON.stringify(request) + '\n');
      
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Timeout'));
        }
      }, 30000);
    });
  }
}

const mcp = new MCPClient();

app.get('/api/accounts', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    const filter = search ? `contains(name, '${search}')` : undefined;
    const result = await mcp.sendRequest('tools/call', {
      name: 'query_records',
      arguments: { entity: 'account', top: parseInt(limit), skip, filter }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/accounts/:id', async (req, res) => {
  try {
    const result = await mcp.sendRequest('tools/call', {
      name: 'retrieve_record',
      arguments: { entity: 'account', id: req.params.id }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/accounts', async (req, res) => {
  try {
    const result = await mcp.sendRequest('tools/call', {
      name: 'create_record',
      arguments: { entity: 'account', data: req.body }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/accounts/:id', async (req, res) => {
  try {
    const result = await mcp.sendRequest('tools/call', {
      name: 'update_record',
      arguments: { entity: 'account', id: req.params.id, data: req.body }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/accounts/:id', async (req, res) => {
  try {
    await mcp.sendRequest('tools/call', {
      name: 'delete_record',
      arguments: { entity: 'account', id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contacts', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    const filter = search ? `contains(fullname, '${search}')` : undefined;
    const result = await mcp.sendRequest('tools/call', {
      name: 'query_records',
      arguments: { entity: 'contact', top: parseInt(limit), skip, filter }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const result = await mcp.sendRequest('tools/call', {
      name: 'retrieve_record',
      arguments: { entity: 'contact', id: req.params.id }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const result = await mcp.sendRequest('tools/call', {
      name: 'create_record',
      arguments: { entity: 'contact', data: req.body }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/contacts/:id', async (req, res) => {
  try {
    const result = await mcp.sendRequest('tools/call', {
      name: 'update_record',
      arguments: { entity: 'contact', id: req.params.id, data: req.body }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    await mcp.sendRequest('tools/call', {
      name: 'delete_record',
      arguments: { entity: 'contact', id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

await mcp.connect();
console.log('MCP Client connected');

app.listen(3002, () => {
  console.log('MCP Proxy Server running on http://localhost:3002');
});
