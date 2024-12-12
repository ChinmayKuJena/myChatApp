import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeClients: Map<string, { roomId: string; userName: string }> = new Map(); // Store client ID, roomId, and userName
  private messages: Map<string, { userName: string; message: string }[]> = new Map(); // Store messages for each room

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const clientData = this.activeClients.get(client.id);
    if (clientData) {
      const { roomId } = clientData;
      this.activeClients.delete(client.id);
      console.log(`Client ${client.id} removed from room: ${roomId}`);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, { roomId, userName }: { roomId: string; userName: string }) {
    client.join(roomId); // Client joins the room
    this.activeClients.set(client.id, { roomId, userName });

    // Send previous messages to the newly joined client
    const roomMessages = this.messages.get(roomId) || [];
    client.emit('previousMessages', roomMessages);

    console.log(`Client ${client.id} joined room: ${roomId} with name: ${userName}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { roomId: string; userName: string; message: string }) {
    const { roomId, userName, message } = payload;

    // Save the message to memory for the room
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []); // Initialize the message array if not already present
    }
    this.messages.get(roomId).push({ userName, message });

    // Emit the message to all clients in the room
    this.server.to(roomId).emit('message', { userName, message });

    console.log(`Message to room ${roomId}: ${userName}: ${message}`);
  }
}
