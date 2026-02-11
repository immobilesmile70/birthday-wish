import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));

let isConnected = false;

async function connectRedis() {
    if (!isConnected) {
        await client.connect();
        isConnected = true;
    }
    return client;
}

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const redis = await connectRedis();

        const ip = request.headers['x-forwarded-for'] || '127.0.0.1';
        const rateLimitKey = `ratelimit:${ip}`;

        const requests = await redis.incr(rateLimitKey);

        if (requests === 1) {
            await redis.expire(rateLimitKey, 3600);
        }

        if (requests > 3) {
            return response.status(429).json({ error: 'Too many requests' });
        }

        const { name, description, sender } = request.body;

        if (!name || !description || !sender) {
            return response.status(400).json({ error: 'Name, description, and sender are required' });
        }

        if (name.length > 50 || description.length > 1200 || sender.length > 50) {
            return response.status(400).json({ error: 'Input exceeds maximum allowed length' });
        }

        const { nanoid } = await import('nanoid');
        const id = nanoid(10);
        const key = `wish:${id}`;

        await redis.set(key, JSON.stringify({ name, description, sender }), {
            EX: 259200
        });

        return response.status(200).json({ id });
    } catch (error) {
        console.error('Error creating wish:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
