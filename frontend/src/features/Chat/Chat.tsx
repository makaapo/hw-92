import React, { useEffect, useRef, useState } from 'react';
import { Divider, Grid, IconButton, ListItemIcon, Paper, TextField } from '@mui/material';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import dayjs from 'dayjs';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../User/usersSlice';
import { DecodedMessage, Message, OnlineUser } from '../../types';
import PersonIcon from '@mui/icons-material/Person';

const Chat: React.FC = () => {
  const user = useAppSelector(selectUser);
  const ws = useRef<WebSocket | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket('ws://localhost:8000/chat');

      ws.current.onopen = () => {
        ws.current?.send(
          JSON.stringify({
            type: 'LOGIN',
            payload: user?.token,
          }),
        );
      };

      ws.current.onmessage = (event) => {
        const parsedMessage = JSON.parse(event.data) as DecodedMessage;

        if (parsedMessage.type === 'LOGIN-SUCCESSFUL') {
          setMessages(parsedMessage.payload.messages);
          setOnlineUsers(parsedMessage.payload.onlineUsers);
        }

        if (parsedMessage.type === 'NEW-USER') {
          setOnlineUsers((prevState) => [...prevState, parsedMessage.payload.user]);
        }

        if (parsedMessage.type === 'NEW-MESSAGE') {
          setMessages((prevState) => [...prevState, parsedMessage.payload.message]);
        }
        if (parsedMessage.type === 'USER-OFFLINE') {
          setOnlineUsers(parsedMessage.payload.onlineUsers);
        }
      };

      ws.current.onclose = () => {
        setTimeout(() => {
          if (!user) return;
          connect();
        }, 5000);
      };

      ws.current.onerror = () => {
        ws.current?.close();
      };
    };

    connect();

    return () => {
      ws.current?.close();
    };
  }, [user]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ws.current || messageText.trim() === '') return;

    ws.current.send(
      JSON.stringify({
        type: 'SEND-MESSAGE',
        payload: messageText.trim(),
      }),
    );
    setMessageText('');
  };
  const onFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
  };

  const scrollBottom = () => {
    messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollBottom();
  }, [messages]);
  return (
    <Grid container component={Paper} sx={{ width: '100%', borderRadius: 4 }}>
      <Grid item xs={3} sx={{ borderRight: '1px solid #e0e0e0' }}>
        <List>
          <Typography variant="h6" ml={2} mt={2} gutterBottom>
            Online Users
          </Typography>
          <Divider />
          {onlineUsers.length > 0 ? (
            onlineUsers
              .filter(
                (user, index, self) =>
                  index === self.findIndex((otherUser) => otherUser._id === user._id),
              )
              .map((user) => (
                <ListItem key={user._id}>
                  <ListItemIcon>
                    <Avatar alt={user.displayName} sx={{ bgcolor: '#3f51b5' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={user.displayName}
                    secondary="online"
                    secondaryTypographyProps={{ color: 'green' }}
                  />
                </ListItem>
              ))
          ) : (
            <Typography variant="body2" color="textSecondary" align="center" mt={2}>
              No users online
            </Typography>
          )}
        </List>
      </Grid>
      <Grid item xs={9} sx={{ backgroundColor: '#f9f9f9' }}>
        <List sx={{ height: '70vh', overflowY: 'auto', px: 2, py: 1 }}>
          {messages.map((message) => (
            <ListItem
              alignItems="flex-start"
              key={message._id}
              sx={{
                backgroundColor: message.user?._id === user?._id ? '#e3f2fd' : '#ffffff',
                borderRadius: 2,
                mb: 1,
                px: 2,
                py: 1,
              }}
            >
              <ListItemAvatar>
                <Avatar alt={message.user?.displayName} sx={{ bgcolor: '#3f51b5' }} />
              </ListItemAvatar>
              <Grid container>
                <Grid item flexGrow={1}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontSize="small" color="text.secondary">
                        {message.user?.displayName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" fontSize="medium">
                        {message.message}
                      </Typography>
                    }
                  />
                  <ListItemText
                    secondary={dayjs(message.createdAt).format('DD.MM.YYYY HH:mm:ss')}
                    sx={{ textAlign: 'right', fontSize: '0.75rem', color: '#757575' }}
                  />
                </Grid>
                <div ref={messagesRef} />
              </Grid>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Grid
          container
          component="form"
          onSubmit={onFormSubmit}
          px={3}
          py={2}
          justifyContent="space-between"
          alignItems="center"
          sx={{ backgroundColor: '#ffffff' }}
        >
          <Grid item sx={{ flexGrow: 1, pr: 2 }}>
            <TextField
              name="messageText"
              value={messageText}
              placeholder="Type a message..."
              variant="outlined"
              onChange={onFieldChange}
              fullWidth
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
          </Grid>
          <Grid item>
            <IconButton type="submit" color="primary">
              <SendIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Chat;
