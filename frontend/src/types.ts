export interface RegisterMutation {
  username: string;
  password: string;
  displayName: string;
}

export interface LoginMutation {
  username: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  displayName: string;
  token: string;
}

export interface OnlineUser {
  _id: string;
  displayName: string;
}

export interface Message {
  _id: string;
  user: OnlineUser;
  message: string;
  createdAt: string;
}

export interface IncomingLogin {
  type: 'LOGIN-SUCCESSFUL';
  payload: {
    onlineUsers: OnlineUser[];
    messages: Message[];
  };
}

export interface IncomingLogout {
  type: 'USER-OFFLINE';
  payload: {
    onlineUsers: OnlineUser[];
  };
}

export interface IncomingNewUser {
  type: 'NEW-USER';
  payload: {
    user: OnlineUser;
  };
}

export interface IncomingNewMessage {
  type: 'NEW-MESSAGE';
  payload: {
    message: Message;
  };
}

export type DecodedMessage = IncomingLogin | IncomingLogout | IncomingNewMessage | IncomingNewUser;

export interface ValidationError {
  errors: {
    [key: string]: {
      name: string;
      message: string;
    };
  };
  message: string;
  name: string;
  _message: string;
}

export interface GlobalError {
  error: string;
}
