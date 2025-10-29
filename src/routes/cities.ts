import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all cities
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, name } = req.query;
    const where = name ? { name: { contains: String(name), mode: 'insensitive' } } : {};
    const cities = await prisma.city.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get a city by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const city = await prisma.city.findUnique({
      where: { id: parseInt(id) },
    });
    if (city) {
      res.json(city);
    } else {
      res.status(404).json({ error: 'City not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get cities by country
router.get('/byCountry/:countryId', async (req, res) => {
  try {
    const { countryId } = req.params;
    const cities = await prisma.city.findMany({
      where: { country_id: parseInt(countryId) },
    });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Create a city
router.post('/', async (req, res) => {
  try {
    const { name, population, latitude, longitude, country_id } = req.body;
    const city = await prisma.city.create({
      data: {
        name,
        population,
        latitude,
        longitude,
        country_id,
      },
    });
    res.status(201).json(city);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Update a city
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, population, latitude, longitude, country_id } = req.body;
    const city = await prisma.city.update({
      where: { id: parseInt(id) },
      data: {
        name,
        population,
        latitude,
        longitude,
        country_id,
      },
    });
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Delete a city
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.city.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;