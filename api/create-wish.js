import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { nanoid } from 'nanoid';

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
});

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const ip = request.headers['x-forwarded-for'] || '127.0.0.1';
        const { success } = await ratelimit.limit(ip);

        if (!success) {
            return response.status(429).json({ error: 'Too many requests' });
        }

        const { name, description } = request.body;

        if (!name || !description) {
            return response.status(400).json({ error: 'Name and description are required' });
        }

        const id = nanoid(10);
        const key = `wish:${id}`;

        await redis.set(key, { name, description }, { ex: 259200 });

        return response.status(200).json({ id });
    } catch (error) {
        console.error('Error creating wish:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
