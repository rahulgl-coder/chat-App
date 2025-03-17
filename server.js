


const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const dBConnect = require("./dbConnection/connect");
const userRoute = require("./routes/userRoute");
const chatRoute = require("./routes/chatRoute");
const Chat=require("./model/chat")
const app = express();
dotenv.config();



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
app.use(chatRoute)


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




const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));




