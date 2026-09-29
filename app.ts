import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Zod Validation Schema
const ticketSchema = z.object({
    title: z.string().min(1, "Title cannot be empty"),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']),
    status: z.enum(['Open', 'In progress', 'Resolved']).optional()
});

// Create Ticket
app.post('/tickets', async (req: Request, res: Response) => {
    try {
        const validatedData = ticketSchema.parse(req.body);
        const ticket = await prisma.ticket.create({
            data: {
                ...validatedData,
                status: validatedData.status === 'In progress' ? 'In_progress' : validatedData.status
            } as any
        });
        return res.status(201).json(ticket);
    } catch (error) {
        return res.status(422).json({ error: "Invalid data", details: error });
    }
});

// List and Search Tickets
app.get('/tickets', async (req: Request, res: Response) => {
    const { search, status, priority } = req.query;

    const whereClause: any = {};
    if (search) whereClause.title = { contains: String(search), mode: 'insensitive' };
    if (priority) whereClause.priority = String(priority);
    if (status) {
        whereClause.status = status === 'In progress' ? 'In_progress' : status;
    }

    const tickets = await prisma.ticket.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
    return res.json(tickets);
});

// Update Ticket Status
app.put('/tickets/:id', async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        if (!['Open', 'In progress', 'Resolved'].includes(status)) {
            return res.status(422).json({ error: "Invalid status" });
        }
        const ticket = await prisma.ticket.update({
            where: { id: String(req.params.id) },
            data: { status: status === 'In progress' ? 'In_progress' : status }
        });
        return res.json(ticket);
    } catch (error) {
        return res.status(404).json({ error: "Ticket not found or update failed" });
    }
});

// Summary Endpoint
app.get('/summary', async (req: Request, res: Response) => {
    const total = await prisma.ticket.count();
    const group = await prisma.ticket.groupBy({
        by: ['status'],
        _count: { status: true }
    });

    return res.json({ total_tickets: total, counts: group });
});

export { app };