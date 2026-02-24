import { dataverseClient } from '../services/dataverseClient.js';

const CONTACT_ENTITY = 'contacts';

export const customerController = {
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      let query = `/${CONTACT_ENTITY}?$select=contactid,firstname,lastname,emailaddress1,telephone1,address1_city,address1_stateorprovince,address1_country,createdon`;

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

      res.json({
        data: customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data['@odata.count'] || customers.length,
        },
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({
        error: 'Failed to fetch customers',
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

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

      res.json({ data: customer });
    } catch (error) {
      if (error.response?.status === 404) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      console.error('Error fetching customer:', error);
      res.status(500).json({
        error: 'Failed to fetch customer',
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },

  async create(req, res) {
    try {
      const { firstName, lastName, email, phone, address, city, state, postalCode, country } = req.body;

      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'firstName, lastName, and email are required',
        });
      }

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

      res.status(201).json({ data: customer });
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({
        error: 'Failed to create customer',
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, address, city, state, postalCode, country } = req.body;

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

      res.json({ data: customer });
    } catch (error) {
      if (error.response?.status === 404) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      console.error('Error updating customer:', error);
      res.status(500).json({
        error: 'Failed to update customer',
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      await dataverseClient.delete(`/${CONTACT_ENTITY}(${id})`);

      res.status(204).send();
    } catch (error) {
      if (error.response?.status === 404) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      console.error('Error deleting customer:', error);
      res.status(500).json({
        error: 'Failed to delete customer',
        message: error.response?.data?.error?.message || error.message,
      });
    }
  },
};
