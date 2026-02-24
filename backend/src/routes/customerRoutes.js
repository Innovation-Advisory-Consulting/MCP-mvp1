import express from 'express';
import { customerController } from '../controllers/customerController.js';

const router = express.Router();

router.get('/customers', customerController.getAll);

router.get('/customers/:id', customerController.getById);

router.post('/customers', customerController.create);

router.patch('/customers/:id', customerController.update);

router.delete('/customers/:id', customerController.delete);

export default router;
