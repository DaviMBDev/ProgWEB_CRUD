-- CreateTable
CREATE TABLE "Continent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Continent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "official_language" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "continent_id" INTEGER NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "country_id" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Continent_name_key" ON "Continent"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_continent_id_fkey" FOREIGN KEY ("continent_id") REFERENCES "Continent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
