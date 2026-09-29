# Support Ticket Tracker

A full-stack support ticket tracking system built with Node.js, Express, TypeScript, and Prisma ORM. 

## Live Deployment
* **URL:** https://tickets.analystafricapartners.co.zw
* **Infrastructure:** DigitalOcean Droplet (Ubuntu), Nginx Reverse Proxy, Let's Encrypt SSL, PM2 Process Management.
* **Database:** Supabase PostgreSQL.

## Features
* **Create Tickets:** Submit new support requests with title, description, and priority.
* **List & Filter:** View all tickets and filter by status, priority, or search by title.
* **Update Status:** Transition tickets between 'Open', 'In progress', and 'Resolved'.
* **Dashboard Summary:** View total counts and status groupings.

## API Documentation

### `POST /tickets`
Creates a new support ticket.
* **Body:** `{ "title": "Issue", "description": "Details", "priority": "high" }`
* **Response (201):** Returns the created ticket object.

### `GET /tickets`
Retrieves a list of tickets. Supports query parameters for filtering.
* **Query Params:** `?search=keyword`, `?priority=high`, `?status=Open`
* **Response (200):** Array of ticket objects.

### `PUT /tickets/:id`
Updates the status of an existing ticket.
* **Body:** `{ "status": "Resolved" }`
* **Response (200):** Returns the updated ticket object.

### `GET /summary`
Retrieves analytical counts of tickets.
* **Response (200):** `{ "total_tickets": 5, "counts": [...] }`

## Setup & Local Development
1. Clone the repository and install dependencies:
   ```bash
   npm install
Create a .env file with your Supabase database URL:

DATABASE_URL="postgresql://user:password@host:port/postgres"
PORT=3001

Sync the database schema and generate the Prisma Client:

npx prisma db push
npx prisma generate

Start the development server:

npm run dev
