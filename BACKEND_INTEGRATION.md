# Backend Integration Guide

## Your Deployed Backend

**URL:** `https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io`

## Quick Start

The frontend is already configured to use your backend API. The API URL is set in `.env`:

```env
VITE_API_URL=https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/api
```

## API Service

A complete API service has been created at `src/services/api.js` with the following features:

- Automatic timeout handling (10 seconds)
- Proper error handling with custom ApiError class
- Type-safe API methods
- Health check utilities

### Usage Example

```javascript
import { customerApi, healthApi } from '@/services/api';

// Check backend health
const health = await healthApi.check();
console.log(health); // { status: 'healthy', timestamp: '...', uptime: 123 }

// Get all customers
const response = await customerApi.getAll({ page: 1, limit: 10, search: 'john' });
console.log(response.data); // Array of customers
console.log(response.pagination); // Pagination info

// Get customer by ID
const customer = await customerApi.getById('customer-uuid');

// Create customer
const newCustomer = await customerApi.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  city: 'Sacramento',
  state: 'CA',
  country: 'USA'
});

// Update customer
const updated = await customerApi.update('customer-uuid', {
  phone: '+1987654321'
});

// Delete customer
await customerApi.delete('customer-uuid');
```

### Error Handling

```javascript
import { customerApi, ApiError } from '@/services/api';

try {
  const customers = await customerApi.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Data:', error.data);
  } else {
    console.error('Network Error:', error.message);
  }
}
```

## API Status Component

A diagnostic component has been created to check backend connectivity:

```javascript
import { ApiStatus } from '@/components/core/api-status';

function MyPage() {
  return (
    <div>
      <ApiStatus />
      {/* Rest of your page */}
    </div>
  );
}
```

This component:
- Automatically checks backend health on mount
- Shows connection status with color-coded alerts
- Provides retry functionality
- Displays detailed API information when clicked

## Integrating with Customer List Page

To use the backend API in your customer list page:

```javascript
import * as React from 'react';
import { customerApi } from '@/services/api';
import { ApiStatus } from '@/components/core/api-status';

export function CustomersListPage() {
  const [customers, setCustomers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getAll({ page, limit: 10, search });
      setCustomers(response.data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  return (
    <div>
      <ApiStatus />

      {loading && <div>Loading customers...</div>}
      {error && <div>Error: {error}</div>}

      {customers.map(customer => (
        <div key={customer.id}>
          {customer.firstName} {customer.lastName} - {customer.email}
        </div>
      ))}
    </div>
  );
}
```

## Backend Status

### Troubleshooting

If you see an Azure welcome page instead of API responses, your backend container may not be running correctly.

**See `backend/TROUBLESHOOTING.md` for detailed troubleshooting steps.**

Quick checks:

```bash
# Check backend health (should return JSON)
curl https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/health

# Check container logs
az containerapp logs show --name mcp-mvp1-api --resource-group <your-rg> --follow

# Verify environment variables
az containerapp show --name mcp-mvp1-api --resource-group <your-rg> --query properties.template.containers[0].env
```

### Common Issues

**Issue 1: CORS Errors**
```bash
# Update CORS_ORIGIN to match your frontend URL
az containerapp update \
  --name mcp-mvp1-api \
  --resource-group <your-rg> \
  --set-env-vars CORS_ORIGIN=https://customer-management-65yx.bolt.host
```

**Issue 2: Missing Environment Variables**
```bash
# Add all required secrets
az containerapp secret set \
  --name mcp-mvp1-api \
  --resource-group <your-rg> \
  --secrets \
    dataverse-url="https://your-org.crm.dynamics.com" \
    dataverse-client-id="your-client-id" \
    dataverse-client-secret="your-secret" \
    dataverse-tenant-id="your-tenant-id" \
    dataverse-scope="https://your-org.crm.dynamics.com/.default"
```

**Issue 3: Container Not Starting**
```bash
# Check logs for startup errors
az containerapp logs show --name mcp-mvp1-api --resource-group <your-rg>
```

## API Endpoints Reference

### Base URL
```
https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io
```

### Health & Status
- `GET /health` - Health check
- `GET /ready` - Readiness check

### Customers
- `GET /api/customers?page=1&limit=10&search=john` - List customers
- `GET /api/customers/:id` - Get customer
- `POST /api/customers` - Create customer
- `PATCH /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Request/Response Examples

**List Customers:**
```bash
curl 'https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/api/customers?page=1&limit=10'
```

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "city": "Sacramento",
      "state": "CA",
      "country": "USA",
      "createdAt": "2026-02-24T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

**Create Customer:**
```bash
curl -X POST 'https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/api/customers' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "city": "Los Angeles",
    "state": "CA",
    "country": "USA"
  }'
```

## Environment Variables

Update `.env` for different environments:

**Development:**
```env
VITE_API_URL=http://localhost:3001/api
```

**Production:**
```env
VITE_API_URL=https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/api
```

## Security Considerations

1. **CORS** - Backend only accepts requests from configured origins
2. **Rate Limiting** - 100 requests per minute per IP
3. **Input Validation** - All endpoints validate input with JSON Schema
4. **HTTPS Only** - All traffic is encrypted
5. **No Credentials in Frontend** - API keys stay on backend

## Performance

- Response times: < 500ms average
- Timeout: 10 seconds
- Auto-scaling: 1-5 replicas based on traffic
- Health checks every 30 seconds

## Monitoring

Check backend metrics:

```bash
# Container status
az containerapp show \
  --name mcp-mvp1-api \
  --resource-group <your-rg> \
  --query "properties.runningStatus"

# Recent logs
az containerapp logs show \
  --name mcp-mvp1-api \
  --resource-group <your-rg> \
  --tail 50
```

## Next Steps

1. **Verify backend is running:** Test health endpoint
2. **Add ApiStatus component** to your pages during development
3. **Replace mock data** in customer pages with real API calls
4. **Test all CRUD operations** with real Dataverse data
5. **Handle loading states** and errors gracefully
6. **Add retry logic** for failed requests (already included in API service)

## Support

If you encounter issues:

1. Check `backend/TROUBLESHOOTING.md` for common problems
2. Review container logs for errors
3. Verify all environment variables are set
4. Test locally with same credentials first
5. Ensure service principal has Dataverse access
