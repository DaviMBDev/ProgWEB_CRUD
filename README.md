# ProgWEB_CRUD

This project is a web application for managing continents, countries, and cities, as per the requirements of the `CRUD_TS_PostgreSQL.pdf` document.

## Current Status

The project is complete. All the features from the PDF have been implemented, including the optional login.

*   **Backend:**
    *   CRUD operations for continents, countries, and cities.
    *   User registration and login with JWT authentication.
    *   Error handling.
    *   Pagination.
    *   Filtering by name.
*   **Frontend:**
    *   UI for all CRUD operations.
    *   Login and registration pages.
    *   Protected routes.
    *   Integration with REST Countries API to display country flags.
    *   Integration with OpenWeatherMap API to display city weather.
    *   Improved UI/UX using Bootstrap.

## How to Run

1.  Install the dependencies:
    ```
    npm install
    ```
2.  Set up the database by creating a `.env` file with the `DATABASE_URL`.
3.  Run the database migrations:
    ```
    npx prisma migrate dev
    ```
4.  Start the application:
    ```
    npm run dev
    ```