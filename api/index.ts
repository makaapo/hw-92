import express from 'express';
import mongoose from 'mongoose';
import config from './config';
import cors from 'cors';
import usersRouter from './routers/users';
import { IncomingMessage, ActiveConnections, OnlineUser } from './types';
import expressWs from 'express-ws';
import Message from './models/Message';
import User from './models/User';

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors(config.corsOptions));

app.use('/users', usersRouter);

expressWs(app);

const router = express.Router();

const activeConnections: ActiveConnections = {};

const onlineUsers: OnlineUser[] = [];

router.ws('/chat', (ws, _req) => {
  const id = crypto.randomUUID();
  activeConnections[id] = ws;

  let user: OnlineUser | null = null;

  ws.on('message', async (message) => {
    const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;

    if (decodedMessage.type === 'LOGIN') {
      const userData = await User.findOne<OnlineUser>({ token: decodedMessage.payload }, 'displayName');

      if (!userData) return;

      const existing = onlineUsers.find((onlineUser) => onlineUser._id === userData._id);

      user = userData;

      if (!existing) {
        onlineUsers.push(user);
        Object.keys(activeConnections).forEach((key) => {
          if (key !== id) {
            const connection = activeConnections[key];
            connection.send(
              JSON.stringify({
                type: 'NEW-USER',
                payload: { user },
              }),
            );
          }
        });
      }

      const messages = await Message.find().sort({ createdAt: 1 }).limit(30).populate('user', 'displayName');
      ws.send(
        JSON.stringify({
          type: 'LOGIN-SUCCESSFUL',
          payload: {
            onlineUsers,
            messages,
          },
        }),
      );
    }

    ws.on('close', async () => {
      delete activeConnections[id];
    });
  });
});

app.use(router);

const run = async () => {
  await mongoose.connect(config.database);

  app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
  });

  process.on('exit', () => {
    mongoose.disconnect();
  });
};

run().catch(console.error);
