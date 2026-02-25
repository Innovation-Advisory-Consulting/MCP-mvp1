. .\config.ps1

Write-Host "🐳 Creating Container Registry..." -ForegroundColor Cyan
az acr create --resource-group $ResourceGroup --name $AcrName --sku Basic --admin-enabled true

$AcrCreds = az acr credential show --name $AcrName | ConvertFrom-Json
$AcrUsername = $AcrCreds.username
$AcrPassword = $AcrCreds.passwords[0].value

Write-Host "🔨 Building backend image..." -ForegroundColor Cyan
az acr build --registry $AcrName --image "${BackendImage}:latest" --file backend/Dockerfile backend/

Write-Host "🌐 Creating Container Apps environment..." -ForegroundColor Cyan
az containerapp env create --name $ContainerEnv --resource-group $ResourceGroup --location $Location

Write-Host "🚢 Deploying backend..." -ForegroundColor Cyan
az containerapp create `
  --name $BackendAppName `
  --resource-group $ResourceGroup `
  --environment $ContainerEnv `
  --image "${AcrName}.azurecr.io/${BackendImage}:latest" `
  --target-port 3001 `
  --ingress external `
  --registry-server "${AcrName}.azurecr.io" `
  --registry-username $AcrUsername `
  --registry-password $AcrPassword `
  --cpu 0.5 --memory 1.0Gi `
  --min-replicas 1 --max-replicas 3 `
  --secrets dataverse-url=$DataverseUrl dataverse-client-id=$DataverseClientId dataverse-client-secret=$DataverseClientSecret dataverse-tenant-id=$DataverseTenantId `
  --env-vars PORT=3001 NODE_ENV=production DATAVERSE_URL=secretref:dataverse-url DATAVERSE_CLIENT_ID=secretref:dataverse-client-id DATAVERSE_CLIENT_SECRET=secretref:dataverse-client-secret DATAVERSE_TENANT_ID=secretref:dataverse-tenant-id

$BackendUrl = az containerapp show --name $BackendAppName --resource-group $ResourceGroup --query properties.configuration.ingress.fqdn -o tsv

Write-Host "🌐 Creating Static Web App..." -ForegroundColor Cyan
az staticwebapp create --name $FrontendAppName --resource-group $ResourceGroup --location $Location --sku Free

$FrontendUrl = az staticwebapp show --name $FrontendAppName --resource-group $ResourceGroup --query defaultHostname -o tsv

az containerapp update --name $BackendAppName --resource-group $ResourceGroup --set-env-vars CORS_ORIGIN="https://$FrontendUrl"

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "Backend: https://$BackendUrl"
Write-Host "Frontend: https://$FrontendUrl"
