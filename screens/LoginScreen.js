import { useContext, useState } from "react";
import { Alert, Text, TextInput, View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { AuthContext } from "../store/AuthContext";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import { UserDetailsContext } from "../store/UserDetailsContext";
import LoadingOverlay from "../components/LoadingOverlay";
import { baseUrl } from '../api/api'

export default function LoginScreen({ navigation }) {
    const authCtx = useContext(AuthContext);
    const userDetailsCtx = useContext(UserDetailsContext);

    const [details, setDetails] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false);

    const [isAuthenticating, setIsAuthenticating] = useState(false);

    function textChangeHandler(fieldName, enteredText) {
        setDetails((currVal) => {
            return {
                ...currVal,
                [fieldName]: enteredText,
            }
        })
    }

    async function submitHandler() {
        if (!details.email || !details.password) {
            Alert.alert("Invalid Input", "Please enter your email and password");
            return;
        }
        setIsAuthenticating(true);
        try {
            const response = await axios.post(`${baseUrl}/api/user/login`, details);
            Alert.alert("Success", "You have been successfully logged in.");
            authCtx.authenticate(response.data.token);

            userDetailsCtx.updateUserDetails({
                fullName: response.data.fullName,
                email: response.data.email
            });
        } catch (error) {
            console.log(error);

            Alert.alert("Error", error.response?.data || "Login failed. Please check your credentials.");
            setIsAuthenticating(false);
        }

        refreshCtx.triggerRefresh();
    }

    function registerHandler() {
        navigation.navigate('Register');
    }

    if (isAuthenticating) {
        return <LoadingOverlay message="Logging you in..." />;
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBackground}>
                                <Ionicons name="wallet" size={40} color="#FFFFFF" />
                            </View>
                        </View>
                        <Text style={styles.title}>Welcome Back!</Text>
                        <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
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
                                editable={!isAuthenticating}
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
                                    placeholder="Enter your password"
                                    placeholderTextColor="#AAA"
                                    onChangeText={textChangeHandler.bind(this, "password")}
                                    value={details.password}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    editable={!isAuthenticating}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={isAuthenticating}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* <TouchableOpacity style={styles.forgotPassword} disabled={isAuthenticating}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity> */}

                        <TouchableOpacity
                            style={[styles.submitButton, isAuthenticating && { opacity: 0.7 }]}
                            onPress={submitHandler}
                            disabled={isAuthenticating}
                        >
                            <Text style={styles.submitButtonText}>Login</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={registerHandler} disabled={isAuthenticating}>
                            <Text style={styles.footerLink}>Sign up</Text>
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
        marginTop: 40
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
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
        paddingHorizontal: 20,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 13,
        color: '#5B67CA',
        fontWeight: '600',
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