let currentReceiverId = null;
let currentReceiverUsername = null;

// Открыть чат с пользователем
function openChat(receiverId, receiverUsername) {
    currentReceiverId = receiverId;
    currentReceiverUsername = receiverUsername;
    document.getElementById('chat').style.display = 'block';
    document.getElementById('receiver-id').value = receiverId;
    document.getElementById('chat-username').textContent = receiverUsername;
    fetchMessages();
}

// Отправка сообщения
document.getElementById('message-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const content = document.getElementById('message-content').value;
    const receiverId = document.getElementById('receiver-id').value;

    if (!content || !receiverId) {
        alert('Заполните все поля!');
        return;
    }

    fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `receiver_id=${receiverId}&content=${encodeURIComponent(content)}`,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('message-content').value = '';
                fetchMessages();
            } else {
                alert('Ошибка при отправке сообщения: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке сообщения.');
        });
});

// Получение сообщений
function fetchMessages() {
    fetch('/get_messages')
        .then(response => response.json())
        .then(messages => {
            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML = '';

            const filteredMessages = messages.filter(message => 
                message.sender_id === currentReceiverId || message.receiver_id === currentReceiverId
            );

            filteredMessages.forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.className = `message ${message.sender_id === currentReceiverId ? 'receiver' : 'sender'}`;
                messageElement.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="{{ url_for('static', filename='uploads/') }}${message.sender_avatar}" alt="${message.sender}" class="rounded-circle me-2" width="30" height="30">
                        <strong>${message.sender}:</strong>
                    </div>
                    <div>${message.content}</div>
                    <small>${message.timestamp}</small>
                `;
                messagesDiv.appendChild(messageElement);
            });

            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        })
        .catch(error => {
            console.error('Ошибка при загрузке сообщений:', error);
        });
}

// Обновление сообщений каждые 5 секунд
setInterval(fetchMessages, 5000);