import { useState } from "react";
import { Alert, Text, TextInput, View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import LoadingOverlay from "../components/LoadingOverlay";
import { baseUrl } from '../api/api'
export default function RegisterScreen({ navigation }) {

    const [details, setDetails] = useState({
        fullName: '',
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    function textChangeHandler(fieldName, enteredText) {
        setDetails((currVal) => {
            return {
                ...currVal,
                [fieldName]: enteredText,
            }
        })
    }

    async function submitHandler() {
        if (!details.fullName || !details.email || !details.password) {
            Alert.alert("Invalid Input", "Please fill all fields");
            return;
        }
        setIsRegistering(true);
        try {
            const response = await axios.post(`${baseUrl}/api/user/register`, details);
            Alert.alert("Success", "Your email id " + response.data + " has been registered");
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert("Error", error.response?.data || "Registration failed");
            setIsRegistering(false);
        }
    }

    function loginHandler() {
        navigation.navigate('Login');
    }

    if (isRegistering) {
        return <LoadingOverlay message="Creating your account..." />;
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBackground}>
                                <Ionicons name="wallet" size={40} color="#FFFFFF" />
                            </View>
                        </View>
                        <Text style={styles.title}>Create your account</Text>
                        <Text style={styles.subtitle}>Join us and take control of your expenses</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Ionicons name="person-outline" size={18} color="#5B67CA" />
                                <Text style={styles.label}>Full Name</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#AAA"
                                onChangeText={textChangeHandler.bind(this, "fullName")}
                                value={details.fullName}
                                editable={!isRegistering}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Ionicons name="mail-outline" size={18} color="#5B67CA" />
                                <Text style={styles.label}>Email Address</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email address"
                                placeholderTextColor="#AAA"
                                onChangeText={textChangeHandler.bind(this, "email")}
                                value={details.email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isRegistering}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Ionicons name="lock-closed-outline" size={18} color="#5B67CA" />
                                <Text style={styles.label}>Password</Text>
                            </View>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={[styles.input, { flex: 1, borderBottomWidth: 0, marginBottom: 0 }]}
                                    placeholder="Create a password"
                                    placeholderTextColor="#AAA"
                                    onChangeText={textChangeHandler.bind(this, "password")}
                                    value={details.password}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    editable={!isRegistering}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={isRegistering}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.hintContainer}>
                            <Ionicons name="shield-checkmark-outline" size={14} color="#5B67CA" />
                            <Text style={styles.hintText}>Use at least 8 characters with a mix of letters, numbers and symbols</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, isRegistering && { opacity: 0.7 }]}
                            onPress={submitHandler}
                            disabled={isRegistering}
                        >
                            <Text style={styles.submitButtonText}>Create Account</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-google" size={20} color="#DB4437" />
                                <Text style={styles.socialButtonText}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={20} color="#000000" />
                                <Text style={styles.socialButtonText}>Apple</Text>
                            </TouchableOpacity>
                        </View> */}
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={loginHandler} disabled={isRegistering}>
                            <Text style={styles.footerLink}>Log in</Text>
                        </TouchableOpacity>
                    </View>
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
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 60,
        marginTop: 40,
    },
    backButton: {
        marginTop: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#5B67CA",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        marginBottom: 20,
    },
    logoBackground: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 20,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 8,
    },
    input: {
        height: 54,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#1A1A1A',
        backgroundColor: '#FFFFFF',
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
    },
    eyeIcon: {
        padding: 15,
    },
    hintContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    hintText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 8,
        flex: 1,
        lineHeight: 18,
    },
    submitButton: {
        backgroundColor: '#5B67CA',
        height: 58,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#5B67CA",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#EAEAEA',
    },
    dividerText: {
        fontSize: 12,
        color: '#AAA',
        marginHorizontal: 12,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        height: 54,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 6,
        backgroundColor: '#FFFFFF',
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    footerLink: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5B67CA',
    },
});