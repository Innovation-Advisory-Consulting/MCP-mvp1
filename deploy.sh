#!/bin/bash

# Variables
RESOURCE_GROUP="mcp-mvp1-rg"
LOCATION="eastus"
CONTAINER_APP_NAME="mcp-mvp1-api"
CONTAINER_APP_ENV="mcp-mvp1-env"
CONTAINER_REGISTRY="mcpmvp1cr"
STATIC_WEB_APP_NAME="mcp-mvp1-frontend"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create container registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_REGISTRY \
  --sku Basic \
  --admin-enabled true

# Build and push backend image
cd backend
az acr build \
  --registry $CONTAINER_REGISTRY \
  --image mcp-backend:latest \
  --file Dockerfile \
  .
cd ..

# Create Container App environment
az containerapp env create \
  --name $CONTAINER_APP_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $CONTAINER_REGISTRY --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $CONTAINER_REGISTRY --query passwords[0].value -o tsv)

# Deploy Container App
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_APP_ENV \
  --image $CONTAINER_REGISTRY.azurecr.io/mcp-backend:latest \
  --registry-server $CONTAINER_REGISTRY.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 3001 \
  --ingress external \
  --env-vars \
    DATAVERSE_URL=$DATAVERSE_URL \
    DATAVERSE_CLIENT_ID=$DATAVERSE_CLIENT_ID \
    DATAVERSE_CLIENT_SECRET=$DATAVERSE_CLIENT_SECRET \
    DATAVERSE_TENANT_ID=$DATAVERSE_TENANT_ID

# Get Container App URL
BACKEND_URL=$(az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "Backend URL: https://$BACKEND_URL"

# Create Static Web App
az staticwebapp create \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Get deployment token
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.apiKey -o tsv)

echo "Static Web App Deployment Token: $DEPLOYMENT_TOKEN"
echo "Add this to GitHub Secrets as AZURE_STATIC_WEB_APPS_API_TOKEN"
echo ""
echo "Also add these secrets to GitHub:"
echo "VITE_API_URL=https://$BACKEND_URL/api"
echo "VITE_AUTH_STRATEGY=AZURE_AD"
echo "VITE_AZURE_AD_CLIENT_ID=<your-client-id>"
echo "VITE_AZURE_AD_TENANT_ID=<your-tenant-id>"
echo "VITE_AZURE_AD_REDIRECT_URI=<your-static-web-app-url>"
