import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*", // or the specific origin you want to give access to,
    methods: ["GET", "POST"],
  },
});

const users = new Map();
const searchingUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  users.set(socket.id, { id: socket.id });

  socket.on("searchGame", () => {
    console.log(`User searching for game: ${socket.id}`);

    // If this user is already searching, don't add them to the map again.
    users.set(socket.id, { id: socket.id, isSearching: false });

    if (searchingUsers.has(socket.id)) {
      return;
    }

    if (searchingUsers.size > 0) {
      const otherUser = searchingUsers.values().next().value;

      // Ensure the other user isn't the same user
      if (otherUser.id !== socket.id) {
        searchingUsers.delete(otherUser.id);
        console.log(
          `Starting game between users: ${socket.id} and ${otherUser.id}`
        );
      }
    } else {
      searchingUsers.set(socket.id, users.get(socket.id));
    }
  });

  // When a user starts or stops searching for a game, update their status.
  socket.on("search", ({ isSearching }) => {
    console.log(
      `User ${isSearching ? "started" : "stopped"} searching: ${socket.id}`
    );
    const user = users.get(socket.id);
    user.isSearching = isSearching;

    if (isSearching) {
      for (const [id, otherUser] of users.entries()) {
        if (otherUser.isSearching && id !== socket.id) {
          console.log(`Starting game between ${socket.id} and ${id}`);
          otherUser.isSearching = false;
          user.isSearching = false;

          // Store opponent's id
          user.opponentId = id;
          otherUser.opponentId = socket.id;

          io.to(socket.id).emit("gameStart", { opponentId: id });
          io.to(id).emit("gameStart", { opponentId: socket.id });

          // break the loop as we have found a match
          break;
        }
      }
    } else {
      // If user is not searching anymore, clear opponentId
      user.opponentId = null;
    }
  });

  socket.on("stopSearch", () => {
    console.log(`User stopped searching for a game: ${socket.id}`);
    searchingUsers.delete(socket.id);
  });

  // Inside io.on("connection", (socket) => { ... })
  socket.on("toggleReady", () => {
    const user = users.get(socket.id);
    user.isReady = !user.isReady;
    console.log(
      `User ${socket.id} is now ${user.isReady ? "ready" : "not ready"}`
    );

    // CHANGE:
    // Emit an event back to the user
    socket.emit("toggleReady", { isReady: user.isReady });
  });

  socket.on("roll", () => {
    const user = users.get(socket.id);
    user.isReady = false; // Reset the user's ready state.
    if (user.opponentId && users.get(user.opponentId).isReady) {
      const dice = Array.from({ length: 10 }, () =>
        Math.ceil(Math.random() * 6)
      );
      io.to(socket.id).emit("dice", { dice });
      io.to(user.opponentId).emit("dice", { dice });
    }

    // CHANGE:
    // Emit an event back to the user
    socket.emit("toggleReady", { isReady: user.isReady });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    const user = users.get(socket.id);
    if (user.opponent) {
      const opponent = users.get(user.opponent);
      opponent.isReady = false; // Reset the opponent's ready state.
      io.to(user.opponent).emit("opponentDisconnected");
    }
    users.delete(socket.id);
  });
});

const port = 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
