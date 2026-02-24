import { dataverseClient } from '../services/dataverseClient.js';

const CONTACT_ENTITY = 'contacts';

export const customerController = {
  async getAll(request, reply) {
    try {
      const { page = 1, limit = 10, search = '' } = request.query;

      let query = `/${CONTACT_ENTITY}?$select=contactid,firstname,lastname,emailaddress1,telephone1,address1_city,address1_stateorprovince,address1_country,createdon&$count=true`;

      if (search) {
        const searchFilter = `(contains(firstname,'${search}') or contains(lastname,'${search}') or contains(emailaddress1,'${search}'))`;
        query += `&$filter=${searchFilter}`;
      }

      query += `&$orderby=createdon desc`;
      query += `&$top=${limit}`;

      if (page > 1) {
        const skip = (page - 1) * limit;
        query += `&$skip=${skip}`;
      }

      const data = await dataverseClient.get(query);

      const customers = data.value.map(contact => ({
        id: contact.contactid,
        firstName: contact.firstname || '',
        lastName: contact.lastname || '',
        email: contact.emailaddress1 || '',
        phone: contact.telephone1 || '',
        city: contact.address1_city || '',
        state: contact.address1_stateorprovince || '',
        country: contact.address1_country || '',
        createdAt: contact.createdon,
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

      const query = `/${CONTACT_ENTITY}(${id})?$select=contactid,firstname,lastname,emailaddress1,telephone1,address1_line1,address1_city,address1_stateorprovince,address1_postalcode,address1_country,createdon,modifiedon`;

      const contact = await dataverseClient.get(query);

      const customer = {
        id: contact.contactid,
        firstName: contact.firstname || '',
        lastName: contact.lastname || '',
        email: contact.emailaddress1 || '',
        phone: contact.telephone1 || '',
        address: contact.address1_line1 || '',
        city: contact.address1_city || '',
        state: contact.address1_stateorprovince || '',
        postalCode: contact.address1_postalcode || '',
        country: contact.address1_country || '',
        createdAt: contact.createdon,
        modifiedAt: contact.modifiedon,
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
      const { firstName, lastName, email, phone, address, city, state, postalCode, country } = request.body;

      const contactData = {
        firstname: firstName,
        lastname: lastName,
        emailaddress1: email,
      };

      if (phone) contactData.telephone1 = phone;
      if (address) contactData.address1_line1 = address;
      if (city) contactData.address1_city = city;
      if (state) contactData.address1_stateorprovince = state;
      if (postalCode) contactData.address1_postalcode = postalCode;
      if (country) contactData.address1_country = country;

      const result = await dataverseClient.post(`/${CONTACT_ENTITY}`, contactData);

      const customer = {
        id: result.contactid,
        firstName: result.firstname,
        lastName: result.lastname,
        email: result.emailaddress1,
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
      const { firstName, lastName, email, phone, address, city, state, postalCode, country } = request.body;

      const contactData = {};

      if (firstName !== undefined) contactData.firstname = firstName;
      if (lastName !== undefined) contactData.lastname = lastName;
      if (email !== undefined) contactData.emailaddress1 = email;
      if (phone !== undefined) contactData.telephone1 = phone;
      if (address !== undefined) contactData.address1_line1 = address;
      if (city !== undefined) contactData.address1_city = city;
      if (state !== undefined) contactData.address1_stateorprovince = state;
      if (postalCode !== undefined) contactData.address1_postalcode = postalCode;
      if (country !== undefined) contactData.address1_country = country;

      const result = await dataverseClient.patch(`/${CONTACT_ENTITY}(${id})`, contactData);

      const customer = {
        id: result.contactid,
        firstName: result.firstname,
        lastName: result.lastname,
        email: result.emailaddress1,
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

      await dataverseClient.delete(`/${CONTACT_ENTITY}(${id})`);

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
