import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let server: any;

beforeAll(async () => {
    await new Promise<void>((resolve) => {
        server = app.listen(0, () => resolve());
    });
});

afterAll(async () => {
    await prisma.$disconnect();
    await new Promise<void>((resolve) => {
        server.close(() => resolve());
    });
});

describe('Support Ticket Tracker API', () => {
    it('should create a ticket successfully with valid data', async () => {
        const response = await request(server)
            .post('/tickets')
            .send({
                title: 'Fix login bug',
                description: 'Users are unable to log in via OAuth',
                priority: 'high'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Fix login bug');
        expect(response.body.status).toBe('Open');
    });

    it('should return 422 Unprocessable Entity when title is empty', async () => {
        const response = await request(server)
            .post('/tickets')
            .send({
                title: '',
                priority: 'medium'
            });

        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty('error');
    });

    it('should retrieve the list of tickets', async () => {
        const response = await request(server).get('/tickets');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should retrieve the summary aggregation', async () => {
        const response = await request(server).get('/summary');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('total_tickets');
        expect(response.body).toHaveProperty('counts');
    });
});