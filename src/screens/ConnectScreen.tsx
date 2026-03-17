import React, {useState} from 'react';
import {View, TextInput, Button, Text, StyleSheet} from 'react-native';

export const ConnectScreen = ({navigation}: any) => {
  const [host, setHost] = useState('192.168.1.100');
  const [port, setPort] = useState('18789');
  const [token, setToken] = useState('');

  const handleConnect = () => {
    navigation.navigate('Chat', {host, port, token});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>连接到 OpenClaw</Text>

      <TextInput
        style={styles.input}
        placeholder="主机地址 (如: 192.168.1.100)"
        value={host}
        onChangeText={setHost}
      />

      <TextInput
        style={styles.input}
        placeholder="端口 (默认: 18789)"
        value={port}
        onChangeText={setPort}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Token"
        value={token}
        onChangeText={setToken}
        secureTextEntry
      />

      <Button title="连接" onPress={handleConnect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
