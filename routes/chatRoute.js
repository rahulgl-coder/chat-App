const express = require("express");
const route = express.Router();
const Chat = require("../model/chat");




route.get("/getMessages", async (req, res) => {
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



module.exports=route