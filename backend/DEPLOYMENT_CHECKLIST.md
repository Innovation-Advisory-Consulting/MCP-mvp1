# Deployment Checklist

Use this checklist to ensure a successful deployment to Azure Container Apps.

## Pre-Deployment

### Azure AD Setup
- [ ] Create Azure AD App Registration
- [ ] Note Application (Client) ID
- [ ] Note Directory (Tenant) ID
- [ ] Create Client Secret
- [ ] Save Client Secret value (won't be shown again)
- [ ] Add API Permissions for Dynamics CRM
- [ ] Grant admin consent for API permissions
- [ ] Verify Dataverse URL (format: https://your-org.crm.dynamics.com)

### Azure Account
- [ ] Azure subscription is active
- [ ] Azure CLI installed (`az --version`)
- [ ] Logged into Azure (`az login`)
- [ ] Have necessary permissions to create resources

### Local Testing
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with credentials
- [ ] Server starts locally (`npm run dev`)
- [ ] Health endpoint works (`curl http://localhost:3001/health`)
- [ ] Can connect to Dataverse
- [ ] Test all API endpoints locally

### Docker Testing (Optional but Recommended)
- [ ] Docker installed and running
- [ ] Image builds successfully (`docker build -t customer-backend .`)
- [ ] Container runs (`docker run -p 3001:3001 --env-file .env customer-backend`)
- [ ] Health check passes in container

## Deployment

### Option A: Automated Script
- [ ] Make script executable (`chmod +x deploy-azure.sh`)
- [ ] Run deployment script (`./deploy-azure.sh`)
- [ ] Enter credentials when prompted
- [ ] Wait for deployment to complete
- [ ] Note the app URL from output

### Option B: Manual Deployment
- [ ] Create resource group
- [ ] Create Azure Container Registry
- [ ] Build and push Docker image to ACR
- [ ] Create Container Apps environment
- [ ] Create Container App
- [ ] Configure secrets
- [ ] Configure environment variables

## Post-Deployment

### Verification
- [ ] Get app URL (`az containerapp show ...`)
- [ ] Test health endpoint (`curl https://{app-url}/health`)
- [ ] Verify response: `{"status":"healthy",...}`
- [ ] Test ready endpoint (`curl https://{app-url}/ready`)
- [ ] Test customers endpoint (`curl https://{app-url}/api/customers`)
- [ ] Verify logs (`az containerapp logs show ...`)

### Configuration
- [ ] Update frontend CORS_ORIGIN if needed
- [ ] Update frontend API_URL to backend URL
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (optional, auto-provisioned)
- [ ] Configure auto-scaling rules (optional)

### Security
- [ ] Verify secrets are not in logs
- [ ] Confirm CORS is properly configured
- [ ] Test rate limiting (make 101+ requests/minute)
- [ ] Review security headers in response
- [ ] Ensure container runs as non-root user

### Monitoring
- [ ] Set up Azure Monitor (optional)
- [ ] Configure alerts for errors (optional)
- [ ] Enable Application Insights (optional)
- [ ] Set up log analytics workspace (optional)

## Testing in Production

### API Endpoints
- [ ] GET /health returns 200
- [ ] GET /ready returns 200
- [ ] GET /api/customers returns data or empty array
- [ ] POST /api/customers creates a customer
- [ ] GET /api/customers/:id retrieves customer
- [ ] PATCH /api/customers/:id updates customer
- [ ] DELETE /api/customers/:id deletes customer

### Error Handling
- [ ] GET /api/customers/invalid-id returns 404
- [ ] POST /api/customers with invalid data returns 400
- [ ] CORS from unauthorized origin is blocked

### Performance
- [ ] Response times < 500ms
- [ ] Container starts in < 30 seconds
- [ ] Health check passes consistently
- [ ] No memory leaks over time

## Frontend Integration

- [ ] Update frontend environment variables
- [ ] Update API base URL
- [ ] Test frontend can fetch customers
- [ ] Test frontend can create customers
- [ ] Test frontend can update customers
- [ ] Test frontend can delete customers
- [ ] Verify CORS works from frontend

## Documentation

- [ ] Document the backend URL
- [ ] Share API endpoints with team
- [ ] Document authentication setup
- [ ] Update project README
- [ ] Document deployment process

## Maintenance Setup

- [ ] Set calendar reminder to rotate secrets (90 days)
- [ ] Document who has access to Azure resources
- [ ] Set up monitoring/alerting
- [ ] Create runbook for common issues
- [ ] Plan for dependency updates

## Troubleshooting Checklist

If deployment fails, check:

- [ ] All required environment variables are set
- [ ] Client ID, secret, and tenant ID are correct
- [ ] Dataverse URL is correct format (https://...)
- [ ] API permissions are granted in Azure AD
- [ ] Admin consent is granted
- [ ] Service principal has access to Dataverse
- [ ] Container registry credentials are correct
- [ ] Resource group and location are valid
- [ ] No firewall/network blocking Azure services
- [ ] Logs show actual error (`az containerapp logs show`)

## Quick Commands Reference

```bash
# View logs
az containerapp logs show --name customer-backend --resource-group customer-mgmt-rg --follow

# Check status
az containerapp show --name customer-backend --resource-group customer-mgmt-rg --query "properties.runningStatus"

# Get URL
az containerapp show --name customer-backend --resource-group customer-mgmt-rg --query properties.configuration.ingress.fqdn -o tsv

# Update container
az containerapp update --name customer-backend --resource-group customer-mgmt-rg --image {new-image}

# View metrics
az monitor metrics list --resource {resource-id} --metric-names Requests

# Restart container
az containerapp revision restart --name customer-backend --resource-group customer-mgmt-rg
```

## Success Criteria

Deployment is successful when:
- [x] Health endpoint returns 200 OK
- [x] Can list customers from Dataverse
- [x] Can create a new customer
- [x] Frontend can connect to backend
- [x] CORS is working correctly
- [x] No errors in logs
- [x] Performance is acceptable (< 500ms response)
- [x] Auto-scaling is working
- [x] Health checks pass

## Sign-off

- [ ] Tested by: _________________ Date: _______
- [ ] Approved by: _______________ Date: _______
- [ ] Deployed by: _______________ Date: _______
- [ ] Production URL: _________________________
- [ ] Rollback plan documented: Yes / No
