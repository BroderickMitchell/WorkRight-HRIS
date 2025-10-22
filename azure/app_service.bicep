@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Globally unique name for the App Service')
param appName string

@description('App Service Plan SKU name (e.g. B1, S1, P1v3)')
param planSku string = 'B1'

@description('App Service Plan SKU tier (e.g. Basic, Standard, PremiumV3)')
param planTier string = 'Basic'

@description('PostgreSQL flexible server name (3-60 characters, lowercase)')
param postgresServerName string

@description('Administrator username for the PostgreSQL server')
param postgresAdmin string = 'hrisadmin'

@secure()
@description('Administrator password for the PostgreSQL server')
param postgresPassword string

@description('Database name to provision within the PostgreSQL server')
param databaseName string = 'hris'

@description('Fully qualified container image reference, e.g. myregistry.azurecr.io/hris:latest')
param containerImage string

@description('Azure Container Registry login server, e.g. myregistry.azurecr.io')
param containerRegistryServer string

@secure()
@description('Azure Container Registry username')
param containerRegistryUsername string

@secure()
@description('Azure Container Registry password')
param containerRegistryPassword string

var postgresStorageSizeGB = 32
var postgresVersion = '15'
var postgresSkuName = 'Standard_D2ds_v5'
var postgresTier = 'GeneralPurpose'

resource plan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: planSku
    tier: planTier
  }
  properties: {
    reserved: true
  }
}

resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: postgresServerName
  location: location
  sku: {
    name: postgresSkuName
    tier: postgresTier
  }
  properties: {
    administratorLogin: postgresAdmin
    administratorLoginPassword: postgresPassword
    version: postgresVersion
    storage: {
      storageSizeGB: postgresStorageSizeGB
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
  }
}

resource postgresFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2022-12-01' = {
  name: '${postgres.name}/allow-all'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
  dependsOn: [
    postgres
  ]
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  name: '${postgres.name}/${databaseName}'
  dependsOn: [
    postgres
    postgresFirewall
  ]
}

var postgresHost = '${postgres.name}.postgres.database.azure.com'
var postgresConnectionString = 'postgresql+psycopg2://${postgresAdmin}:${postgresPassword}@${postgresHost}/${databaseName}'

resource webApp 'Microsoft.Web/sites@2022-09-01' = {
  name: appName
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${containerImage}'
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '8000'
        }
        {
          name: 'WEBSITES_CONTAINER_START_TIME_LIMIT'
          value: '600'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${containerRegistryServer}'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: containerRegistryUsername
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: containerRegistryPassword
        }
        {
          name: 'HRIS_DATABASE_URL'
          value: postgresConnectionString
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
  dependsOn: [
    plan
    postgres
    postgresDatabase
  ]
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output postgresFqdn string = postgresHost
