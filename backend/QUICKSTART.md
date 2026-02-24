# Quick Start Guide

## Local Development

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**

   Edit `.env` file with your Dataverse credentials:
   ```env
   DATAVERSE_URL=https://your-org.crm.dynamics.com
   DATAVERSE_CLIENT_ID=your-client-id
   DATAVERSE_CLIENT_SECRET=your-client-secret
   DATAVERSE_TENANT_ID=your-tenant-id
   ```

3. **Run the server**
   ```bash
   npm run dev
   ```

4. **Test the API**
   ```bash
   curl http://localhost:3001/health
   ```

## Docker Local Testing

1. **Build the image**
   ```bash
   docker build -t customer-backend .
   ```

2. **Run with docker-compose**
   ```bash
   docker-compose up
   ```

3. **Test**
   ```bash
   curl http://localhost:3001/health
   ```

## Deploy to Azure Container Apps

### Option 1: Automated Script

```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

Follow the prompts to enter your credentials.

### Option 2: Manual Deployment

1. **Login to Azure**
   ```bash
   az login
   ```

2. **Set variables**
   ```bash
   RESOURCE_GROUP="customer-mgmt-rg"
   ACR_NAME="customermgmtacr"
   LOCATION="eastus"
   ```

3. **Create resources**
   ```bash
   # Resource group
   az group create --name $RESOURCE_GROUP --location $LOCATION

   # Container registry
   az acr create --resource-group $RESOURCE_GROUP \
     --name $ACR_NAME --sku Basic --admin-enabled true

   # Build and push
   az acr build --registry $ACR_NAME \
     --image customer-backend:latest \
     --file Dockerfile .
   ```

4. **Deploy container app**
   ```bash
   # Create environment
   az containerapp env create \
     --name customer-mgmt-env \
     --resource-group $RESOURCE_GROUP \
     --location $LOCATION

   # Get ACR credentials
   ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
   ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

   # Create app
   az containerapp create \
     --name customer-backend \
     --resource-group $RESOURCE_GROUP \
     --environment customer-mgmt-env \
     --image $ACR_NAME.azurecr.io/customer-backend:latest \
     --target-port 3001 \
     --ingress external \
     --registry-server $ACR_NAME.azurecr.io \
     --registry-username $ACR_USERNAME \
     --registry-password $ACR_PASSWORD \
     --cpu 0.5 --memory 1Gi \
     --min-replicas 1 --max-replicas 5 \
     --secrets \
       dataverse-url=YOUR_DATAVERSE_URL \
       dataverse-client-id=YOUR_CLIENT_ID \
       dataverse-client-secret=YOUR_CLIENT_SECRET \
       dataverse-tenant-id=YOUR_TENANT_ID \
       dataverse-scope=YOUR_DATAVERSE_URL/.default \
     --env-vars \
       NODE_ENV=production \
       PORT=3001 \
       CORS_ORIGIN=https://your-frontend-url.com \
       DATAVERSE_URL=secretref:dataverse-url \
       DATAVERSE_CLIENT_ID=secretref:dataverse-client-id \
       DATAVERSE_CLIENT_SECRET=secretref:dataverse-client-secret \
       DATAVERSE_TENANT_ID=secretref:dataverse-tenant-id \
       DATAVERSE_SCOPE=secretref:dataverse-scope
   ```

5. **Get the URL**
   ```bash
   az containerapp show \
     --name customer-backend \
     --resource-group $RESOURCE_GROUP \
     --query properties.configuration.ingress.fqdn -o tsv
   ```

## Azure AD Setup

1. **Register application**
   - Go to Azure Portal → Azure AD → App registrations
   - Click "New registration"
   - Name: `customer-backend-dataverse`
   - Register

2. **Add API permissions**
   - API permissions → Add permission
   - Dynamics CRM → Application permissions
   - Select appropriate permissions
   - Grant admin consent

3. **Create client secret**
   - Certificates & secrets → New client secret
   - Copy the value immediately

4. **Note these values**
   - Application (client) ID
   - Directory (tenant) ID
   - Client secret value
   - Dataverse URL

## Testing the Deployment

```bash
# Get the app URL
APP_URL=$(az containerapp show \
  --name customer-backend \
  --resource-group customer-mgmt-rg \
  --query properties.configuration.ingress.fqdn -o tsv)

# Test health endpoint
curl https://$APP_URL/health

# Test customers endpoint
curl https://$APP_URL/api/customers

# Create a customer
curl -X POST https://$APP_URL/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  }'
```

## Monitoring

```bash
# View logs
az containerapp logs show \
  --name customer-backend \
  --resource-group customer-mgmt-rg \
  --follow

# Check status
az containerapp show \
  --name customer-backend \
  --resource-group customer-mgmt-rg \
  --query "properties.runningStatus"
```

## Updating the App

```bash
# Rebuild and push new image
az acr build --registry $ACR_NAME \
  --image customer-backend:latest \
  --file Dockerfile .

# Update container app
az containerapp update \
  --name customer-backend \
  --resource-group customer-mgmt-rg \
  --image $ACR_NAME.azurecr.io/customer-backend:latest
```

## Troubleshooting

**Problem: Authentication fails**
- Check client ID, secret, and tenant ID
- Verify API permissions in Azure AD
- Ensure admin consent is granted

**Problem: Can't connect to Dataverse**
- Verify Dataverse URL format
- Check if service principal has access
- Review firewall/network rules

**Problem: CORS errors**
- Update CORS_ORIGIN environment variable
- Ensure frontend URL is correct

**Problem: Container won't start**
- Check logs: `az containerapp logs show`
- Verify all environment variables are set
- Test health endpoint
