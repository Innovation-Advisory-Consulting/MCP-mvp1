# Quick Reference Card

## Your Deployed Backend
**URL:** `https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io`

## Quick Health Check
```bash
curl https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/health
```
**Expected:** JSON with `{"status":"healthy",...}`
**If HTML:** Backend needs configuration - see TROUBLESHOOTING.md

## API Usage (Frontend)

### Import
```javascript
import { customerApi, healthApi } from '@/services/api';
import { ApiStatus } from '@/components/core/api-status';
```

### Get Customers
```javascript
const response = await customerApi.getAll({ page: 1, limit: 10, search: 'john' });
console.log(response.data); // customers array
console.log(response.pagination); // { page, limit, total }
```

### Create Customer
```javascript
await customerApi.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  city: 'Sacramento',
  state: 'CA',
  country: 'USA'
});
```

### Update Customer
```javascript
await customerApi.update('customer-id', { phone: '+1987654321' });
```

### Delete Customer
```javascript
await customerApi.delete('customer-id');
```

## Backend Commands

### View Logs
```bash
az containerapp logs show --name mcp-mvp1-api --resource-group <rg> --follow
```

### Check Status
```bash
az containerapp show --name mcp-mvp1-api --resource-group <rg> --query "properties.runningStatus"
```

### Update CORS
```bash
az containerapp update --name mcp-mvp1-api --resource-group <rg> \
  --set-env-vars CORS_ORIGIN=https://customer-management-65yx.bolt.host
```

### Add Secrets
```bash
az containerapp secret set --name mcp-mvp1-api --resource-group <rg> \
  --secrets \
    dataverse-url="https://your-org.crm.dynamics.com" \
    dataverse-client-id="your-client-id" \
    dataverse-client-secret="your-secret" \
    dataverse-tenant-id="your-tenant-id" \
    dataverse-scope="https://your-org.crm.dynamics.com/.default"
```

### Restart Container
```bash
az containerapp revision restart --name mcp-mvp1-api --resource-group <rg>
```

## Test Endpoints

```bash
# Health
curl https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/health

# List customers
curl https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/api/customers

# Create customer
curl -X POST https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/api/customers \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'
```

## Documentation

- **Integration Guide:** `BACKEND_INTEGRATION.md`
- **Troubleshooting:** `backend/TROUBLESHOOTING.md`
- **Full Docs:** `backend/README.md`
- **Deployment:** `DEPLOYMENT_COMPLETE.md`

## Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/api
```

**Backend (Container App):**
- NODE_ENV=production
- PORT=3001
- CORS_ORIGIN=https://customer-management-65yx.bolt.host
- DATAVERSE_URL=secretref:dataverse-url
- DATAVERSE_CLIENT_ID=secretref:dataverse-client-id
- DATAVERSE_CLIENT_SECRET=secretref:dataverse-client-secret
- DATAVERSE_TENANT_ID=secretref:dataverse-tenant-id
- DATAVERSE_SCOPE=secretref:dataverse-scope

## Troubleshooting

**Welcome page instead of API?**
→ See `backend/TROUBLESHOOTING.md`

**CORS errors?**
→ Update CORS_ORIGIN to match frontend URL

**Can't connect to Dataverse?**
→ Check credentials and API permissions

**Container not starting?**
→ Check logs: `az containerapp logs show`

## Success Indicators

✅ Health endpoint returns JSON
✅ Can list customers from Dataverse
✅ Frontend ApiStatus shows "healthy"
✅ No CORS errors
✅ Response times < 500ms

## Need Help?

1. Check logs first
2. Review TROUBLESHOOTING.md
3. Verify all environment variables
4. Test locally with same credentials
5. Ensure service principal has Dataverse access
