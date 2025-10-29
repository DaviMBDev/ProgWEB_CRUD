import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static('public'));

import continentRoutes from './routes/continents';
import countryRoutes from './routes/countries';
import cityRoutes from './routes/cities';
import authRoutes from './routes/auth';

import { authMiddleware } from './middleware/authMiddleware';

app.use('/continents', authMiddleware, continentRoutes);
app.use('/countries', authMiddleware, countryRoutes);
app.use('/cities', authMiddleware, cityRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
