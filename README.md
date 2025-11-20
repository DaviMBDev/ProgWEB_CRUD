# GeoDB

Este é um aplicativo CRUD (Create, Read, Update, Delete) que permite aos usuários gerenciar informações geográficas sobre continentes, países e cidades.

## Funcionalidades

*   **Backend:**
    *   Operações CRUD para continentes, países e cidades.
    *   Registro e login de usuários com autenticação JWT.
    *   Tratamento de erros.
    *   Paginação.
    *   Filtragem por nome.
*   **Frontend:**
    *   Páginas separadas para as operações CRUD de continentes, países e cidades.
    *   Página inicial com informações gerais.
    *   Preenchimento automático de formulários com dados da API REST Countries e Geonames.
    *   Criação automática de continentes que não existem no banco de dados.
    *   UI para todas as operações CRUD.
    *   Páginas de login e registro.
    *   Rotas protegidas.
    *   Integração com a API REST Countries para exibir bandeiras de países.
    *   Integração com a API OpenWeatherMap para exibir o clima da cidade.
    *   UI/UX aprimorada com um design moderno.

## Como Executar

1.  Instale as dependências:
    ```
    npm install
    ```
2.  Configure o banco de dados criando um arquivo `.env` com a `DATABASE_URL`.
3.  Execute as migrações do banco de dados:
    ```
    npx prisma migrate dev
    ```
4.  Inicie a aplicação:
    ```
    npm run dev
    ```