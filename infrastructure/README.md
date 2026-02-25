# MCP-MVP1 Azure Infrastructure

Despliegue en Azure Cloud PowerShell dentro del resource group **MCP-MVP1**.

## Recursos

- Container Registry
- Container Apps Environment
- Container App (backend)
- Static Web App (frontend)

## Prerequisitos

1. Crear resource group manualmente:
```powershell
az group create --name MCP-MVP1 --location eastus
```

2. Editar `config.ps1` con tus credenciales de Dataverse

## Despliegue

```powershell
cd infrastructure
.\deploy.ps1
```

## Actualizar Backend

```powershell
az acr build --registry mcpmvp1acr --image customer-management-backend:latest --file backend/Dockerfile backend/
az containerapp update --name mcp-mvp1-api --resource-group MCP-MVP1 --image mcpmvp1acr.azurecr.io/customer-management-backend:latest
```

## Eliminar Recursos

```powershell
.\destroy.ps1
```
