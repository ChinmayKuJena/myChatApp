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

  private activeClients: Map<string, { roomId: string, userName: string }> = new Map(); // Store client ID, roomId, and userName

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.activeClients.delete(client.id); // Remove client on disconnect
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, { roomId, userName }: { roomId: string, userName: string }) {
    client.join(roomId); // Client joins the room
    this.activeClients.set(client.id, { roomId, userName });
    console.log(`Client ${client.id} joined room: ${roomId} with name: ${userName}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { roomId: string, userName: string, message: string }) {
    const { roomId, userName, message } = payload;
    this.server.to(roomId).emit('message', { userName, message }); // Emit message to the room
    console.log(`Message to room ${roomId}: ${userName}: ${message}`);
  }
}
