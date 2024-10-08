import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import User from './models/User';
import config from './config';
import Message from './models/Message';

const run = async () => {
  await mongoose.connect(config.database);
  const db = mongoose.connection;

  try {
    await db.dropCollection('users');
    await db.dropCollection('message');
  } catch (e) {
    console.log('Skipping drop...');
  }

  const [user1, user2, user3] = await User.create(
    {
      username: 'malik',
      displayName: 'Малик',
      password: '123',
      token: randomUUID(),
    },
    {
      username: 'diana',
      displayName: 'Диана',
      password: '123',
      token: randomUUID(),
    },
    {
      username: 'makapo',
      displayName: 'Макар',
      password: '1234',
      token: randomUUID(),
    },
  );

  await Message.create(
    {
      user: user1,
      message: 'Всем привет!',
    },
    {
      user: user2,
      message: 'Как дела?',
    },
    {
      user: user2,
      message: 'Читаю книгу!',
    },
    {
      user: user3,
      message: 'Покушаем завтра?',
    },
    {
      user: user3,
      message: 'Как погода',
    },
  );

  await db.close();
};

void run();
