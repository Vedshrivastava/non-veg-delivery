import { WebSocketServer } from 'ws';

// Initialize WebSocket server
const wss = new WebSocketServer({ noServer: true });

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Handle incoming messages from clients
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
    });

    // Handle client disconnect
    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
    });

    // Handle WebSocket errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast function to send data to all connected clients
const broadcast = (data) => {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

export { wss, broadcast };
