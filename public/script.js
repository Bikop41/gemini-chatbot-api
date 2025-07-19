document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const sendButton = chatForm.querySelector('button');
    const chatBox = document.getElementById('chat-box');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const message = userInput.value.trim();
        if (!message || userInput.disabled) return;

        appendMessage(escapeHTML(message), 'user');
        userInput.value = '';
        userInput.disabled = true;
        sendButton.disabled = true;

        // Add a "thinking" indicator for better UX
        const typingIndicator = appendMessage('...', 'bot');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            appendMessage(escapeHTML(data.reply || 'No reply'), 'bot');
            typingIndicator.remove();
        } catch (error) {
            console.error('Error fetching chat response:', error);
            typingIndicator.textContent = error.message || 'Sorry, an unknown error occurred.';
            typingIndicator.classList.add('error');
        } finally {
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    });

    function appendMessage(text, className) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', className);
        messageElement.textContent = text;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement; // Return the element to allow modifying it later
    }

    // Tambahkan fungsi escapeHTML untuk keamanan
    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m];
        });
    }
});
