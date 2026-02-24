import axios from 'axios';
import { config } from '../config/env.js';
import { authService } from './dataverseAuth.js';

class DataverseClient {
  constructor() {
    this.baseURL = `${config.dataverse.url}/api/data/v9.2`;
  }

  async request(method, endpoint, data = null, retries = 1) {
    try {
      const token = await authService.getAccessToken();

      const axiosConfig = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
      };

      if (data) {
        axiosConfig.data = data;
      }

      const response = await axios(axiosConfig);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401 && retries > 0) {
        await authService.refreshToken();
        return this.request(method, endpoint, data, retries - 1);
      }

      console.error('Dataverse API error:', {
        endpoint,
        status: error.response?.status,
        message: error.response?.data?.error?.message || error.message,
      });

      throw error;
    }
  }

  async get(endpoint) {
    return this.request('GET', endpoint);
  }

  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  async patch(endpoint, data) {
    return this.request('PATCH', endpoint, data);
  }

  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

export const dataverseClient = new DataverseClient();
