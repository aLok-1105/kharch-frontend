import { useContext, useEffect, useState } from "react";
import { Alert, Text, View, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { AuthContext } from "../store/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import { UserDetailsContext } from "../store/UserDetailsContext";
import axios from "axios";
import Header from "../components/Header";
import LoadingOverlay from "../components/LoadingOverlay";
import { baseUrl } from '../api/api'

export default function ProfileScreen() {
    const authCtx = useContext(AuthContext);
    const userDetailsCtx = useContext(UserDetailsContext);

    const [userDetails, setUserDetails] = useState({
        fullName: userDetailsCtx?.fullName,
        email: userDetailsCtx?.email,
    });
    const [isUpdating, setIsUpdating] = useState(false);

    function logoutHandler() {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: () => { authCtx.logout(); userDetailsCtx.logout(); } }
            ]
        );
    }

    function isSame() {
        return (userDetails?.email === userDetailsCtx?.email && userDetails?.fullName === userDetailsCtx?.fullName);
    }

    async function handleUpdateUserDetails() {
        setIsUpdating(true);
        try {
            await axios.put(`${baseUrl}/api/user/userUpdate`,
                {
                    fullName: userDetails.fullName,
                    email: userDetails.email,
                }, {
                headers: {
                    Authorization: `Bearer ${authCtx.token}`
                }
            }
            )
            userDetailsCtx.updateUserDetails(userDetails);
            Alert.alert("Success", "Profile updated successfully");
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
        refreshCtx.triggerRefresh();
    }

    return (
        <View style={styles.container}>
            <Header title="Profile" subtitle="Manage your account" icon="person" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}


                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={50} color="#5B67CA" />
                            </View>
                            {/* <TouchableOpacity style={styles.editAvatarButton}>
                                <Ionicons name="pencil" size={14} color="#5B67CA" />
                            </TouchableOpacity> */}
                        </View>
                        <Text style={styles.userName}>{userDetails.fullName}</Text>
                        <Text style={styles.userEmail}>{userDetails.email}</Text>
                    </View>

                    {/* Personal Details Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Personal Details</Text>
                            <Text style={styles.sectionSubtitle}>Update your personal information</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={userDetails.fullName}
                                    onChangeText={(text) => setUserDetails({ ...userDetails, fullName: text })}
                                    placeholder="Enter your name"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={userDetails.email}
                                    onChangeText={(text) => setUserDetails({ ...userDetails, email: text })}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <TouchableOpacity style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                                <Text style={[styles.input, { color: '#1A1A1A', paddingTop: 15 }]}>••••••••</Text>
                                <Ionicons name="chevron-forward" size={18} color="#AAA" />
                            </TouchableOpacity>
                        </View> */}

                        <TouchableOpacity
                            disabled={isSame() || isUpdating}
                            style={[styles.updateButton, (isSame() || isUpdating) && { backgroundColor: '#999999ff' }]}
                            onPress={handleUpdateUserDetails}
                        >
                            <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 10 }} />
                            <Text style={styles.updateButtonText}>Update Details</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Logout Section */}
                    <TouchableOpacity style={styles.logoutCard} onPress={logoutHandler}>
                        <View style={styles.logoutIconContainer}>
                            <Ionicons name="log-out-outline" size={24} color="#E53935" />
                        </View>
                        <View style={styles.logoutTextContainer}>
                            <Text style={styles.logoutTitle}>Logout</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#AAA" />
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        marginTop: 20
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E8EAF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#E8EAF6',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        color: '#5B67CA',
        fontWeight: '600',
    },
    sectionContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeader: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        backgroundColor: '#FBFBFB',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
    },
    updateButton: {
        backgroundColor: '#5B67CA',
        height: 54,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#5B67CA",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20,
    },
    logoutIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    logoutTextContainer: {
        flex: 1,
    },
    logoutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E53935',
        marginBottom: 2,
    },
    logoutSubtitle: {
        fontSize: 12,
        color: '#888',
    },
});