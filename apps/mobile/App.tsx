import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

// M0: blank app. Screens arrive in M1.
export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar style="auto" />
    </View>
  );
}
