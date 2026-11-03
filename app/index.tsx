import { StyleSheet, Text, View } from 'react-native';

// shortcut: placeholder entry screen until M0 adds theme tokens and i18n; replaced by A1 Splash in M1.
export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Home Made</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
