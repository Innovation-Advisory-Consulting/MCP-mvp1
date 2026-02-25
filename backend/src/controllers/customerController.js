import { dataverseClient } from '../services/dataverseClient.js';

const ACCOUNT_ENTITY = 'accounts';

export const customerController = {
  async getAll(request, reply) {
    try {
      const { page = 1, limit = 10, search = '' } = request.query;

      let query = `/${ACCOUNT_ENTITY}?$select=accountid,name,emailaddress1,telephone1,address1_city,address1_stateorprovince,address1_country,createdon&$count=true`;

      if (search) {
        const searchFilter = `(contains(name,'${search}') or contains(emailaddress1,'${search}'))`;
        query += `&$filter=${searchFilter}`;
      }

      query += `&$orderby=createdon desc`;
      query += `&$top=${limit}`;

      if (page > 1) {
        const skip = (page - 1) * limit;
        query += `&$skip=${skip}`;
      }

      const data = await dataverseClient.get(query);
      request.log.info(`Dataverse returned ${data.value?.length || 0} accounts`);

      const customers = data.value.map(account => ({
        id: account.accountid,
        name: account.name || '',
        email: account.emailaddress1 || '',
        phone: account.telephone1 || '',
        city: account.address1_city || '',
        state: account.address1_stateorprovince || '',
        country: account.address1_country || '',
        createdAt: account.createdon,
      }));

      return reply.send({
        data: customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data['@odata.count'] || customers.length,
        },
      });
    } catch (error) {
      request.log.error(error, 'Error fetching customers');
      return reply.code(500).send({
        error: 'Failed to fetch customers',
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },

  async getById(request, reply) {
    try {
      const { id } = request.params;

      const query = `/${ACCOUNT_ENTITY}(${id})?$select=accountid,name,emailaddress1,telephone1,address1_line1,address1_city,address1_stateorprovince,address1_postalcode,address1_country,createdon,modifiedon`;

      const account = await dataverseClient.get(query);

      const customer = {
        id: account.accountid,
        name: account.name || '',
        email: account.emailaddress1 || '',
        phone: account.telephone1 || '',
        address: account.address1_line1 || '',
        city: account.address1_city || '',
        state: account.address1_stateorprovince || '',
        postalCode: account.address1_postalcode || '',
        country: account.address1_country || '',
        createdAt: account.createdon,
        modifiedAt: account.modifiedon,
      };

      return reply.send({ data: customer });
    } catch (error) {
      if (error.response?.status === 404) {
        return reply.code(404).send({ error: 'Customer not found' });
      }

      request.log.error(error, 'Error fetching customer');
      return reply.code(500).send({
        error: 'Failed to fetch customer',
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },

  async create(request, reply) {
    try {
      const { name, email, phone, address, city, state, postalCode, country } = request.body;

      const accountData = { name };

      if (email) accountData.emailaddress1 = email;
      if (phone) accountData.telephone1 = phone;
      if (address) accountData.address1_line1 = address;
      if (city) accountData.address1_city = city;
      if (state) accountData.address1_stateorprovince = state;
      if (postalCode) accountData.address1_postalcode = postalCode;
      if (country) accountData.address1_country = country;

      const result = await dataverseClient.post(`/${ACCOUNT_ENTITY}`, accountData);

      const customer = {
        id: result.accountid,
        name: result.name || '',
        email: result.emailaddress1 || '',
        phone: result.telephone1 || '',
        address: result.address1_line1 || '',
        city: result.address1_city || '',
        state: result.address1_stateorprovince || '',
        postalCode: result.address1_postalcode || '',
        country: result.address1_country || '',
        createdAt: result.createdon,
      };

      return reply.code(201).send({ data: customer });
    } catch (error) {
      request.log.error(error, 'Error creating customer');
      return reply.code(500).send({
        error: 'Failed to create customer',
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },

  async update(request, reply) {
    try {
      const { id } = request.params;
      const { name, email, phone, address, city, state, postalCode, country } = request.body;

      const accountData = {};

      if (name !== undefined) accountData.name = name;
      if (email !== undefined) accountData.emailaddress1 = email;
      if (phone !== undefined) accountData.telephone1 = phone;
      if (address !== undefined) accountData.address1_line1 = address;
      if (city !== undefined) accountData.address1_city = city;
      if (state !== undefined) accountData.address1_stateorprovince = state;
      if (postalCode !== undefined) accountData.address1_postalcode = postalCode;
      if (country !== undefined) accountData.address1_country = country;

      const result = await dataverseClient.patch(`/${ACCOUNT_ENTITY}(${id})`, accountData);

      const customer = {
        id: result.accountid,
        name: result.name || '',
        email: result.emailaddress1 || '',
        phone: result.telephone1 || '',
        address: result.address1_line1 || '',
        city: result.address1_city || '',
        state: result.address1_stateorprovince || '',
        postalCode: result.address1_postalcode || '',
        country: result.address1_country || '',
        modifiedAt: result.modifiedon,
      };

      return reply.send({ data: customer });
    } catch (error) {
      if (error.response?.status === 404) {
        return reply.code(404).send({ error: 'Customer not found' });
      }

      request.log.error(error, 'Error updating customer');
      return reply.code(500).send({
        error: 'Failed to update customer',
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },

  async delete(request, reply) {
    try {
      const { id } = request.params;

      await dataverseClient.delete(`/${ACCOUNT_ENTITY}(${id})`);

      return reply.code(204).send();
    } catch (error) {
      if (error.response?.status === 404) {
        return reply.code(404).send({ error: 'Customer not found' });
      }

      request.log.error(error, 'Error deleting customer');
      return reply.code(500).send({
        error: 'Failed to delete customer',
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },
};
