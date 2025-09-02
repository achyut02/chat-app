import React from 'react';
import { View, Text } from 'react-native';

export default function MessageBubble({ message, isMine }) {
  return (
    <View style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', margin:6, padding:8, borderRadius:8, borderWidth:1 }}>
      <Text>{message.text}</Text>
    </View>
  );
}
