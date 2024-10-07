import React, { useEffect, useRef, useState } from 'react';
import { Divider, Grid, ListItemIcon, Paper } from '@mui/material';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../User/usersSlice';
import { DecodedMessage, OnlineUser } from '../../types';
import PersonIcon from '@mui/icons-material/Person';

const Chat: React.FC = () => {
  const user = useAppSelector(selectUser);
  const ws = useRef<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

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
          setOnlineUsers(parsedMessage.payload.onlineUsers);
        }

        if (parsedMessage.type === 'NEW-USER') {
          setOnlineUsers((prevState) => [...prevState, parsedMessage.payload.user]);
        }
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
    </Grid>
  );
};

export default Chat;
