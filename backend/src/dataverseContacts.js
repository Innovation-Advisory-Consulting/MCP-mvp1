const { Client } = require('dataverse-client');

// Dataverse connection configuration
const config = {
  url: process.env.DATAVERSE_URL, // Set your Dataverse URL in environment variables
  clientId: process.env.DATAVERSE_CLIENT_ID, // Set your Client ID in environment variables
  clientSecret: process.env.DATAVERSE_CLIENT_SECRET, // Set your Client Secret in environment variables
  tenantId: process.env.DATAVERSE_TENANT_ID, // Set your Tenant ID in environment variables
};

(async () => {
  try {
    // Initialize Dataverse client
    const client = new Client(config);

    // Authenticate
    await client.authenticate();

    // Fetch all contacts
    const contacts = await client.retrieveMultiple('contacts', {
      select: ['fullname', 'emailaddress1', 'telephone1'],
      top: 100, // Adjust the number of records to fetch
    });

    console.log('Contacts:', contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
  }
})();