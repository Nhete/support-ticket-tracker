import express from 'express';
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
app.post('/tickets', async (req, res) => {
    try {
        const validatedData = ticketSchema.parse(req.body);
        const ticket = await prisma.ticket.create({
            data: {
                ...validatedData,
                status: validatedData.status === 'In progress' ? 'In_progress' : validatedData.status
            }
        });
        res.status(201).json(ticket);
    }
    catch (error) {
        res.status(422).json({ error: "Invalid data", details: error });
    }
});
// List and Search Tickets
app.get('/tickets', async (req, res) => {
    const { search, status, priority } = req.query;
    const whereClause = {};
    if (search)
        whereClause.title = { contains: String(search), mode: 'insensitive' };
    if (priority)
        whereClause.priority = String(priority);
    if (status) {
        whereClause.status = status === 'In progress' ? 'In_progress' : status;
    }
    const tickets = await prisma.ticket.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
    res.json(tickets);
});
// Update Ticket Status
app.put('/tickets/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Open', 'In progress', 'Resolved'].includes(status)) {
            return res.status(422).json({ error: "Invalid status" });
        }
        const ticket = await prisma.ticket.update({
            where: { id: req.params.id },
            data: { status: status === 'In progress' ? 'In_progress' : status }
        });
        res.json(ticket);
    }
    catch (error) {
        res.status(404).json({ error: "Ticket not found or update failed" });
    }
});
// Summary Endpoint
app.get('/summary', async (req, res) => {
    const total = await prisma.ticket.count();
    const group = await prisma.ticket.groupBy({
        by: ['status'],
        _count: { status: true }
    });
    res.json({ total_tickets: total, counts: group });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
