import { useContext, useState, useCallback, useEffect } from "react";
import { Alert, SectionList, Text, View, StyleSheet, TextInput, TouchableOpacity, Pressable, ScrollView } from "react-native";
import { AuthContext } from "../store/AuthContext";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import Header from "../components/Header";
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import SmallDropdown from "../components/SmallDropdown";
import NoDisplay from "../components/NoDisplay";
import LoadingOverlay from "../components/LoadingOverlay";
import { RefreshContext } from "../store/RefreshContext";
import { DatePickerModal } from 'react-native-paper-dates';
import { baseUrl } from "../api/api";

export default function AllExpenseScreen({ navigation }) {

    const [expense, setExpense] = useState([]);
    const [totalSpending, setTotalSpending] = useState();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [filteredDate, setFilteredDate] = useState(null);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [range, setRange] = useState({ startDate: undefined, endDate: undefined });


    const authCtx = useContext(AuthContext);
    const refreshCtx = useContext(RefreshContext);

    const today = (new Date()).toISOString();

    const fetchExpenses = useCallback(async (query = '') => {
        setIsLoading(true);
        try {
            let url = `${baseUrl}/api/transaction`;
            if (query.trim().length > 0) {
                url += `/search?query=${query}`;
            }
            const response = await axios.get(url,
                {
                    headers: {
                        Authorization: 'Bearer ' + authCtx.token
                    }
                }
            );
            setExpense(response.data);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch expenses");
        } finally {
            setIsLoading(false);
        }

    }, [authCtx.token]);

    useEffect(() => {
        fetchExpenses(searchQuery)
    }, [refreshCtx.refreshCnt, searchQuery]);

    // useFocusEffect(
    //     useCallback(() => {
    //         fetchExpenses(searchQuery);
    //     }, [fetchExpenses, searchQuery])
    // );

    useEffect(() => {
        const spendingByDate = {};

        expense.forEach(t => {
            if (t.transactionDateTime) {
                const amount = parseFloat(t.amount || 0);
                const dateKey = t.transactionDateTime.split('T')[0];
                spendingByDate[dateKey] = (spendingByDate[dateKey] || 0) + amount;
            }
        });

        setTotalSpending(spendingByDate);

    }, [expense]);

    const groupExpensesByDate = (expenses) => {
        const groups = expenses.reduce((acc, expense) => {
            const dateStr = expense.transactionDateTime ? expense.transactionDateTime.split('T')[0] : 'Unknown Date';
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(expense);
            return acc;
        }, {});

        const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

        return sortedDates.map(date => {
            return {
                title: formatDateTitle(date),
                data: groups[date]
            };
        });
    };

    const formatDateTitle = (dateStr) => {
        if (dateStr === 'Unknown Date') return dateStr;
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-GB', options);

        if (isToday) return `Today, ${formattedDate}`;
        if (isYesterday) return `Yesterday, ${formattedDate}`;
        return formattedDate;
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'FOOD': return { name: 'fast-food-outline', color: '#FF9800', bg: '#FFF3E0' };
            case 'TRANSPORT': return { name: 'bus-outline', color: '#2196F3', bg: '#E3F2FD' };
            case 'HOUSING': return { name: 'home-outline', color: '#4CAF50', bg: '#E8F5E9' };
            case 'SHOPPING': return { name: 'cart-outline', color: '#E91E63', bg: '#FCE4EC' };
            case 'UTILITIES': return { name: 'flash-outline', color: '#FFC107', bg: '#FFF8E1' };
            case 'HEALTHCARE': return { name: 'medkit-outline', color: '#F44336', bg: '#FFEBEE' };
            case 'ENTERTAINMENT': return { name: 'film-outline', color: '#9C27B0', bg: '#F3E5F5' };
            default: return { name: 'receipt-outline', color: '#9E9E9E', bg: '#F5F5F5' };
        }
    }
    const formatToISTDate = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const filteredExpense = expense.filter(item => {
        return (range.startDate == null || item.transactionDateTime.split("T")[0] >= formatToISTDate(range.startDate))
            && (range.endDate == null || item.transactionDateTime.split("T")[0] <= formatToISTDate(range.endDate))
            && (filterCategory == "ALL" || filterCategory == item.category)
            && (filterPaymentMethod == "ALL" || filterPaymentMethod == item.paymentMethod);
    });

    const sections = groupExpensesByDate(filteredExpense);
    const totalExpenses = filteredExpense.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);

    const renderExpenseItem = ({ item }) => {
        const iconData = getCategoryIcon(item.category);
        let timeStr = '';
        if (item.transactionDateTime) {
            const d = new Date(item.transactionDateTime);
            timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Format category name for display
        const displayCategory = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase() : 'Expense';

        return (
            <Pressable style={[({ pressed }) => ({
                opacity: pressed ? 0.1 : 1,
            }), { borderRadius: 16, overflow: 'hidden', marginBottom: 10 }]}
                onPress={() => { navigation.navigate('AddExpense', { data: item }); }}>
                <View style={styles.expenseCard}>
                    <View style={[styles.iconContainer, { backgroundColor: iconData.bg }]}>
                        <Ionicons name={iconData.name} size={24} color={iconData.color} />
                    </View>
                    <View style={styles.expenseDetails}>
                        <Text style={styles.expenseTitle}>{displayCategory}</Text>
                        <Text style={styles.expenseDescription}>{item.description}</Text>
                    </View>
                    <View style={styles.expenseRight}>
                        <Text style={styles.expenseAmount}>₹ {parseFloat(item.amount).toFixed(2)}</Text>
                        <View style={styles.paymentMethod}>
                            <Ionicons name="card-outline" size={10} color="#888" />
                            <Text style={styles.paymentMethodText}>{item.paymentMethod.replaceAll('_', ' ')}</Text>
                        </View>
                        {timeStr ? <Text style={styles.expenseTime}>{timeStr}</Text> : null}
                    </View>
                </View>
            </Pressable>
        );
    };

    function openDatePicker() {
        setShowDatePicker(true);
    }

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFilteredDate(selectedDate.toISOString());
        }
    };

    const category = [
        { label: 'All Categories', value: 'ALL' },
        { label: 'Food', value: 'FOOD' },
        { label: 'Transport', value: 'TRANSPORT' },
        { label: 'Housing', value: 'HOUSING' },
        { label: 'Shopping', value: 'SHOPPING' },
        { label: 'Utilities', value: 'UTILITIES' },
        { label: 'Healthcare', value: 'HEALTHCARE' },
        { label: 'Entertainment', value: 'ENTERTAINMENT' },
        { label: 'Other', value: 'OTHER' },
    ];

    const paymentMethods = [
        { label: 'All Methods', value: 'ALL' },
        { label: 'Credit Card', value: 'CREDIT_CARD' },
        { label: 'Debit Card', value: 'DEBIT_CARD' },
        { label: 'Cash', value: 'CASH' },
        { label: 'UPI', value: 'UPI' },
        { label: 'Transfer', value: 'TRANSFER' },
        { label: 'Other', value: 'OTHER' },
    ];

    function searchQueryHandler(enteredText) {
        setSearchQuery(enteredText);
    }



    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            fetchExpenses();
            return;
        }

        const identifier = setTimeout(() => {
            fetchExpenses(searchQuery);
        }, 500);

        return () => {
            clearTimeout(identifier);
        };
    }, [searchQuery, fetchExpenses]);

    const onConfirm = useCallback(
        ({ startDate, endDate }) => {
            setShowDatePicker(false);
            setRange({ startDate: startDate, endDate: endDate });
        },

        [setShowDatePicker, setRange]
    );

    if (isLoading && expense.length === 0) {
        return <LoadingOverlay message="Loading expenses..." />;
    }

    function dateRange() {
        const start = formatToISTDate(range.startDate);
        const end = formatToISTDate(range.endDate);
        return `${start.split("T")[0].substring(5)} - ${end.split("T")[0].substring(5)}`;
    }

    return (
        <View style={styles.container}>
            {/* Header Content */}
            <Header title="All Expenses" subtitle="Track every expense. Build a better you." icon="add" color="#000000" size={24} onPress={() => { navigation.navigate('AddExpense') }} />
            {
                expense.length === 0 ? (
                    <NoDisplay message="No Expenses Yet" subMessage="Track every expense. Build a better you." />
                )
                    :
                    (
                        <View style={{ flex: 1 }}>
                            <View style={styles.header}>
                                <View style={styles.searchContainer}>
                                    <Ionicons name="search-outline" size={20} color="#888" />
                                    <TextInput
                                        onChangeText={searchQueryHandler}
                                        value={searchQuery}
                                        style={styles.searchInput}
                                        placeholder="Search expenses..."
                                        placeholderTextColor="#888"
                                        editable={!isLoading}
                                    />
                                </View>

                                <ScrollView horizontal={true} style={{ width: '100%' }} showsHorizontalScrollIndicator={false}>
                                    <View style={styles.filtersContainer}>
                                        <TouchableOpacity style={styles.filterPill} onPress={openDatePicker}>
                                            <Ionicons name="calendar-outline" size={14} color="#5B67CA" />
                                            <Text style={styles.filterText}>{(range.startDate) ? dateRange() : "All Dates"}</Text>
                                            <Ionicons name="chevron-down-outline" size={12} color="#666" />
                                        </TouchableOpacity>

                                        <View style={styles.filterPill}>
                                            <Ionicons name="shield-checkmark-outline" size={14} color="#5B67CA" />
                                            <SmallDropdown
                                                style={{ width: 100, height: 20 }}
                                                placeholderStyle={{ color: '#333', fontSize: 10, marginLeft: 4 }}
                                                selectedTextStyle={{ color: '#333', fontSize: 10, marginLeft: 4 }}
                                                iconStyle={{ tintColor: '#666', width: 16, height: 16 }}
                                                data={category}
                                                labelField="label"
                                                valueField="value"
                                                placeholder="Category"
                                                value={filterCategory}
                                                onChange={(item) => setFilterCategory(item.value)}
                                                renderItem={(item) => (
                                                    <View style={{ padding: 10, backgroundColor: filterCategory === item.value ? '#E8EAF6' : '#FFF' }}>
                                                        <Text style={{ fontSize: 11, color: filterCategory === item.value ? '#5b67caff' : '#333', fontWeight: filterCategory === item.value ? '600' : '400' }}>
                                                            {item.label}
                                                        </Text>
                                                    </View>
                                                )}
                                            />
                                        </View>

                                        <View style={styles.filterPill}>
                                            <Ionicons name="card-outline" size={14} color="#5B67CA" />
                                            <SmallDropdown
                                                style={{ width: 90, height: 20 }}
                                                placeholderStyle={{ color: '#333', fontSize: 10, marginLeft: 4 }}
                                                selectedTextStyle={{ color: '#333', fontSize: 10, marginLeft: 4 }}
                                                iconStyle={{ tintColor: '#666', width: 16, height: 16 }}
                                                data={paymentMethods}
                                                labelField="label"
                                                valueField="value"
                                                placeholder="Payment"
                                                value={filterPaymentMethod}
                                                onChange={(item) => setFilterPaymentMethod(item.value)}
                                                renderItem={(item) => (
                                                    <View style={{ padding: 10, backgroundColor: filterPaymentMethod === item.value ? '#E8EAF6' : '#FFF' }}>
                                                        <Text style={{ fontSize: 11, color: filterPaymentMethod === item.value ? '#5b67caff' : '#333', fontWeight: filterPaymentMethod === item.value ? '600' : '400' }}>
                                                            {item.label}
                                                        </Text>
                                                    </View>
                                                )}
                                            />
                                        </View>
                                    </View>
                                </ScrollView>

                                {showDatePicker && (
                                    <DatePickerModal
                                        locale="en-GB"
                                        mode="range"
                                        visible={showDatePicker}
                                        onConfirm={onConfirm}
                                        onDismiss={() => setShowDatePicker(false)}
                                        startDate={range.startDate}
                                        endDate={range.endDate}
                                    />
                                    // <DateTimePicker

                                    //     testID="dateTimePicker"
                                    //     value={new Date()}
                                    //     mode="date"
                                    //     onChange={handleDateChange}
                                    //     maximumDate={new Date()}
                                    //     timeZoneName={'Asia/Kolkata'}
                                    // />
                                )}

                                <View style={styles.totalCard}>
                                    <View style={styles.totalCardLeft}>
                                        <View style={styles.totalIconContainer}>
                                            <Ionicons name="wallet-outline" size={24} color="#5B67CA" />
                                        </View>
                                        <View style={styles.totalTextContainer}>
                                            <Text style={styles.totalLabel}>Total Expenses</Text>
                                            <Text style={styles.totalAmount}>₹ {Number(totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                        </View>
                                    </View>
                                    {/* <View style={styles.totalStats}>
                                        <View style={styles.statPill}>
                                            <Ionicons name="arrow-down-outline" size={12} color="#E53935" />
                                            <Text style={styles.statText}>12.6%</Text>
                                        </View>
                                        <Text style={styles.statSubText}>vs last month</Text>
                                    </View> */}
                                </View>
                            </View>


                            <SectionList
                                sections={sections}
                                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                                renderItem={renderExpenseItem}
                                renderSectionHeader={({ section: { title } }) => (
                                    <Text style={styles.sectionHeader}>{title}</Text>
                                )}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 5,
        backgroundColor: '#F8F9FA',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 45,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    filtersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    filterPill: {

        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        marginRight: 5,
    },
    filterText: {
        fontSize: 10,
        color: '#333',
        marginHorizontal: 4,
    },
    totalCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F4F5FB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
    },
    totalCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalIconContainer: {
        backgroundColor: '#FFFFFF',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    totalTextContainer: {
        justifyContent: 'center',
    },
    totalLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    totalStats: {
        alignItems: 'flex-end',
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    statText: {
        fontSize: 12,
        color: '#E53935',
        fontWeight: '600',
        marginLeft: 2,
    },
    statSubText: {
        fontSize: 10,
        color: '#888',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#777',
        marginTop: 15,
        marginBottom: 10,
    },
    expenseCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    expenseDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    expenseTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    expenseDescription: {
        fontSize: 13,
        color: '#888',
    },
    expenseRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    expenseAmount: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E53935',
        marginBottom: 4,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    paymentMethodText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 4,
    },
    expenseTime: {
        fontSize: 11,
        color: '#AAA',
    }
});