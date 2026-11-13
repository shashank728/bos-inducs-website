
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: join(__dirname, '.env')
});

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}));

app.use(express.json({ limit: '20kb' }));

// Connect to Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error('Supabase environment variables are missing.');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Check backend and database connection
app.get('/api/health', async (_req, res) => {
  const { error } = await supabase
    .from('categories')
    .select('id')
    .limit(1);

  if (error) {
    return res.status(500).json({
      status: 'error',
      database: 'not connected',
      message: error.message
    });
  }

  res.json({
    status: 'ok',
    database: 'connected'
  });
});

// Get all products, including multiple images
app.get('/api/products', async (_req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        image_urls,
        category_id,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoryError) throw categoryError;

    const categoryMap = new Map(
      categories.map(category => [category.id, category.name])
    );

    const result = products.map(product => ({
      ...product,
      image_urls: Array.isArray(product.image_urls)
        ? product.image_urls
        : product.image_url
          ? [product.image_url]
          : [],
      _id: product.id,
      category: categoryMap.get(product.category_id) || 'General',
      tag: 'Product range'
    }));

    res.json(result);

  } catch (error) {
    console.error('Products error:', error.message);

    res.status(500).json({
      message: 'Unable to load products.'
    });
  }
});

// Save customer enquiry
app.post('/api/enquiries', async (req, res) => {
  const {
    name,
    email,
    phone = '',
    message
  } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      message: 'Name, email and message are required.'
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: 'Please provide a valid email address.'
    });
  }

  try {
    const { data, error } = await supabase
      .from('enquiries')
      .insert([{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        message: message.trim()
      }])
      .select('id')
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Enquiry received.',
      id: data.id
    });

  } catch (error) {
    console.error('Enquiry error:', error.message);

    res.status(500).json({
      message: 'Unable to save enquiry.'
    });
  }
});

// Start server
const port = process.env.PORT || 5002;

app.listen(port, () => {
  console.log(`Bos Inducs API running on http://localhost:${port}`);
});
