import { Text, View } from "react-native";
import { StyleSheet } from "react-native";

export default function NoDisplay({ message, subMessage }) {
    return (
        <View style={styles.container}>
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.subMessage}>{subMessage}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    message: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    subMessage: {
        fontSize: 14,
        color: '#666'
    }
})