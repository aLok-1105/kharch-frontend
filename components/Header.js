import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Header({ title, subtitle, icon, color, size, onPress }) {

    return (
        <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity style={styles.notifButton}>
                <Pressable onPress={onPress}>
                    <Ionicons name={icon} size={size} color={color} />
                    {/* <View style={styles.notifDot} /> */}
                </Pressable>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 15,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    notifButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    notifDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E53935',
        borderWidth: 1,
        borderColor: '#FFF',
    },
})