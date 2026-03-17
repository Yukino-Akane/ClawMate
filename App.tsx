import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ConnectScreen} from './src/screens/ConnectScreen';
import {ChatScreen} from './src/screens/ChatScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Connect">
        <Stack.Screen
          name="Connect"
          component={ConnectScreen}
          options={{title: 'ClawMate'}}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{title: '对话'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
