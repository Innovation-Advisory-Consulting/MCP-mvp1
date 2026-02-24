import axios from 'axios';
import { config } from '../config/env.js';

class DataverseAuthService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const tokenUrl = `https://login.microsoftonline.com/${config.dataverse.tenantId}/oauth2/v2.0/token`;

      const params = new URLSearchParams({
        client_id: config.dataverse.clientId,
        client_secret: config.dataverse.clientSecret,
        scope: config.dataverse.scope,
        grant_type: 'client_credentials',
      });

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      console.log('✓ Successfully authenticated with Dataverse');
      return this.accessToken;
    } catch (error) {
      console.error('Dataverse authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Dataverse');
    }
  }

  async refreshToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
    return this.getAccessToken();
  }
}

export const authService = new DataverseAuthService();
