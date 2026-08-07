import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer;
export const initSocketIO = async (server: HttpServer): Promise<void> => {
  console.log("Initializing Socket.IO server...");
  const { Server } = await import("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    },
  });

  console.log("Socket.IO server initialized!");
  io.on("connection", (socket: Socket) => {
    console.log("Socket just connected:", socket.id);
    socket.on("clientMessage", (message: string) => {
      console.log("Message received from client:", message);
      socket.emit("serverMessage", `Server received: ${message}`);
    });

    socket.on("disconnect", () => {
      console.log(socket.id, "just disconnected");
    });
  });
};

//   userId,
//   userMsg,
//   adminMsg,
// }: {
//   userId: string;
//   userMsg: ILocalizedString;
//   adminMsg: ILocalizedString;
// }): Promise<void> => {
//   if (!io) {
//     throw new Error("Socket.IO is not initialized");
//   }

//   // Get admin IDs
//   const admins = await UserModel.find({ role: "admin" }).select("_id");
//   const adminIds = admins.map((admin) => admin._id.toString());

//   // Notify the specific user
//   if (userMsg) {
//     io.emit(`notification::${userId}`, {
//       userId,
//       message: userMsg,
//     });
//   }

//   // Notify all admins
//   if (adminMsg) {
//     adminIds.forEach((adminId) => {
//       io.emit(`notification::${adminId}`, {
//         adminId,
//         message: adminMsg,
//       });
//     });
//   }

//   // Save notification to the database
//   await NotificationModel.create<INotification>({
//     userId,
//     adminId: adminIds,
//     adminMsg: adminMsg,
//     userMsg: userMsg ,
//   });
// };


