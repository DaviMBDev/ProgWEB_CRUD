import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all continents
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, name, description } = req.query;
        const where: any = {};
        if (name) {
            where.name = { contains: String(name), mode: 'insensitive' };
        }
        if (description) {
            where.description = { contains: String(description), mode: 'insensitive' };
        }
        const continents = await prisma.continent.findMany({
            where,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
        });
        res.json(continents);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Get a continent by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const continent = await prisma.continent.findUnique({
      where: { id: parseInt(id) },
    });
    if (continent) {
      res.json(continent);
    } else {
      res.status(404).json({ error: 'Continent not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get a continent by name
router.get('/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const continent = await prisma.continent.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } },
        });
        if (continent) {
            res.json(continent);
        } else {
            res.status(404).json({ error: 'Continent not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});


// Create a continent
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const continent = await prisma.continent.create({
      data: {
        name,
        description,
      },
    });
    res.status(201).json(continent);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Update a continent
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const continent = await prisma.continent.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
      },
    });
    res.json(continent);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Delete a continent
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.continent.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;