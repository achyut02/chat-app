import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { getUsers } from '../api/api';
import { getSocket } from '../socket/socket';

export default function HomeScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    fetchUsers();
    if (socket) {
      socket.on('user:online', ({ userId }) => fetchUsers());
      socket.on('user:offline', ({ userId }) => fetchUsers());
      socket.on('message:new', ({ message, conversationId }) => {
        fetchUsers();
      });
    }
    return () => {
      if (socket) socket.off('message:new');
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) { console.log(err); }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList data={users} keyExtractor={i => i.user._id}
        renderItem={({ item }) => {
          const u = item.user;
          const conv = item.conversation;
          return (
            <TouchableOpacity onPress={() => navigation.navigate('Chat', { user: u, conversation: conv })} style={{padding:12, borderBottomWidth:1}}>
              <Text style={{fontWeight:'bold'}}>{u.name} {u.online ? '(online)' : ''}</Text>
              <Text numberOfLines={1}>{conv?.lastMessage?.text || 'Tap to start chat'}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
