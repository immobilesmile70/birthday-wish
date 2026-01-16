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
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = request.query;

        if (!id) {
            return response.status(400).json({ error: 'ID is required' });
        }

        const redis = await connectRedis();
        const dataString = await redis.get(`wish:${id}`);

        if (!dataString) {
            return response.status(404).json({ error: 'Wish not found or expired' });
        }

        const data = JSON.parse(dataString);

        return response.status(200).json(data);
    } catch (error) {
        console.error('Error fetching wish:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
