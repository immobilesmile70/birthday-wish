import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = request.query;

        if (!id) {
            return response.status(400).json({ error: 'ID is required' });
        }

        const data = await redis.get(`wish:${id}`);

        if (!data) {
            return response.status(404).json({ error: 'Wish not found or expired' });
        }

        return response.status(200).json(data);
    } catch (error) {
        console.error('Error fetching wish:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
