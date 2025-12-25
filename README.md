# Auction Web Application

Welcome to the Auction Web Application monorepo. This project contains both the React client and the Express server.

## Project Structure

- **client/**: The frontend application (React + Vite + TailwindCSS).
- **server/**: The backend application (Express + Prisma).

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

Install dependencies for both client and server from the root directory:

```bash
npm run install:all
```

### Running the Application

To start both the client and server concurrently in development mode:

```bash
npm run dev
```

- Client will run on: `http://localhost:5173` (default Vite port)
- Server will run on: `http://localhost:8000`

## Scripts

- `npm run dev`: Runs both client and server.
- `npm run server`: Runs only the server.
- `npm run client:user`: Runs only the user client.
- `npm run client:admin`: Runs only the admin client.