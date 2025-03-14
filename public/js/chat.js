// const socket = io(); // Connect to server
// const user1 = "USER_ID_1"; // Replace with logged-in user ID
// const user2 = "USER_ID_2"; // Replace with selected chat user

// // Load chat history
// async function loadMessages() {
//     const response = await fetch(`/chats/${user1}/${user2}`);
//     const messages = await response.json();
    
//     const chatBox = document.getElementById("messages");
//     chatBox.innerHTML = ""; // Clear previous content

//     messages.forEach(msg => {
//         const msgDiv = document.createElement("div");
//         msgDiv.classList.add("message", msg.sender === user1 ? "sent" : "received");
//         msgDiv.innerHTML = `<p>${msg.message}</p>`;
//         chatBox.appendChild(msgDiv);
//     });

//     chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
// }

// // Send message to the server
// function sendMessage() {
//     const messageInput = document.getElementById("messageInput");
//     const message = messageInput.value.trim();

//     if (message !== "") {
//         const data = { senderId: user1, receiverId: user2, text: message };
//         socket.emit("sendMessage", data);
//         messageInput.value = ""; // Clear input field
//     }
// }

// // Listen for new messages
// socket.on("receiveMessage", (data) => {
//     const chatBox = document.getElementById("messages");
//     const msgDiv = document.createElement("div");
//     msgDiv.classList.add("message", data.senderId === user1 ? "sent" : "received");
//     msgDiv.innerHTML = `<p>${data.message}</p>`;
//     chatBox.appendChild(msgDiv);

//     chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
// });

// Load chat history on page load
// document.addEventListener("DOMContentLoaded", loadMessages);


document.addEventListener("DOMContentLoaded", () => {
    const contacts = document.querySelectorAll(".contact");
    const chatWindow = document.getElementById("chatWindow");
    const activeUserImage = document.getElementById("activeUserImage");
    const activeUserName = document.getElementById("activeUserName");
    const messagesContainer = document.getElementById("messages");

    contacts.forEach(contact => {
        contact.addEventListener("click", async () => {
          
            const contactName = contact.getAttribute("data-name");
            const contactImage = contact.getAttribute("data-image");

            activeUserImage.src = `/uploads/${contactImage}`;
            activeUserName.textContent = contactName;

        
            chatWindow.style.display = "block";
          console.log("user");
          
            await loadMessages(contactName);
        });
    });

   
    async function loadMessages(contactName) {
        try {
            const response = await fetch(`/messages?contact=${encodeURIComponent(contactName)}`);
            const messages = await response.json();

            // Clear previous messages
            messagesContainer.innerHTML = "";

            // Append messages to chat window
            messages.forEach(msg => {
                const messageDiv = document.createElement("div");
                messageDiv.classList.add("message", msg.sender === "<%= activeUser.chatname %>" ? "sent" : "received");
                messageDiv.innerHTML = `<p>${msg.message}</p>`;
                messagesContainer.appendChild(messageDiv);
            });

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }
});

