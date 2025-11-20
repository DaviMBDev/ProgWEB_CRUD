import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all countries
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, name, population, official_language, currency, continent_id } = req.query;
        const where: any = {};

        if (name) {
            where.name = { contains: String(name), mode: 'insensitive' };
        }
        if (population) {
            where.population = { gte: Number(population) };
        }
        if (official_language) {
            where.official_language = { contains: String(official_language), mode: 'insensitive' };
        }
        if (currency) {
            where.currency = { contains: String(currency), mode: 'insensitive' };
        }
        if (continent_id) {
            where.continent_id = Number(continent_id);
        }

        const countries = await prisma.country.findMany({
            where,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
        });
        res.json(countries);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Get a country by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const country = await prisma.country.findUnique({
      where: { id: parseInt(id) },
    });
    if (country) {
      res.json(country);
    } else {
      res.status(404).json({ error: 'Country not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get countries by continent
router.get('/byContinent/:continentId', async (req, res) => {
  try {
    const { continentId } = req.params;
    const countries = await prisma.country.findMany({
      where: { continent_id: parseInt(continentId) },
    });
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get a country by name
router.get('/byName/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const country = await prisma.country.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (country) {
      res.json(country);
    } else {
      res.status(404).json({ error: 'Country not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get a country by name
router.get('/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const country = await prisma.country.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } },
        });
        if (country) {
            res.json(country);
        } else {
            res.status(404).json({ error: 'Country not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Create a country
router.post('/', async (req, res) => {
  try {
    const { name, population, official_language, currency, continent_id } = req.body;
    const country = await prisma.country.create({
      data: {
        name,
        population,
        official_language,
        currency,
        continent_id,
      },
    });
    res.status(201).json(country);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Update a country
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, population, official_language, currency, continent_id } = req.body;
    const country = await prisma.country.update({
      where: { id: parseInt(id) },
      data: {
        name,
        population,
        official_language,
        currency,
        continent_id,
      },
    });
    res.json(country);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Delete a country
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.country.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;