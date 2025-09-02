import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import { getMessages } from '../api/api';
import { getSocket } from '../socket/socket';

export default function ChatScreen({ route }) {
  const { user, conversation } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const socket = getSocket();
  const convId = conversation?._id;

  useEffect(() => {
    async function load() {
      if (conversation) {
        const res = await getMessages(conversation._id);
        setMessages(res.data);
      } else {
        setMessages([]);
      }
    }
    load();

    if (socket) {
      socket.on('message:new', ({ message, conversationId }) => {
        if (convId && convId === conversationId) {
          setMessages(prev => [...prev, message]);
        }
      });
      socket.on('typing:start', ({ conversationId }) => {
        if (convId && convId === conversationId) setTyping(true);
      });
      socket.on('typing:stop', ({ conversationId }) => {
        if (convId && convId === conversationId) setTyping(false);
      });
      socket.on('message:read', ({ messageId, readerId }) => {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, readBy: [...(m.readBy||[]), readerId] } : m));
      });
    }

    return () => {
      if (socket) {
        socket.off('message:new');
        socket.off('typing:start');
        socket.off('typing:stop');
        socket.off('message:read');
      }
    };
  }, [conversation]);

  let typingTimeout = useRef(null);

  const send = () => {
    if (!text.trim()) return;
    socket.emit('message:send', { conversationId: conversation?._id, toUserId: user._id, text });
    setText('');
    socket.emit('typing:stop', { conversationId: conversation?._id });
  };

  const onChangeText = (t) => {
    setText(t);
    if (socket) socket.emit('typing:start', { conversationId: conversation?._id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      if (socket) socket.emit('typing:stop', { conversationId: conversation?._id });
    }, 900);
  };

  const markAsRead = (message) => {
    if (socket) socket.emit('message:read', { conversationId: conversation?._id, messageId: message._id });
  };

  return (
    <View style={{flex:1}}>
      <FlatList data={messages} keyExtractor={m => m._id} renderItem={({item})=>(
        <Text onPress={()=>markAsRead(item)} style={{padding:8}}>{item.sender.name}: {item.text} {item.readBy && item.readBy.length ? '✔✔' : '✔'}</Text>
      )}/>
      {typing ? <Text style={{paddingLeft:10}}>Typing...</Text> : null}
      <View style={{flexDirection:'row', padding:8}}>
        <TextInput value={text} onChangeText={onChangeText} style={{flex:1, borderWidth:1, padding:6}}/>
        <Button title="Send" onPress={send} />
      </View>
    </View>
  );
}
