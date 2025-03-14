


const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const dBConnect = require("./dbConnection/connect");
const userRoute = require("./routes/userRoute");
// const chatRoute = require("./routes/chatRoute");
const Chat=require("./model/chat")

dotenv.config();

const app = express();
const server = http.createServer(app); 
const io = socketIo(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(userRoute);
// app.use(chatRoute)


dBConnect();
const users = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

 
    socket.on("join", (userId) => {
        users[userId] = socket.id;
        console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    });

    socket.on("privateMessage", async ({ senderId, receiverId, message }) => {
        const receiverSocketId = users[receiverId];

       
        const chatMessage = new Chat({ senderId, receiverId, message });
        await chatMessage.save();

       if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
        }
        io.to(socket.id).emit("receiveMessage", { senderId, message });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        Object.keys(users).forEach(userId => {
            if (users[userId] === socket.id) {
                delete users[userId];
            }
        });
    });
});

app.get("/getMessages", async (req, res) => {
    const { user1, user2 } = req.query;
    try {
        const messages = await Chat.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
      
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));




