@description('Resource name prefix applied to Azure resources')
param namePrefix string = 'wrhris'

@description('Azure region for the deployment')
param location string = resourceGroup().location

@description('Optional tags that should be merged into every taggable resource')
param extraTags object = {}

var defaultTags = {
  Project: 'WorkRight-HRIS'
  Environment: namePrefix
}

var tags = union(defaultTags, extraTags)

@description('Virtual network CIDR block (must contain both subnet prefixes)')
param vnetAddressPrefix string = '10.10.0.0/16'

@description('CIDR for the application subnet')
param appSubnetPrefix string = '10.10.0.0/24'

@description('CIDR for the data/private endpoint subnet')
param dataSubnetPrefix string = '10.10.1.0/24'

@description('Azure SQL administrator login name')
param sqlAdministratorLogin string

@description('Azure SQL administrator password')
@secure()
param sqlAdministratorPassword string

@description('SKU name for the Azure SQL database (for example GP_Gen5_2)')
param sqlSkuName string = 'GP_Gen5_2'

@description('Capacity for the SQL database in DTUs or vCores depending on tier')
param sqlSkuCapacity int = 2

@description('Name of the Azure SQL database tier (for example GeneralPurpose)')
param sqlSkuTier string = 'GeneralPurpose'

@description('Name of the Azure Storage account (must be globally unique, 3-24 lowercase characters)')
param storageAccountName string

@description('SKU for the storage account')
param storageSkuName string = 'Standard_LRS'

@description('Service Bus namespace name')
param serviceBusNamespaceName string

@description('Service Bus SKU tier (Basic, Standard, Premium)')
param serviceBusSkuTier string = 'Basic'

@description('Service Bus throughput units / messaging units')
param serviceBusSkuCapacity int = 1

@description('Name of the default Service Bus queue used for background jobs')
param serviceBusQueueName string = 'work-items'

@description('Azure Cache for Redis name')
param redisCacheName string

@description('Redis SKU family (C = Basic/Standard, P = Premium)')
param redisSkuFamily string = 'C'

@description('Redis SKU name (Basic, Standard, Premium)')
param redisSkuName string = 'Standard'

@description('Redis capacity (0-6 for Basic/Standard, 1-5 for Premium)')
param redisSkuCapacity int = 1

@description('Key Vault name for secret storage')
param keyVaultName string

@description('Object ID of the administrator or deployment principal that should get access to the Key Vault')
param keyVaultAdminObjectId string

@description('App Service plan SKU definition')
param appServicePlanSku object = {
  name: 'P1v3'
  tier: 'PremiumV3'
  size: 'P1v3'
  capacity: 1
}

@description('Container image (for example myregistry.azurecr.io/workright-api:latest)')
param containerImage string

@description('Optional container registry server (leave blank for public images)')
param containerRegistryServer string = ''

@description('Optional container registry username')
param containerRegistryUsername string = ''

@description('Optional container registry password')
@secure()
param containerRegistryPassword string = ''

@description('Additional App Service application settings to apply to the Web App')
param appSettings object = {}

var webAppName = '${namePrefix}-api'
var sqlServerName = '${namePrefix}-sql'
var sqlDatabaseName = '${namePrefix}-db'
var serviceBusCapacity = serviceBusSkuTier == 'Basic' ? 0 : max(1, serviceBusSkuCapacity)
resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: '${namePrefix}-vnet'
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        vnetAddressPrefix
      ]
    }
  }
}

resource appSubnet 'Microsoft.Network/virtualNetworks/subnets@2023-11-01' = {
  name: 'app'
  parent: vnet
  properties: {
    addressPrefix: appSubnetPrefix
    delegations: [
      {
        name: 'webappDelegation'
        properties: {
          serviceName: 'Microsoft.Web/serverFarms'
        }
      }
    ]
  }
}

resource dataSubnet 'Microsoft.Network/virtualNetworks/subnets@2023-11-01' = {
  name: 'data'
  parent: vnet
  properties: {
    addressPrefix: dataSubnetPrefix
  }
}

resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: sqlServerName
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdministratorLogin
    administratorLoginPassword: sqlAdministratorPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  name: '${sqlServer.name}/${sqlDatabaseName}'
  location: location
  sku: {
    name: sqlSkuName
    tier: sqlSkuTier
    capacity: sqlSkuCapacity
  }
  properties: {
    zoneRedundant: false
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: storageSkuName
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowSharedKeyAccess: true
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource storageContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storage.name}/default/attachments'
  properties: {
    publicAccess: 'None'
  }
}

resource serviceBusNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: serviceBusNamespaceName
  location: location
  tags: tags
  sku: {
    name: serviceBusSkuTier
    tier: serviceBusSkuTier
    capacity: serviceBusCapacity
  }
  properties: {
    publicNetworkAccess: 'Enabled'
  }
}

resource serviceBusQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  name: '${serviceBusNamespace.name}/${serviceBusQueueName}'
  properties: {
    enablePartitioning: true
    lockDuration: 'PT5M'
  }
}

resource redisCache 'Microsoft.Cache/redis@2023-08-01' = {
  name: redisCacheName
  location: location
  tags: tags
  sku: {
    family: redisSkuFamily
    name: redisSkuName
    capacity: redisSkuCapacity
  }
  properties: {
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    enablePurgeProtection: true
    enableSoftDelete: true
    enableRbacAuthorization: false
    tenantId: subscription().tenantId
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: keyVaultAdminObjectId
        permissions: {
          secrets: [
            'Get'
            'List'
            'Set'
            'Delete'
            'Recover'
          ]
        }
      }
    ]
    sku: {
      family: 'A'
      name: 'standard'
    }
    softDeleteRetentionInDays: 90
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${namePrefix}-appinsights'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Bluefield'
    Request_Source: 'rest'
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${namePrefix}-plan'
  location: location
  tags: tags
  sku: appServicePlanSku
  kind: 'linux'
  properties: {
    reserved: true
  }
}

var baseAppSettings = [
  {
    name: 'WEBSITE_RUN_FROM_PACKAGE'
    value: '0'
  }
  {
    name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
    value: 'false'
  }
  {
    name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
    value: 'false'
  }
  {
    name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
    value: appInsights.properties.InstrumentationKey
  }
  {
    name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
    value: appInsights.properties.ConnectionString
  }
]

var additionalAppSettings = [for setting in items(appSettings) : {
  name: setting.key
  value: string(setting.value)
}]

var containerSettings = empty(containerRegistryServer) ? [] : [
  {
    name: 'DOCKER_REGISTRY_SERVER_URL'
    value: containerRegistryServer
  }
  {
    name: 'DOCKER_REGISTRY_SERVER_USERNAME'
    value: containerRegistryUsername
  }
  {
    name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
    value: containerRegistryPassword
  }
]

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  tags: tags
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${containerImage}'
      alwaysOn: true
      ftpsState: 'FtpsOnly'
      minimumTlsVersion: '1.2'
      appSettings: concat(baseAppSettings, containerSettings, additionalAppSettings)
    }
  }
}

resource webAppLogs 'Microsoft.Web/sites/config@2023-12-01' = {
  name: '${webApp.name}/logs'
  properties: {
    applicationLogs: {
      fileSystem: {
        level: 'Information'
        retentionInDays: 7
        retentionInMb: 35
      }
    }
    httpLogs: {
      fileSystem: {
        retentionInDays: 7
        retentionInMb: 35
      }
    }
  }
}

resource webAppVnetIntegration 'Microsoft.Web/sites/virtualNetworkConnections@2023-12-01' = {
  name: '${webApp.name}/${vnet.name}'
  properties: {
    subnetResourceId: appSubnet.id
    swiftSupported: true
  }
}

output webAppDefaultHostName string = webApp.properties.defaultHostName
output sqlServerFullyQualifiedDomainName string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabaseName
output storageAccountResourceId string = storage.id
output redisHostname string = redisCache.properties.hostName
output serviceBusNamespaceResourceId string = serviceBusNamespace.id
