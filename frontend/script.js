const socket = io('http://localhost:3000');
let roomId = '';

document.getElementById('joinRoom').addEventListener('click', () => {
  roomId = document.getElementById('roomId').value;
  if (!roomId) return alert('Please enter a Room ID');

  socket.emit('joinRoom', roomId);
  document.getElementById('chat').style.display = 'block';
});

document.getElementById('sendMessage').addEventListener('click', () => {
  const message = document.getElementById('message').value;
  if (!message) return alert('Please enter a message');

  socket.emit('message', { roomId, message });
  document.getElementById('message').value = '';
});

socket.on('message', (data) => {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML += `<p><strong>${data.sender}:</strong> ${data.message}</p>`;
});
