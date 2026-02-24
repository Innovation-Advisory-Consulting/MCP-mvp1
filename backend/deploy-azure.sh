#!/bin/bash

set -e

RESOURCE_GROUP="customer-mgmt-rg"
LOCATION="eastus"
ACR_NAME="customermgmtacr"
CONTAINER_APP_NAME="customer-backend"
CONTAINER_ENV_NAME="customer-mgmt-env"
IMAGE_NAME="customer-backend"
IMAGE_TAG="latest"

echo "================================"
echo "Azure Container App Deployment"
echo "================================"
echo ""

read -p "Enter your Dataverse URL (e.g., https://yourorg.crm.dynamics.com): " DATAVERSE_URL
read -p "Enter your Azure AD Client ID: " CLIENT_ID
read -s -p "Enter your Azure AD Client Secret: " CLIENT_SECRET
echo ""
read -p "Enter your Azure AD Tenant ID: " TENANT_ID
read -p "Enter your frontend URL (e.g., https://your-app.azurewebsites.net): " FRONTEND_URL

echo ""
echo "Step 1: Creating resource group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

echo ""
echo "Step 2: Creating Azure Container Registry..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

echo ""
echo "Step 3: Building and pushing Docker image..."
az acr build \
  --registry $ACR_NAME \
  --image $IMAGE_NAME:$IMAGE_TAG \
  --file Dockerfile \
  .

echo ""
echo "Step 4: Creating Container Apps environment..."
az containerapp env create \
  --name $CONTAINER_ENV_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

echo ""
echo "Step 5: Getting ACR credentials..."
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

echo ""
echo "Step 6: Creating Container App with secrets..."
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_ENV_NAME \
  --image $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG \
  --target-port 3001 \
  --ingress external \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 0.5 \
  --memory 1Gi \
  --min-replicas 1 \
  --max-replicas 5 \
  --secrets \
    dataverse-url=$DATAVERSE_URL \
    dataverse-client-id=$CLIENT_ID \
    dataverse-client-secret=$CLIENT_SECRET \
    dataverse-tenant-id=$TENANT_ID \
    dataverse-scope="$DATAVERSE_URL/.default" \
  --env-vars \
    NODE_ENV=production \
    PORT=3001 \
    CORS_ORIGIN=$FRONTEND_URL \
    DATAVERSE_URL=secretref:dataverse-url \
    DATAVERSE_CLIENT_ID=secretref:dataverse-client-id \
    DATAVERSE_CLIENT_SECRET=secretref:dataverse-client-secret \
    DATAVERSE_TENANT_ID=secretref:dataverse-tenant-id \
    DATAVERSE_SCOPE=secretref:dataverse-scope

echo ""
echo "Step 7: Getting app URL..."
APP_URL=$(az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo ""
echo "================================"
echo "Deployment Complete!"
echo "================================"
echo ""
echo "Backend API URL: https://$APP_URL"
echo "Health Check: https://$APP_URL/health"
echo "API Base URL: https://$APP_URL/api"
echo ""
echo "Next steps:"
echo "1. Update your frontend CORS_ORIGIN if needed"
echo "2. Test the health endpoint: curl https://$APP_URL/health"
echo "3. Update your frontend to use: https://$APP_URL/api"
echo ""
