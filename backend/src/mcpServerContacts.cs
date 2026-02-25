using Microsoft.PowerPlatform.Dataverse.Client;
using System;
using System.Collections.Generic;

class Program
{
    static void Main(string[] args)
    {
        string connectionString = "AuthType=ClientSecret;Url=https://your-org.crm.dynamics.com;ClientId=your-client-id;ClientSecret=your-client-secret;";

        try
        {
            using (ServiceClient serviceClient = new ServiceClient(connectionString))
            {
                if (serviceClient.IsReady)
                {
                    Console.WriteLine("Connected to Dataverse.");

                    // Query contacts
                    string fetchXml = @"<fetch top='10'>
                                        <entity name='contact'>
                                            <attribute name='fullname' />
                                            <attribute name='emailaddress1' />
                                            <attribute name='telephone1' />
                                        </entity>
                                    </fetch>";

                    var contacts = serviceClient.RetrieveMultiple(new Microsoft.Xrm.Sdk.Query.FetchExpression(fetchXml));

                    foreach (var contact in contacts.Entities)
                    {
                        Console.WriteLine($"Name: {contact.GetAttributeValue<string>("fullname")}, Email: {contact.GetAttributeValue<string>("emailaddress1")}, Phone: {contact.GetAttributeValue<string>("telephone1")}");
                    }
                }
                else
                {
                    Console.WriteLine("Failed to connect to Dataverse.");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}