import { spawn } from 'child_process';

class MCPClient {
  constructor(config) {
    this.config = config;
    this.process = null;
    this.messageId = 0;
    this.pendingRequests = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.process = spawn(this.config.command, this.config.args);
      
      this.process.stdout.on('data', (data) => {
        this.handleMessage(data.toString());
      });

      this.process.stderr.on('data', (data) => {
        console.error('MCP Error:', data.toString());
      });

      this.process.on('error', reject);
      
      setTimeout(() => resolve(), 1000);
    });
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        pending.resolve(message.result);
        this.pendingRequests.delete(message.id);
      }
    } catch (e) {
      console.error('Failed to parse MCP message:', e);
    }
  }

  async sendRequest(method, params = {}) {
    const id = ++this.messageId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.process.stdin.write(JSON.stringify(request) + '\n');
      
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  async listTables() {
    return this.sendRequest('dataverse/listTables');
  }

  async query(table, options = {}) {
    return this.sendRequest('dataverse/query', { table, ...options });
  }

  async create(table, data) {
    return this.sendRequest('dataverse/create', { table, data });
  }

  async update(table, id, data) {
    return this.sendRequest('dataverse/update', { table, id, data });
  }

  async delete(table, id) {
    return this.sendRequest('dataverse/delete', { table, id });
  }

  disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

const mcpConfig = {
  command: 'C:\\Users\\jassi\\.dotnet\\tools\\Microsoft.PowerPlatform.Dataverse.MCP.exe',
  args: [
    '--EnvironmentUrl',
    'https://org1a5040d9.crm.dynamics.com/',
    '--ConnectionUrl',
    'https://make.powerautomate.com/environments/Default-844828a2-3531-4c98-ad21-6ef60f8a3ef9/connections?apiName=shared_commondataserviceforapps&connectionName=shared-commondataser-0d3c25a4-193b-4cfe-82dc-2f88c41b1e50',
    '--MCPServerName',
    'DataverseMCPServer',
    '--TenantId',
    '844828a2-3531-4c98-ad21-6ef60f8a3ef9',
    '--BackendProtocol',
    'HTTPS'
  ]
};

export const mcpClient = new MCPClient(mcpConfig);

export const accountsApi = {
  async getAll({ page = 1, limit = 10, search = '' } = {}) {
    const skip = (page - 1) * limit;
    const filter = search ? `contains(name, '${search}')` : undefined;
    return mcpClient.query('accounts', { top: limit, skip, filter });
  },

  async getById(id) {
    const result = await mcpClient.query('accounts', { filter: `accountid eq ${id}` });
    return result.value?.[0];
  },

  async create(data) {
    return mcpClient.create('accounts', data);
  },

  async update(id, data) {
    return mcpClient.update('accounts', id, data);
  },

  async delete(id) {
    return mcpClient.delete('accounts', id);
  }
};

export const contactsApi = {
  async getAll({ page = 1, limit = 10, search = '' } = {}) {
    const skip = (page - 1) * limit;
    const filter = search ? `contains(fullname, '${search}')` : undefined;
    return mcpClient.query('contacts', { top: limit, skip, filter });
  },

  async getById(id) {
    const result = await mcpClient.query('contacts', { filter: `contactid eq ${id}` });
    return result.value?.[0];
  },

  async create(data) {
    return mcpClient.create('contacts', data);
  },

  async update(id, data) {
    return mcpClient.update('contacts', id, data);
  },

  async delete(id) {
    return mcpClient.delete('contacts', id);
  }
};
