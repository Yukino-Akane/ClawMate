import React, {useState, useEffect} from 'react';
import {View, TextInput, Button, FlatList, Text, StyleSheet} from 'react-native';
import {OpenClawClient} from '../services/OpenClawClient';

export const ChatScreen = ({route}: any) => {
  const {host, port, token} = route.params;
  const [client, setClient] = useState<OpenClawClient | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const clawClient = new OpenClawClient({host, port: parseInt(port), token});

    clawClient.connect()
      .then(() => {
        setConnected(true);
        clawClient.onMessage((msg) => {
          setMessages(prev => [...prev, {text: msg.content, sender: 'bot'}]);
        });
      })
      .catch(err => console.error('连接失败:', err));

    setClient(clawClient);

    return () => clawClient.disconnect();
  }, []);

  const sendMessage = () => {
    if (input.trim() && client) {
      setMessages(prev => [...prev, {text: input, sender: 'user'}]);
      client.sendMessage(input);
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        {connected ? '✅ 已连接' : '⏳ 连接中...'}
      </Text>

      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({item}) => (
          <View style={[styles.message, item.sender === 'user' ? styles.userMsg : styles.botMsg]}>
            <Text>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="输入消息..."
        />
        <Button title="发送" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  status: {padding: 10, textAlign: 'center', backgroundColor: '#f0f0f0'},
  message: {padding: 10, margin: 5, borderRadius: 5},
  userMsg: {alignSelf: 'flex-end', backgroundColor: '#007AFF'},
  botMsg: {alignSelf: 'flex-start', backgroundColor: '#E5E5EA'},
  inputContainer: {flexDirection: 'row', padding: 10},
  input: {flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, marginRight: 10},
});
