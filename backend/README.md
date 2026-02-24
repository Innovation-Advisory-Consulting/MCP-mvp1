# Customer Management Backend - Dataverse Integration

Backend API service that connects to Microsoft Dynamics 365 Dataverse for customer management.

## Features

- RESTful API for customer CRUD operations
- Microsoft Dataverse integration using OAuth 2.0 Client Credentials flow
- Automatic token refresh and retry logic
- CORS support for frontend integration
- Docker containerization for Azure Container Apps
- Production-ready error handling and logging

## Prerequisites

1. **Azure AD App Registration**
   - Register an application in Azure Active Directory
   - Configure API permissions for Dynamics 365
   - Create a client secret
   - Note down: Client ID, Client Secret, and Tenant ID

2. **Dataverse Instance**
   - Active Microsoft Dynamics 365 environment
   - URL to your Dataverse instance (e.g., `https://yourorg.crm.dynamics.com`)

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.azurewebsites.net
DATAVERSE_URL=https://your-org.crm.dynamics.com
DATAVERSE_CLIENT_ID=your-client-id-here
DATAVERSE_CLIENT_SECRET=your-client-secret-here
DATAVERSE_TENANT_ID=your-tenant-id-here
DATAVERSE_SCOPE=https://your-org.crm.dynamics.com/.default
```

## API Endpoints

### Customers

- `GET /api/customers` - List all customers
  - Query params: `page`, `limit`, `search`
  - Response: `{ data: [], pagination: {} }`

- `GET /api/customers/:id` - Get customer by ID
  - Response: `{ data: {} }`

- `POST /api/customers` - Create new customer
  - Body: `{ firstName, lastName, email, phone?, address?, city?, state?, postalCode?, country? }`
  - Response: `{ data: {} }`

- `PATCH /api/customers/:id` - Update customer
  - Body: Partial customer object
  - Response: `{ data: {} }`

- `DELETE /api/customers/:id` - Delete customer
  - Response: `204 No Content`

### Health Check

- `GET /health` - Health check endpoint
  - Response: `{ status: 'healthy', timestamp: '...' }`

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required variables

3. Run the server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Building Docker Image

```bash
docker build -t customer-management-backend .
```

## Running with Docker

```bash
docker run -p 3001:3001 \
  -e DATAVERSE_URL=your-url \
  -e DATAVERSE_CLIENT_ID=your-client-id \
  -e DATAVERSE_CLIENT_SECRET=your-secret \
  -e DATAVERSE_TENANT_ID=your-tenant-id \
  customer-management-backend
```

## Deploying to Azure Container Apps

### 1. Build and Push to Azure Container Registry

```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name rg-customer-management --location eastus

# Create Azure Container Registry
az acr create \
  --resource-group rg-customer-management \
  --name yourregistryname \
  --sku Basic

# Login to ACR
az acr login --name yourregistryname

# Build and push image
az acr build \
  --registry yourregistryname \
  --image customer-management-backend:latest \
  --file backend/Dockerfile \
  backend/
```

### 2. Create Azure Container App

```bash
# Create Container Apps environment
az containerapp env create \
  --name customer-mgmt-env \
  --resource-group rg-customer-management \
  --location eastus

# Deploy container app
az containerapp create \
  --name customer-management-api \
  --resource-group rg-customer-management \
  --environment customer-mgmt-env \
  --image yourregistryname.azurecr.io/customer-management-backend:latest \
  --target-port 3001 \
  --ingress external \
  --registry-server yourregistryname.azurecr.io \
  --env-vars \
    PORT=3001 \
    NODE_ENV=production \
    DATAVERSE_URL=secretref:dataverse-url \
    DATAVERSE_CLIENT_ID=secretref:dataverse-client-id \
    DATAVERSE_CLIENT_SECRET=secretref:dataverse-client-secret \
    DATAVERSE_TENANT_ID=secretref:dataverse-tenant-id \
    CORS_ORIGIN=https://your-frontend-url.azurewebsites.net
```

### 3. Add Secrets

```bash
az containerapp secret set \
  --name customer-management-api \
  --resource-group rg-customer-management \
  --secrets \
    dataverse-url=https://your-org.crm.dynamics.com \
    dataverse-client-id=your-client-id \
    dataverse-client-secret=your-client-secret \
    dataverse-tenant-id=your-tenant-id
```

### 4. Get the App URL

```bash
az containerapp show \
  --name customer-management-api \
  --resource-group rg-customer-management \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

## Azure AD App Registration Setup

1. Go to Azure Portal → Azure Active Directory → App registrations
2. Click "New registration"
3. Name: `customer-management-dataverse`
4. Supported account types: "Accounts in this organizational directory only"
5. Click "Register"

### Configure API Permissions

1. Go to "API permissions"
2. Click "Add a permission"
3. Select "Dynamics CRM"
4. Select "Delegated permissions" → "user_impersonation"
5. Click "Add permissions"
6. Click "Grant admin consent"

### Create Client Secret

1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Add description and expiry
4. Copy the secret value (you won't see it again!)

### Note Important Values

- Application (client) ID
- Directory (tenant) ID
- Client secret value

## Monitoring

Check logs in Azure:

```bash
az containerapp logs show \
  --name customer-management-api \
  --resource-group rg-customer-management \
  --follow
```

## Troubleshooting

### Authentication Issues

- Verify client ID, secret, and tenant ID are correct
- Check API permissions in Azure AD
- Ensure admin consent is granted
- Verify Dataverse URL format (should include https://)

### Connection Issues

- Check if container app is running
- Verify network/firewall rules
- Test health endpoint: `https://your-app-url/health`

### CORS Issues

- Update `CORS_ORIGIN` environment variable
- Ensure frontend URL is correct

## Security Notes

- Never commit `.env` file or secrets to git
- Rotate client secrets regularly
- Use Azure Key Vault for production secrets
- Enable diagnostic logging for audit trail
- Configure appropriate CORS origins

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.js              # Environment configuration
│   ├── controllers/
│   │   └── customerController.js   # Customer CRUD logic
│   ├── middleware/
│   │   └── errorHandler.js     # Error handling middleware
│   ├── routes/
│   │   └── customerRoutes.js   # API route definitions
│   ├── services/
│   │   ├── dataverseAuth.js    # Authentication service
│   │   └── dataverseClient.js  # Dataverse API client
│   └── server.js               # Express app setup
├── Dockerfile                  # Container definition
├── .dockerignore
├── .env.example                # Environment template
├── package.json
└── README.md
```
