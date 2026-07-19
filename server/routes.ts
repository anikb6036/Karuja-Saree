import express from 'express';
import { db, getAnalyticsSummary } from './db.js';

export const apiRouter = express.Router();

apiRouter.get('/users', async (req, res) => {
  res.json(await db.getUsers());
});
apiRouter.get('/users/:id', async (req, res) => {
  const user = await db.getUser(req.params.id);
  if (user) res.json(user);
  else res.status(404).json({ error: 'User not found' });
});
apiRouter.post('/users', async (req, res) => {
  try {
    const { email, name, role, phone, address } = req.body;
    const newUser = await db.createUser({ email, name, role, phone, address });
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
apiRouter.put('/users/:id', async (req, res) => {
  const { name, phone, address, role } = req.body;
  try {
    const updated = await db.updateUserProfile(req.params.id, { name, phone, address, role });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
apiRouter.patch('/users/:id/permissions', async (req, res) => {
  const { permissions } = req.body;
  try {
    const updated = await db.updateUserPermissions(req.params.id, permissions || []);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

apiRouter.get('/products', async (req, res) => {
  res.json(await db.getProducts());
});
apiRouter.get('/products/:id', async (req, res) => {
  const p = await db.getProduct(req.params.id);
  if (p) res.json(p);
  else res.status(404).json({ error: 'Product not found' });
});
apiRouter.post('/products', async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;
    const newProduct = await db.createProduct({
      name, description, price, stock, category, imageUrl
    });
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
apiRouter.put('/products/:id', async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;
    const updated = await db.updateProduct(req.params.id, {
      name, description, price, stock, category, imageUrl
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
apiRouter.delete('/products/:id', async (req, res) => {
  try {
    await db.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

apiRouter.get('/orders', async (req, res) => {
  res.json(await db.getOrders());
});
apiRouter.post('/orders', async (req, res) => {
  try {
    const { customerId, customerName, customerEmail, items, total, paymentGateway, shippingAddress, shippingPhone } = req.body;
    const order = await db.createOrder({
      customerId, customerName, customerEmail, items, total, paymentGateway, shippingAddress, shippingPhone
    });
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
apiRouter.put('/orders/:id/shipping', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await db.updateOrderShipping(req.params.id, status);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

apiRouter.get('/campaigns', async (req, res) => {
  res.json(await db.getCampaigns());
});
apiRouter.post('/campaigns', async (req, res) => {
  try {
    const { platform, name, budget } = req.body;
    const newCamp = await db.createCampaign({
      platform, name, budget
    });
    res.status(201).json(newCamp);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
apiRouter.put('/campaigns/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await db.updateCampaignStatus(req.params.id, status);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

apiRouter.get('/analytics', async (req, res) => {
  res.json(getAnalyticsSummary());
});

import { initSupabaseDb } from './init-db.js';
apiRouter.post('/init-db', async (req, res) => {
  try {
    await initSupabaseDb();
    res.json({ success: true, message: 'Database initialized successfully!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
