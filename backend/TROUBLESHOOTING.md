# Backend Troubleshooting Guide

Your backend is deployed at: `https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io`

## Current Issue: Welcome Page Instead of API

If you're seeing an Azure welcome page instead of your API responses, the container may not be starting correctly.

### Step 1: Check Container Logs

```bash
az containerapp logs show \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group> \
  --follow
```

Look for:
- Startup errors
- Environment variable errors
- Dataverse connection errors
- Port binding issues

### Step 2: Verify Environment Variables

Check if all required secrets are set:

```bash
az containerapp show \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group> \
  --query properties.template.containers[0].env
```

Required variables:
- `NODE_ENV=production`
- `PORT=3001`
- `CORS_ORIGIN` (your frontend URL)
- `DATAVERSE_URL`
- `DATAVERSE_CLIENT_ID`
- `DATAVERSE_CLIENT_SECRET`
- `DATAVERSE_TENANT_ID`
- `DATAVERSE_SCOPE`

### Step 3: Check Container Configuration

Verify the container is configured correctly:

```bash
az containerapp show \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group> \
  --query properties.configuration.ingress
```

Should show:
- `targetPort: 3001`
- `external: true`
- `allowInsecure: false`

### Step 4: Verify Image is Correct

Check which image is running:

```bash
az containerapp show \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group> \
  --query properties.template.containers[0].image -o tsv
```

### Step 5: Check Revision Status

```bash
az containerapp revision list \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group> \
  --query "[].{name:name, active:properties.active, status:properties.runningState}"
```

### Common Issues and Solutions

#### Issue 1: Missing Environment Variables

**Symptoms:** Container crashes or restarts constantly

**Solution:** Add missing secrets

```bash
# List current secrets
az containerapp secret list \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group>

# Add missing secrets
az containerapp secret set \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group> \
  --secrets \
    dataverse-url="https://your-org.crm.dynamics.com" \
    dataverse-client-id="your-client-id" \
    dataverse-client-secret="your-client-secret" \
    dataverse-tenant-id="your-tenant-id" \
    dataverse-scope="https://your-org.crm.dynamics.com/.default"

# Update environment variables to reference secrets
az containerapp update \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group> \
  --set-env-vars \
    NODE_ENV=production \
    PORT=3001 \
    CORS_ORIGIN=https://customer-management-65yx.bolt.host \
    DATAVERSE_URL=secretref:dataverse-url \
    DATAVERSE_CLIENT_ID=secretref:dataverse-client-id \
    DATAVERSE_CLIENT_SECRET=secretref:dataverse-client-secret \
    DATAVERSE_TENANT_ID=secretref:dataverse-tenant-id \
    DATAVERSE_SCOPE=secretref:dataverse-scope
```

#### Issue 2: Wrong Port Configuration

**Symptoms:** Welcome page, app not responding

**Solution:** Update ingress port

```bash
az containerapp ingress update \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group> \
  --target-port 3001
```

#### Issue 3: Image Not Deployed

**Symptoms:** Welcome page, no logs from your app

**Solution:** Redeploy with correct image

```bash
# Get your ACR name
ACR_NAME=<your-acr-name>

# Rebuild and push
cd backend
az acr build \
  --registry $ACR_NAME \
  --image customer-backend:latest \
  --file Dockerfile .

# Update container app
az containerapp update \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group> \
  --image $ACR_NAME.azurecr.io/customer-backend:latest
```

#### Issue 4: Authentication to Dataverse Fails

**Symptoms:** Logs show 401 or authentication errors

**Solution:** Verify Azure AD credentials

1. Check client ID, secret, tenant ID are correct
2. Verify API permissions in Azure AD
3. Ensure admin consent is granted
4. Check if service principal has access to Dataverse

```bash
# Test authentication locally first
cd backend
npm install
# Update .env with credentials
npm run dev

# Then test endpoint
curl http://localhost:3001/health
curl http://localhost:3001/api/customers
```

#### Issue 5: CORS Errors from Frontend

**Symptoms:** Browser console shows CORS errors

**Solution:** Update CORS_ORIGIN

```bash
az containerapp update \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group> \
  --set-env-vars CORS_ORIGIN=https://customer-management-65yx.bolt.host
```

### Step 6: Manual Test Endpoints

Once the container is running correctly, test these endpoints:

```bash
API_URL="https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io"

# Health check
curl $API_URL/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":123,"environment":"production"}

# Ready check
curl $API_URL/ready

# List customers
curl $API_URL/api/customers

# Create customer (with test data)
curl -X POST $API_URL/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+1234567890"
  }'
```

### Step 7: Restart the Container App

If all else fails, restart the container:

```bash
az containerapp revision restart \
  --name mcp-mvp1-api \
  --resource-group <your-resource-group>
```

### Debug Checklist

- [ ] Logs show "Customer Management Backend - Dataverse Integration" banner
- [ ] Logs show "Environment: production"
- [ ] No errors about missing environment variables
- [ ] No authentication errors to Dataverse
- [ ] Health endpoint returns JSON (not HTML)
- [ ] Can list customers from Dataverse
- [ ] No CORS errors from frontend

### Getting Help

If you're still stuck:

1. **Check logs carefully** - Most issues show up in logs
2. **Test locally first** - Verify the app works locally with same credentials
3. **Verify Azure AD setup** - Ensure service principal has correct permissions
4. **Check network connectivity** - Ensure Container Apps can reach Dataverse

### Quick Commands Reference

```bash
# View logs
az containerapp logs show --name mcp-mvp1-api --resource-group <rg> --follow

# Show configuration
az containerapp show --name mcp-mvp1-api --resource-group <rg>

# List secrets
az containerapp secret list --name mcp-mvp1-api --resource-group <rg>

# Update image
az containerapp update --name mcp-mvp1-api --resource-group <rg> --image <new-image>

# Restart
az containerapp revision restart --name mcp-mvp1-api --resource-group <rg>

# Delete and recreate (last resort)
az containerapp delete --name mcp-mvp1-api --resource-group <rg>
# Then run deploy script again
```

### Success Indicators

When everything is working:

1. Health endpoint returns JSON:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-02-24T...",
     "uptime": 123.45,
     "environment": "production"
   }
   ```

2. Logs show successful startup
3. Can create/read/update/delete customers
4. Frontend can connect without CORS errors
5. Response times are < 500ms

### Next Steps After Resolution

Once the backend is working:

1. Update frontend `.env` file with API URL
2. Test all CRUD operations from frontend
3. Set up monitoring and alerts
4. Configure auto-scaling if needed
5. Set up CI/CD pipeline for updates
