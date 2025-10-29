
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create continents
  const africa = await prisma.continent.create({
    data: {
      name: 'Africa',
      description: 'The second largest continent',
    },
  });

  const europe = await prisma.continent.create({
    data: {
      name: 'Europe',
      description: 'The continent with a rich history',
    },
  });

  // Create countries
  const nigeria = await prisma.country.create({
    data: {
      name: 'Nigeria',
      population: 206139589,
      official_language: 'English',
      currency: 'Naira',
      continent_id: africa.id,
    },
  });

  const egypt = await prisma.country.create({
    data: {
      name: 'Egypt',
      population: 102334404,
      official_language: 'Arabic',
      currency: 'Egyptian pound',
      continent_id: africa.id,
    },
  });

  const germany = await prisma.country.create({
    data: {
      name: 'Germany',
      population: 83783942,
      official_language: 'German',
      currency: 'Euro',
      continent_id: europe.id,
    },
  });

  const france = await prisma.country.create({
    data: {
      name: 'France',
      population: 65273511,
      official_language: 'French',
      currency: 'Euro',
      continent_id: europe.id,
    },
  });

  const spain = await prisma.country.create({
    data: {
      name: 'Spain',
      population: 46754778,
      official_language: 'Spanish',
      currency: 'Euro',
      continent_id: europe.id,
    },
  });

  // Create cities
  await prisma.city.createMany({
    data: [
      { name: 'Lagos', population: 14800000, latitude: 6.465422, longitude: 3.406448, country_id: nigeria.id },
      { name: 'Cairo', population: 9845000, latitude: 30.04442, longitude: 31.235712, country_id: egypt.id },
      { name: 'Berlin', population: 3645000, latitude: 52.520008, longitude: 13.404954, country_id: germany.id },
      { name: 'Paris', population: 2141000, latitude: 48.856613, longitude: 2.352222, country_id: france.id },
      { name: 'Madrid', population: 3223000, latitude: 40.416775, longitude: -3.70379, country_id: spain.id },
      { name: 'Abuja', population: 1235880, latitude: 9.076479, longitude: 7.398574, country_id: nigeria.id },
      { name: 'Alexandria', population: 5200000, latitude: 31.200092, longitude: 29.918739, country_id: egypt.id },
      { name: 'Hamburg', population: 1841000, latitude: 53.551086, longitude: 9.993682, country_id: germany.id },
      { name: 'Marseille', population: 861635, latitude: 43.296482, longitude: 5.36978, country_id: france.id },
      { name: 'Barcelona', population: 1620000, latitude: 41.385063, longitude: 2.173404, country_id: spain.id },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
