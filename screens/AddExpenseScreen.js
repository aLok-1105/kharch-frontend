import { useContext, useState } from "react";
import { Alert, Text, TextInput, View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import Dropdown from '../components/Dropdown';
import { AuthContext } from "../store/AuthContext";
import axios from "axios";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import LoadingOverlay from "../components/LoadingOverlay";
import { RefreshContext } from "../store/RefreshContext";

import { baseUrl } from "../api/api";

export default function AddExpenseScreen({ navigation, route }) {

    const authCtx = useContext(AuthContext);
    const refreshCtx = useContext(RefreshContext);

    const data = route.params?.data;

    const [details, setDetails] = useState({
        amount: data?.amount ? data.amount.toString() : '',
        description: data?.description || '',
        category: data?.category || '',
        transactionDateTime: data?.transactionDateTime || new Date().toISOString(),
        paymentMethod: data?.paymentMethod || ''
    })

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateMode, setDateMode] = useState('date');
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
        { label: "Shopping", value: "SHOPPING", icon: 'cart-outline', color: '#F44336', bg: '#FFEBEE' },
        { label: "Utilities", value: "UTILITIES", icon: 'flash-outline', color: '#FFC107', bg: '#FFF8E1' },
        { label: "Other", value: "OTHER", icon: 'grid-outline', color: '#9E9E9E', bg: '#F5F5F5' }
    ];

    const paymentMethod = [
        { label: "Cash", value: "CASH", icon: 'cash-outline', color: '#4CAF50', bg: '#E8F5E9' },
        { label: "Credit Card", value: "CREDIT_CARD", icon: 'card-outline', color: '#2196F3', bg: '#E3F2FD' },
        { label: "Debit Card", value: "DEBIT_CARD", icon: 'card-outline', color: '#9C27B0', bg: '#F3E5F5' },
        { label: "UPI", value: "UPI", icon: 'qr-code-outline', color: '#FF9800', bg: '#FFF3E0' },
        { label: "Transfer", value: "TRANSFER", icon: 'swap-horizontal-outline', color: '#5B67CA', bg: '#E8EAF6' },
        { label: "Other", value: "OTHER", icon: 'wallet-outline', color: '#9E9E9E', bg: '#F5F5F5' }
    ];

    function getLocalDateTime(localDateTime) {
        if (localDateTime) {
            const dateObj = new Date(localDateTime);
            const offset = dateObj.getTimezoneOffset() * 60000;
            localDateTime = new Date(dateObj.getTime() - offset).toISOString().slice(0, -1);
        }

        return localDateTime;
    }

    async function submitHandler() {
        setIsSubmitting(true);
        try {
            await axios.post(`${baseUrl}/api/transaction`, {
                amount: details.amount,
                description: details.description,
                category: details.category,
                transactionDateTime: getLocalDateTime(details.transactionDateTime),
                paymentMethod: details.paymentMethod
            },
                {
                    headers: {
                        Authorization: 'Bearer ' + authCtx.token
                    }
                }
            );

            Alert.alert("Expense added", "Expense added successfully", [
                { text: "Ok", onPress: () => { navigation.navigate("AllExpense") } }
            ]);

        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to add expense");
            setIsSubmitting(false);
        }
        refreshCtx.triggerRefresh();
    }

    const formatDateTimeForDisplay = (isoString) => {
        if (!isoString) return 'Select Date & Time';
        const d = new Date(isoString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ', ' +
            d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    const renderLeftIcon = (iconName, color, bgColor) => () => (
        <View style={[styles.dropdownIconBox, { backgroundColor: bgColor }]}>
            <Ionicons name={iconName} size={16} color={color} />
        </View>
    );

    const handleDateChange = (event, selectedDate) => {
        if (selectedDate) {
            textChangeHandler("transactionDateTime", selectedDate.toISOString());
            if (dateMode === 'date') {
                setDateMode('time');
            } else {
                setShowDatePicker(false);
            }
        } else {
            setShowDatePicker(false);
        }
    };

    const recentCategories = [
        { id: '1', name: 'Groceries', icon: 'cart-outline', color: '#F44336', bg: '#FFEBEE', value: 'SHOPPING' },
        { id: '2', name: 'Food', icon: 'fast-food-outline', color: '#FF9800', bg: '#FFF3E0', value: 'FOOD' },
        { id: '3', name: 'Fuel', icon: 'water-outline', color: '#4CAF50', bg: '#E8F5E9', value: 'TRANSPORT' },
        { id: '4', name: 'Transport', icon: 'bus-outline', color: '#9C27B0', bg: '#F3E5F5', value: 'TRANSPORT' },
        { id: '5', name: 'Bills', icon: 'flash-outline', color: '#2196F3', bg: '#E3F2FD', value: 'UTILITIES' },
        { id: '6', name: 'More', icon: 'ellipsis-horizontal', color: '#666', bg: '#F5F5F5', value: 'OTHER' },
    ];

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

    function onBackPress() {
        navigation.navigate('AllExpense');
    }

    async function deleteHandler(transactionId) {
        setIsSubmitting(true);
        try {
            await axios.delete(`${baseUrl}/api/transaction/${transactionId} `, {
                headers: {
                    Authorization: 'Bearer ' + authCtx.token
                }
            });
            Alert.alert("Expense deleted", "Expense deleted successfully", [
                { text: "Ok", onPress: () => { navigation.navigate('AllExpense'); } }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to delete expense");
            setIsSubmitting(false);
        }
        refreshCtx.triggerRefresh();
    }

    async function updateHandler() {
        setIsSubmitting(true);
        try {
            await axios.put(`${baseUrl}/api/transaction/${data.transaction_Id}`, {
                amount: details.amount,
                description: details.description,
                category: details.category,
                transactionDateTime: getLocalDateTime(details.transactionDateTime),
                paymentMethod: details.paymentMethod
            }, {
                headers: {
                    Authorization: 'Bearer ' + authCtx.token
                }
            })
            Alert.alert("Expense updated", "Expense updated successfully", [
                { text: "Ok", onPress: () => { navigation.navigate('AllExpense'); } }
            ]);
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to update expense");
            setIsSubmitting(false);
        }
        refreshCtx.triggerRefresh();
    }



    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Add Expense</Text>
                    <Text style={styles.headerSubtitle}>Track your spending</Text>
                </View>
                <TouchableOpacity style={styles.headerRightIcon}>
                    <Ionicons name="receipt-outline" size={20} color="#5B67CA" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formCard}>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount</Text>
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
                                numberOfLines={3}
                                maxLength={150}
                                textAlignVertical="top"
                            />
                            <Text style={styles.charCount}>{details.description.length}/150</Text>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Payment Method</Text>
                        <Dropdown
                            style={styles.customDropdown}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            onChange={(item) => textChangeHandler("paymentMethod", item.value)}
                            value={details.paymentMethod}
                            data={paymentMethod}
                            labelField="label"
                            valueField="value"
                            placeholder="Select payment method"
                            renderLeftIcon={renderLeftIcon('card-outline', '#4CAF50', '#E8F5E9')}
                            renderItem={renderDropdownItem}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Transaction Date & Time</Text>
                        <TouchableOpacity
                            style={styles.datePickerTrigger}
                            onPress={() => {
                                setDateMode('date');
                                setShowDatePicker(true);
                            }}
                        >
                            <View style={[styles.dropdownIconBox, { backgroundColor: '#F5F5F5' }]}>
                                <Ionicons name="calendar-outline" size={16} color="#5B67CA" />
                            </View>
                            <Text style={styles.datePickerText}>
                                {formatDateTimeForDisplay(details.transactionDateTime)}
                            </Text>
                            <Ionicons name="chevron-down-outline" size={20} color="#999" />
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={new Date(details.transactionDateTime)}
                                mode={dateMode}
                                is24Hour={false}
                                onChange={handleDateChange}
                            />
                        )}
                    </View>

                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                        {
                            data &&
                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: '#f71212ff' }, isSubmitting && { opacity: 0.7 }]}
                                onPress={deleteHandler.bind(this, data.transaction_Id)}
                                disabled={isSubmitting}
                            >
                                <Ionicons name="trash-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.saveBtnText}>Delete </Text>
                            </TouchableOpacity>

                        }
                        <TouchableOpacity
                            style={[styles.saveBtn, data ? { width: '49%' } : { width: '100%' }, isSubmitting && { opacity: 0.7 }]}
                            onPress={data ? updateHandler : submitHandler}
                            disabled={isSubmitting}
                        >
                            <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.saveBtnText}>{data ? "Update" : "Save Expense"} </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Categories */}
                <View style={styles.recentCategoriesContainer}>
                    <View style={styles.recentHeader}>
                        <Text style={styles.recentTitle}>Recent Categories</Text>
                        {/* <TouchableOpacity>
                            <Text style={styles.manageText}>Manage</Text>
                        </TouchableOpacity> */}
                    </View>

                    <View style={styles.categoriesGrid}>
                        {recentCategories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.categoryItem}
                                onPress={() => textChangeHandler("category", cat.value)}
                            >
                                <View style={[styles.catIconBox, { backgroundColor: cat.bg }]}>
                                    <Ionicons name={cat.icon} size={24} color={cat.color} />
                                </View>
                                <Text style={styles.catLabel}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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
        minHeight: 100,
    },
    textArea: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        minHeight: 60,
    },
    charCount: {
        fontSize: 11,
        color: '#999',
        textAlign: 'right',
        marginTop: 5,
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
    saveBtn: {
        padding: 8,
        width: '48%',
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
        fontSize: 14,
        fontWeight: '600',
    },
    recentCategoriesContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 2,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    recentTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    manageText: {
        fontSize: 12,
        color: '#5B67CA',
        fontWeight: '600',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        alignItems: 'center',
        width: '16%',
        marginBottom: 10,
    },
    catIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    catLabel: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
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