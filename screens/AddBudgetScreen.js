import { useContext, useState } from "react";
import { Alert, Text, TextInput, View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Switch } from "react-native";
import Dropdown from '../components/Dropdown';
import { AuthContext } from "../store/AuthContext";
import axios from "axios";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { RefreshContext } from "../store/RefreshContext";
import { baseUrl } from "../api/api";

export default function AddBudgetScreen({ route }) {

    const navigation = useNavigation();
    const data = route.params?.data;

    const authCtx = useContext(AuthContext);
    const refreshCtx = useContext(RefreshContext);

    const [details, setDetails] = useState({
        amount: data?.amount ? data.amount.toString() : '',
        description: data?.description || '',
        category: data?.category || '',
        period: data?.budgetPeriod || data?.period || '',
        active: data?.active ?? true,
        startDate: data?.startDate || new Date().toISOString(),
        days: data?.days ? data.days.toString() : ''
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function textChangeHandler(fieldName, enteredText) {
        setDetails((currVal) => {
            return {
                ...currVal,
                [fieldName]: enteredText,
            }
        })
    }

    const category = [
        { label: "Food", value: "FOOD", icon: 'fast-food-outline', color: '#FF9800', bg: '#FFF3E0' },
        { label: "Transport", value: "TRANSPORT", icon: 'bus-outline', color: '#2196F3', bg: '#E3F2FD' },
        { label: "Housing", value: "HOUSING", icon: 'home-outline', color: '#4CAF50', bg: '#E8F5E9' },
        { label: "Entertainment", value: "ENTERTAINMENT", icon: 'film-outline', color: '#9C27B0', bg: '#F3E5F5' },
        { label: "Healthcare", value: "HEALTHCARE", icon: 'medkit-outline', color: '#F44336', bg: '#FFEBEE' },
        { label: "Shopping", value: "SHOPPING", icon: 'cart-outline', color: '#E91E63', bg: '#FCE4EC' },
        { label: "Utilities", value: "UTILITIES", icon: 'flash-outline', color: '#FFC107', bg: '#FFF8E1' },
        { label: "Other", value: "OTHER", icon: 'grid-outline', color: '#9E9E9E', bg: '#F5F5F5' }
    ];

    const period = [
        { label: "Daily", value: "DAILY", icon: "calendar-outline", color: "#4CAF50", bg: "#E8F5E9" },
        { label: "Weekly", value: "WEEKLY", icon: "calendar-outline", color: "#2196F3", bg: "#E3F2FD" },
        { label: "Monthly", value: "MONTHLY", icon: "calendar-outline", color: "#9C27B0", bg: "#F3E5F5" },
        { label: "Yearly", value: "YEARLY", icon: "calendar-outline", color: "#FF9800", bg: "#FFF3E0" },
        { label: "Custom", value: "OTHER", icon: "options-outline", color: "#666", bg: "#F5F5F5" },
    ];

    async function submitHandler() {
        let localDate = details.startDate;
        if (localDate) {
            const dateObj = new Date(localDate);
            const offset = dateObj.getTimezoneOffset() * 60000;
            localDate = new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
        }

        setIsSubmitting(true);
        try {
            await axios.post(`${baseUrl}/api/budget`, {
                amount: details.amount,
                category: details.category,
                description: details.description,
                period: details.period,
                active: details.active,
                startDate: localDate,
                days: parseInt(details.days)
            },
                {
                    headers: {
                        Authorization: 'Bearer ' + authCtx.token
                    }
                }
            );


            Alert.alert("Budget created", "Budget created successfully", [
                { text: "Ok", onPress: () => { navigation.navigate("BudgetScreen") } }
            ]);

        } catch (error) {
            console.log("Error", error);
            Alert.alert("Error", "Budget not created");
            setIsSubmitting(false);
        }
        refreshCtx.triggerRefresh();
    }

    async function updateHandler() {
        let localDate = details.startDate;
        if (localDate) {
            const dateObj = new Date(localDate);
            const offset = dateObj.getTimezoneOffset() * 60000;
            localDate = new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
        }
        setIsSubmitting(true);
        try {
            await axios.put(`${baseUrl}/api/budget/${data.budgetId}`, {
                amount: details.amount,
                description: details.description,
                period: details.period,
                startDate: localDate,
                days: parseInt(details.days),
                active: details.active,
            }, {
                headers: {
                    Authorization: 'Bearer ' + authCtx.token
                }
            })

            Alert.alert("Budget updated", "Budget updated successfully", [
                { text: "Ok", onPress: () => { navigation.navigate("BudgetScreen") } }
            ]);
        } catch (error) {
            Alert.alert("Error", "Budget not updated");
            setIsSubmitting(false);
        }
        refreshCtx.triggerRefresh();
    }



    const formatDateTimeForDisplay = (isoString) => {
        if (!isoString) return 'Select Date';
        const d = new Date(isoString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const renderLeftIcon = (iconName, color, bgColor) => () => (
        <View style={[styles.dropdownIconBox, { backgroundColor: bgColor }]}>
            <Ionicons name={iconName} size={16} color={color} />
        </View>
    );

    const renderDropdownItem = (item) => {
        return (
            <View style={styles.dropdownItem}>
                {item.icon && (
                    <View style={[styles.dropdownItemIconBox, { backgroundColor: item.bg || '#F5F5F5' }]}>
                        <Ionicons name={item.icon} size={16} color={item.color || '#666'} />
                    </View>
                )}
                <Text style={styles.dropdownItemText}>{item.label}</Text>
            </View>
        );
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            textChangeHandler("startDate", selectedDate.toISOString());
        }
    };



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Add Budget</Text>
                    <Text style={styles.headerSubtitle}>Plan your finances</Text>
                </View>
                <TouchableOpacity style={styles.headerRightIcon}>
                    <Ionicons name="wallet-outline" size={20} color="#5B67CA" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formCard}>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Budget Amount</Text>
                        <View style={[styles.amountInputContainer, details.amount ? styles.amountInputContainerActive : null]}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                placeholderTextColor="#999"
                                onChangeText={textChangeHandler.bind(this, "amount")}
                                value={details.amount}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Enter description (optional)"
                                placeholderTextColor="#999"
                                onChangeText={textChangeHandler.bind(this, "description")}
                                value={details.description}
                                multiline={true}
                                numberOfLines={2}
                                maxLength={100}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                    {
                        !data &&
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category</Text>
                            <Dropdown
                                style={styles.customDropdown}
                                placeholderStyle={styles.dropdownPlaceholder}
                                selectedTextStyle={styles.dropdownSelectedText}
                                onChange={(item) => textChangeHandler("category", item.value)}
                                value={details.category}
                                data={category}
                                labelField="label"
                                valueField="value"
                                placeholder="Select category"
                                renderLeftIcon={renderLeftIcon('grid-outline', '#5B67CA', '#E8EAF6')}
                                renderItem={renderDropdownItem}
                            />
                        </View>
                    }

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Budget Period</Text>
                        <Dropdown
                            style={styles.customDropdown}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            onChange={(item) => textChangeHandler("period", item.value)}
                            value={details.period}
                            data={period}
                            labelField="label"
                            valueField="value"
                            placeholder="Select period"
                            renderLeftIcon={renderLeftIcon('time-outline', '#4CAF50', '#E8F5E9')}
                            renderItem={renderDropdownItem}
                        />
                    </View>

                    {details.period === "OTHER" && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Number of Days</Text>
                            <View style={styles.inputContainer}>
                                <View style={[styles.dropdownIconBox, { backgroundColor: '#F5F5F5' }]}>
                                    <Ionicons name="calculator-outline" size={16} color="#666" />
                                </View>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. 14"
                                    placeholderTextColor="#999"
                                    onChangeText={textChangeHandler.bind(this, "days")}
                                    value={details.days}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity
                            style={styles.datePickerTrigger}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <View style={[styles.dropdownIconBox, { backgroundColor: '#F5F5F5' }]}>
                                <Ionicons name="calendar-outline" size={16} color="#5B67CA" />
                            </View>
                            <Text style={styles.datePickerText}>
                                {formatDateTimeForDisplay(details.startDate)}
                            </Text>
                            <Ionicons name="chevron-down-outline" size={20} color="#999" />
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={details.startDate ? new Date(details.startDate) : new Date()}
                                mode="date"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>

                    <View style={styles.switchRow}>
                        <View style={styles.switchTextContainer}>
                            <Text style={styles.switchLabel}>Active Budget</Text>
                            <Text style={styles.switchSubLabel}>This budget will be tracked immediately</Text>
                        </View>
                        <Switch
                            value={details.active}
                            onValueChange={(value) => textChangeHandler("active", value)}
                            trackColor={{ false: "#EAEAEA", true: "#5B67CA" }}
                            thumbColor={Platform.OS === 'ios' ? undefined : "#FFFFFF"}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
                        onPress={data ? updateHandler : submitHandler}
                        disabled={isSubmitting}
                    >
                        <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.saveBtnText}>{data ? "Update Budget" : "Save Budget"}</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 20,
        backgroundColor: '#F8F9FA',
        marginTop: 40
    },
    backButton: {
        padding: 5,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    headerRightIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#E8EAF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 55,
        backgroundColor: '#FAFAFA',
    },
    amountInputContainerActive: {
        borderColor: '#5B67CA',
        backgroundColor: '#FFFFFF',
    },
    currencySymbol: {
        fontSize: 22,
        color: '#333',
        marginRight: 10,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        color: '#333',
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        backgroundColor: '#FAFAFA',
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginLeft: 10,
    },
    customDropdown: {
        height: 50,
        borderColor: '#EAEAEA',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#FAFAFA',
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: '#999',
        marginLeft: 10,
    },
    dropdownSelectedText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 10,
    },
    dropdownIconBox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textAreaContainer: {
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        padding: 15,
        minHeight: 80,
    },
    textArea: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        minHeight: 40,
    },
    datePickerTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#FAFAFA',
    },
    datePickerText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginLeft: 10,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginBottom: 10,
    },
    switchTextContainer: {
        flex: 1,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    switchSubLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    saveBtn: {
        flexDirection: 'row',
        backgroundColor: '#5B67CA',
        height: 55,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    dropdownItem: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownItemIconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    }
});