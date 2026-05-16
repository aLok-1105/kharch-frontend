import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

function LoadingOverlay({ message }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#5B67CA" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

export default LoadingOverlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  message: {
    fontSize: 16,
    marginBottom: 12,
    color: '#1A1A1A',
    marginTop: 10,
    fontWeight: '600'
  },
});
