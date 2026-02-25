# Azure Configuration
$ResourceGroup = "MCP-MVP1"
$Location = "eastus"

# Container Registry
$AcrName = "mcpmvp1acr"

# Container Apps
$ContainerEnv = "mcp-mvp1-env"
$BackendAppName = "mcp-mvp1-api"
$BackendImage = "customer-management-backend"

# Static Web App
$FrontendAppName = "mcp-mvp1-frontend"

# Dataverse (update with your values)
$DataverseUrl = "https://your-org.crm.dynamics.com"
$DataverseClientId = "your-client-id"
$DataverseClientSecret = "your-client-secret"
$DataverseTenantId = "your-tenant-id"
