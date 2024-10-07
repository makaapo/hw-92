import mongoose, {Model} from 'mongoose';
import WebSocket from 'ws';

export interface UserFields {
  username: string;
  password: string;
  token: string;
  displayName: string;
}

export interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
  generateToken(): void;
}

export type UserModel = Model<UserFields, {}, UserMethods>;

export interface ActiveConnections {
  [id: string]: WebSocket;
}

export interface MessageFields {
  user: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface IncomingMessage {
  type: string;
  payload: string;
}

export interface OnlineUser {
  _id: string;
  displayName: string;
}