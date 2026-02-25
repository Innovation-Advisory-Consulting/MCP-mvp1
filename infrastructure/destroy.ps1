. .\config.ps1

$Confirm = Read-Host "Delete all resources in $ResourceGroup? (yes/no)"
if ($Confirm -ne "yes") { 
    Write-Host "Aborted" -ForegroundColor Yellow
    exit 
}

Write-Host "🗑️ Deleting resources..." -ForegroundColor Red
az staticwebapp delete --name $FrontendAppName --resource-group $ResourceGroup --yes
az containerapp delete --name $BackendAppName --resource-group $ResourceGroup --yes
az containerapp env delete --name $ContainerEnv --resource-group $ResourceGroup --yes
az acr delete --name $AcrName --resource-group $ResourceGroup --yes

Write-Host "✅ Resources deleted" -ForegroundColor Green
