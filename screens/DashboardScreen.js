import React, { useContext, useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from "../store/AuthContext";
import axios from "axios";
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import Dropdown from "../components/Dropdown";
import SmallDropdown from "../components/SmallDropdown";
import Header from "../components/Header";
import { UserDetailsContext } from "../store/UserDetailsContext";
import NoDisplay from "../components/NoDisplay";
import LoadingOverlay from "../components/LoadingOverlay";
import { RefreshContext } from "../store/RefreshContext";
import { baseUrl } from '../api/api'

export default function DashboardScreen({ navigation }) {
    const [transactions, setTransactions] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [lastMonthSpending, setLastMonthSpending] = useState(0);
    const [thisMonthSpending, setThisMonthSpending] = useState(0);
    const [totalSpending, setTotalSpending] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const authCtx = useContext(AuthContext);
    const userDetailsCtx = useContext(UserDetailsContext);
    const refreshCtx = useContext(RefreshContext);

    async function getDashboardData() {
        setIsLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/api/transaction`, {
                headers: { Authorization: 'Bearer ' + authCtx.token }
            });
            const sorted = response.data.sort((a, b) => new Date(b.transactionDateTime) - new Date(a.transactionDateTime));
            setTransactions(sorted);
        } catch (error) {
            console.log("Error fetching transactions", error);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        getDashboardData();
    }, [refreshCtx.refreshCnt]);

    // useFocusEffect(
    //     useCallback(() => {
    //         async function getDashboardData() {
    //             setIsLoading(true);
    //             try {
    //                 const response = await axios.get('${baseUrl}/api/transaction', {
    //                     headers: { Authorization: 'Bearer ' + authCtx.token }
    //                 });
    //                 const sorted = response.data.sort((a, b) => new Date(b.transactionDateTime) - new Date(a.transactionDateTime));
    //                 setTransactions(sorted);
    //             } catch (error) {
    //                 console.log("Error fetching transactions", error);
    //             } finally {
    //                 setIsLoading(false);
    //             }
    //         }
    //         getDashboardData();



    //     }, [authCtx.token])
    // );

    // Calculations
    let totalExpenses = 0;
    const categoryTotals = {};
    let highestDayAmount = 0;
    let highestDayDate = null;
    let transactionCount = 0;
    const dailyTotals = {};

    const today = new Date();

    const getStartOfWeek = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(date.setDate(diff));
    };

    const startOfCurrentWeek = getStartOfWeek(today);
    startOfCurrentWeek.setHours(0, 0, 0, 0);
    const endOfCurrentWeek = new Date(startOfCurrentWeek);
    endOfCurrentWeek.setDate(endOfCurrentWeek.getDate() + 6);
    endOfCurrentWeek.setHours(23, 59, 59, 999);

    const currentWeekSpending = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun

    transactions.forEach(t => {

        if (!t.transactionDateTime) return;
        const d = new Date(t.transactionDateTime);

        let include = false;

        // const offset = date.getTimezoneOffset() * 60000;
        // const d = new Date(date.getTime() - offset);

        const amount = parseFloat(t.amount) || 0;

        // Track spending for the current week bar chart
        if (d >= startOfCurrentWeek && d <= endOfCurrentWeek) {
            let dayIndex = d.getDay() - 1;
            if (dayIndex === -1) dayIndex = 6; // Sunday
            currentWeekSpending[dayIndex] += amount;
        }

        if (selectedPeriod === 'today') {
            include = d.toDateString() === today.toDateString();
        } else if (selectedPeriod === 'week') {
            include = d >= startOfCurrentWeek;
        } else if (selectedPeriod === 'month') {
            include = d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        } else if (selectedPeriod === 'lastMonth') {
            let lastMonth = today.getMonth() - 1;
            let year = today.getFullYear();
            if (lastMonth < 0) {
                lastMonth = 11;
                year--;
            }
            include = d.getMonth() === lastMonth && d.getFullYear() === year;
        } else if (selectedPeriod === 'year') {
            include = d.getFullYear() === today.getFullYear();
        }

        if (include) {
            totalExpenses += amount;
            transactionCount++;

            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;

            const dateStr = d.toISOString().split('T')[0];
            dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + amount;
        }

    });

    useEffect(() => {
        let lastMonthAcc = 0;
        let thisMonthAcc = 0;
        const spendingByDate = {};

        transactions.forEach(t => {
            if (t.transactionDateTime) {
                // const d = new Date(t.transactionDateTime);
                // const thisMonth = d.getMonth();
                const amount = parseFloat(t.amount || 0);

                // if (thisMonth === today.getMonth() - 1) {
                //     lastMonthAcc += amount;
                // } else if (thisMonth === today.getMonth()) {
                //     thisMonthAcc += amount;
                // }

                const dateKey = t.transactionDateTime.split('T')[0];
                spendingByDate[dateKey] = (spendingByDate[dateKey] || 0) + amount;
            }
        });

        // setLastMonthSpending(lastMonthAcc);
        // setThisMonthSpending(thisMonthAcc);
        setTotalSpending(spendingByDate);

    }, [transactions]);

    // useEffect(() => {
    //     if (totalSpending) {
    //         console.log("total Spending", totalSpending);
    //     }
    // }, [totalSpending]);

    const maxWeeklySpending = Math.max(...currentWeekSpending);
    const weeklySpendingHeights = currentWeekSpending.map(amount => maxWeeklySpending > 0 ? (amount / maxWeeklySpending) * 100 : 0);


    for (const [date, amount] of Object.entries(dailyTotals)) {
        if (amount > highestDayAmount) {
            highestDayAmount = amount;
            highestDayDate = date;
        }
    }

    let divisor = 1;
    if (selectedPeriod === 'today') divisor = 1;
    else if (selectedPeriod === 'week') divisor = today.getDay() === 0 ? 7 : today.getDay();
    else if (selectedPeriod === 'month') divisor = today.getDate();
    else if (selectedPeriod === 'lastMonth') divisor = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    else if (selectedPeriod === 'year') divisor = Math.ceil((today - new Date(today.getFullYear(), 0, 1)) / 86400000);

    const dailyAverage = divisor > 0 ? (totalExpenses / divisor) : 0;

    const categoryData = Object.keys(categoryTotals).map(k => ({
        category: k,
        amount: categoryTotals[k],
        percentage: totalExpenses > 0 ? ((categoryTotals[k] / totalExpenses) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    const getCategoryIcon = (category) => {
        switch (category?.toUpperCase()) {
            case 'FOOD': return { name: 'fast-food-outline', color: '#FF9800', bg: '#FFF3E0', hex: '#FF9800' };
            case 'TRANSPORT': return { name: 'bus-outline', color: '#2196F3', bg: '#E3F2FD', hex: '#2196F3' };
            case 'HOUSING': return { name: 'home-outline', color: '#4CAF50', bg: '#E8F5E9', hex: '#4CAF50' };
            case 'SHOPPING': return { name: 'cart-outline', color: '#E91E63', bg: '#FCE4EC', hex: '#E91E63' };
            case 'UTILITIES': return { name: 'flash-outline', color: '#FFC107', bg: '#FFF8E1', hex: '#FFC107' };
            case 'HEALTHCARE': return { name: 'medkit-outline', color: '#F44336', bg: '#FFEBEE', hex: '#F44336' };
            case 'ENTERTAINMENT': return { name: 'film-outline', color: '#9C27B0', bg: '#F3E5F5', hex: '#9C27B0' };
            default: return { name: 'receipt-outline', color: '#5B67CA', bg: '#E8EAF6', hex: '#5B67CA' };
        }
    }

    const formatCurrency = (val) => {
        return Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayTotal = dailyTotals[todayDateStr] || 0;

    const period = [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'Last Month', value: 'lastMonth' },
        { label: 'This Year', value: 'year' }
    ];

    if (isLoading) {
        return <LoadingOverlay message="Fetching your data..." />;
    }

    return (
        <View style={styles.container}>

            <Header title={`Hi, ${userDetailsCtx?.fullName} 👋`} subtitle="Track every expense. Build a better you." icon="notifications-outline" size={22} color="#1A1A1A" />
            {/* Future
                <TouchableOpacity style={styles.notifButton}>
                    <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
            <View style={styles.notifDot} />
        </TouchableOpacity> */}

            {
                transactions.length === 0 ?
                    <NoDisplay message="No transactions yet!" subMessage="Add your first transaction to get started" />
                    :
                    (
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                            {/* Total Expenses Card */}
                            <View style={styles.totalCard}>
                                <View style={styles.totalCardTop}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.totalCardTitle}>Total Expenses</Text>
                                    </View>
                                    <View style={styles.monthPill}>
                                        <Ionicons name="calendar-outline" size={12} color="#FFF" />
                                        <SmallDropdown
                                            style={{ width: 110, height: 20 }}
                                            placeholderStyle={{ color: '#FFF', fontSize: 12, fontWeight: '600', marginLeft: 6 }}
                                            selectedTextStyle={{ color: '#FFF', fontSize: 12, fontWeight: '600', marginLeft: 6 }}
                                            iconStyle={{ tintColor: '#ffffffff', width: 14, height: 14 }}
                                            data={period}
                                            labelField="label"
                                            valueField="value"
                                            placeholder="Select"
                                            value={selectedPeriod}
                                            onChange={(item) => setSelectedPeriod(item.value)}
                                            renderItem={(item) => (
                                                <View style={styles.monthPill}>
                                                    <Text style={{ fontSize: 13, color: selectedPeriod === item.value ? '#5b67caff' : '#333', fontWeight: selectedPeriod === item.value ? '600' : '400' }}>
                                                        {item.label}
                                                    </Text>
                                                </View>
                                            )}
                                        />
                                    </View>
                                </View>

                                <View style={styles.amountContainer}>
                                    <Text style={styles.currency}>₹</Text>
                                    <Text style={styles.amount}>{formatCurrency(totalExpenses)}</Text>
                                </View>

                                {/* <View style={styles.trendContainer}>
                        <View style={styles.trendPill}>
                            <Ionicons name="arrow-up-outline" size={12} color="#E53935" />
                            <Text style={styles.trendText}>{((thisMonthSpending - lastMonthSpending) * 100 / lastMonthSpending).toFixed(2)}%</Text>
                        </View>
                        <Text style={styles.trendSubtext}>vs last month</Text>
                    </View> */}

                                <View style={styles.totalStatsGrid}>
                                    <View style={styles.totalStatCol}>
                                        <View style={styles.totalStatIcon}><Ionicons name="scale-outline" size={14} color="#5B67CA" /></View>
                                        <View>
                                            <Text style={styles.totalStatLabel}>Daily Average</Text>
                                            <Text style={styles.totalStatValue}>₹ {dailyAverage.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.totalStatCol}>
                                        <View style={styles.totalStatIcon}><Ionicons name="trending-up-outline" size={14} color="#5B67CA" /></View>
                                        <View>
                                            <Text style={styles.totalStatLabel}>Highest Day</Text>
                                            <Text style={styles.totalStatValue}>₹ {highestDayAmount.toFixed(0)}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.totalStatCol}>
                                        <View style={styles.totalStatIcon}><Ionicons name="receipt-outline" size={14} color="#5B67CA" /></View>
                                        <View>
                                            <Text style={styles.totalStatLabel}>Transactions</Text>
                                            <Text style={styles.totalStatValue}>{transactionCount}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Quick Actions */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Quick Actions</Text>
                                <View style={styles.quickActionsGrid}>
                                    <TouchableOpacity style={styles.quickActionBox} onPress={() => navigation.navigate("Expenses", { screen: 'AddExpense' })}>
                                        <View style={[styles.qaIconBg, { backgroundColor: '#FFEBEE' }]}><Ionicons name="add-outline" size={24} color="#E53935" /></View>
                                        <Text style={styles.qaText}>Add Expense</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.quickActionBox} onPress={() => navigation.navigate("Budget")}>
                                        <View style={[styles.qaIconBg, { backgroundColor: '#E3F2FD' }]}><Ionicons name="bar-chart-outline" size={24} color="#1E88E5" /></View>
                                        <Text style={styles.qaText}>Analytics</Text>
                                    </TouchableOpacity>
                                    {/* <TouchableOpacity style={styles.quickActionBox} onPress={() => navigation.navigate("Budget")}>
                            <View style={[styles.qaIconBg, { backgroundColor: '#F3E5F5' }]}><Ionicons name="diamond-outline" size={24} color="#8E24AA" /></View>
                            <Text style={styles.qaText}>Categories</Text>
                        </TouchableOpacity> */}
                                    <TouchableOpacity style={styles.quickActionBox}>
                                        <View style={[styles.qaIconBg, { backgroundColor: '#E8F5E9' }]}><Ionicons name="calendar-outline" size={24} color="#43A047" /></View>
                                        <Text style={styles.qaText}>View Calendar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Spending by Category */}
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Spending by Category</Text>
                                    {/* <TouchableOpacity style={styles.smallPill}>
                            <Text style={styles.smallPillText}>This Month</Text>
                            <Ionicons name="chevron-down-outline" size={12} color="#666" />
                        </TouchableOpacity> */}
                                </View>

                                <View style={styles.categoryContent}>
                                    <View style={styles.categoryList}>
                                        {categoryData.slice(0, 5).map((cat, index) => {
                                            const icon = getCategoryIcon(cat.category);
                                            const displayCat = cat.category.charAt(0).toUpperCase() + cat.category.slice(1).toLowerCase();
                                            return (
                                                <View key={index} style={styles.catRow}>
                                                    <View style={[styles.catIcon, { backgroundColor: icon.bg }]}>
                                                        <Ionicons name={icon.name} size={16} color={icon.color} />
                                                    </View>
                                                    <View style={styles.catDetails}>
                                                        <View style={styles.catTextRow}>
                                                            <Text style={styles.catName}>{displayCat}</Text>
                                                            <Text style={styles.catAmount}>₹ {cat.amount.toFixed(0)}</Text>
                                                        </View>
                                                        <View style={styles.catProgressBg}>
                                                            <View style={[styles.catProgressFill, { backgroundColor: icon.hex, width: `${Math.min(cat.percentage, 100)}%` }]} />
                                                        </View>
                                                    </View>
                                                    <Text style={styles.catPercent}>{cat.percentage.toFixed(0)}%</Text>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </View>
                                {/* <TouchableOpacity style={styles.viewFullBtn}>
                        <Ionicons name="pie-chart-outline" size={16} color="#5B67CA" />
                        <Text style={styles.viewFullText}>View full breakdown</Text>
                        <Ionicons name="chevron-forward-outline" size={16} color="#5B67CA" />
                    </TouchableOpacity> */}
                            </View>

                            {/* Split Row: Recent Transactions & Daily Spending */}
                            <View style={styles.splitRow}>
                                {/* Recent Transactions */}
                                <View style={[styles.card, styles.halfCard]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Recent</Text>
                                        <TouchableOpacity onPress={() => { navigation.navigate("Expenses", { screen: "AllExpenses" }) }}><Text style={styles.linkText}>View All</Text></TouchableOpacity>
                                    </View>
                                    <View style={styles.recentList}>
                                        {transactions.slice(0, 5).map((t, index) => {
                                            const icon = getCategoryIcon(t.category);
                                            const displayCat = t.category ? t.category.charAt(0).toUpperCase() + t.category.slice(1).toLowerCase() : 'Expense';

                                            let timeStr = '';
                                            if (t.transactionDateTime) {
                                                const d = new Date(t.transactionDateTime);
                                                const isToday = new Date().toDateString() === d.toDateString();
                                                timeStr = (isToday ? 'Today, ' : '') + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            }

                                            return (
                                                <View key={index} style={styles.recentItem}>
                                                    <View style={[styles.recentIcon, { backgroundColor: icon.bg }]}>
                                                        <Ionicons name={icon.name} size={14} color={icon.color} />
                                                    </View>
                                                    <View style={styles.recentInfo}>
                                                        <Text style={styles.recentName} numberOfLines={1}>{displayCat}</Text>
                                                        <Text style={styles.recentTime}>{timeStr}</Text>
                                                    </View>
                                                    <Text style={styles.recentAmount}>₹{parseFloat(t.amount).toFixed(0)}</Text>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </View>

                                {/* Daily Spending */}
                                <View style={[styles.card, styles.halfCard]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Daily Spending</Text>
                                        <TouchableOpacity style={styles.smallPill}>
                                            <Text style={styles.smallPillText}>Week</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.dailyTotalAmount}>₹ {formatCurrency(todayTotal)}</Text>
                                    {/* <Text style={styles.trendSubtextDark}><Text style={styles.trendTextDark}>↑ 8.3%</Text> vs last week</Text> */}

                                    <View style={styles.barChartContainer}>
                                        {['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                                            const heights = weeklySpendingHeights;
                                            return (
                                                <View key={idx} style={styles.barCol}>
                                                    <View style={styles.barBg}>
                                                        <View style={[styles.barFill, { height: `${heights[idx]}%` }]} />
                                                    </View>
                                                    <Text style={styles.barLabel}>{day}</Text>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </View>
                            </View>

                            {/* Insights Card */}
                            {/* <View style={styles.insightsCard}>
                    <View style={styles.insightIconBox}>
                        <Ionicons name="bulb-outline" size={24} color="#FFF" />
                    </View>
                    <View style={styles.insightContent}>
                        <Text style={styles.insightTitle}>Insights for you</Text>
                        <Text style={styles.insightText}>Your spending on {categoryData[0]?.category ? categoryData[0].category.charAt(0).toUpperCase() + categoryData[0].category.slice(1).toLowerCase() : 'Food'} is higher this month. Try setting a budget!</Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={20} color="#5B67CA" />
                </View> */}

                        </ScrollView >
                    )
            }
        </View >
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
        marginTop: 25,
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    totalCard: {
        backgroundColor: '#5B67CA',
        borderRadius: 24,
        padding: 20,
        marginBottom: 25,
        shadowColor: "#5B67CA",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    totalCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    totalCardTitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    monthPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    monthPillText: {
        color: '#FFF',
        fontSize: 12,
        marginHorizontal: 4,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    currency: {
        fontSize: 40,
        color: '#FFF',
        marginTop: 0,
        marginRight: 4,
    },
    amount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFF',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    trendPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
    },
    trendText: {
        color: '#E53935',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    trendTextDark: {
        color: '#E53935',
        fontSize: 11,
        fontWeight: 'bold',
    },
    trendSubtext: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    trendSubtextDark: {
        color: '#888',
        fontSize: 11,
        marginBottom: 15,
    },
    totalStatsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 15,
    },
    totalStatCol: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalStatIcon: {
        width: 25,
        height: 25,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    totalStatLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 2,
    },
    totalStatValue: {
        fontSize: 11,
        color: '#FFF',
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 15,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickActionBox: {
        alignItems: 'center',
        width: '23%',
    },
    qaIconBg: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    qaText: {
        fontSize: 11,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    smallPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    smallPillText: {
        fontSize: 10,
        color: '#666',
        marginRight: 2,
    },
    categoryContent: {
        marginTop: 5,
    },
    categoryList: {
        marginBottom: 10,
    },
    catRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    catIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    catDetails: {
        flex: 1,
        marginRight: 12,
    },
    catTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    catName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    catAmount: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    catProgressBg: {
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
    },
    catProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    catPercent: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
        width: 35,
        textAlign: 'right',
    },
    viewFullBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    viewFullText: {
        color: '#5B67CA',
        fontSize: 13,
        fontWeight: '600',
        marginHorizontal: 8,
    },
    splitRow: {
        flexDirection: 'col',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    halfCard: {
        width: '100%',
        marginBottom: 20,
        padding: 12,
    },
    cardTitleSmall: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    linkText: {
        fontSize: 11,
        color: '#5B67CA',
        fontWeight: '600',
    },
    recentList: {
        flex: 1,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    recentIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    recentInfo: {
        flex: 1,
    },
    recentName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    recentTime: {
        fontSize: 9,
        color: '#888',
    },
    recentAmount: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#E53935',
    },
    dailyTotalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    barChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 100,
        marginTop: 5,
        marginLeft: 10,
        marginRight: 10,
    },
    barCol: {
        alignItems: 'center',
        width: 20,
    },
    barBg: {
        height: 80,
        width: 20,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        justifyContent: 'flex-end',
        marginBottom: 5,
    },
    barFill: {
        width: '100%',
        backgroundColor: '#5B67CA',
        borderRadius: 3,
    },
    barLabel: {
        fontSize: 8,
        color: '#888',
    },
    insightsCard: {
        flexDirection: 'row',
        backgroundColor: '#E8EAF6',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D8DCEF',
    },
    insightIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    insightContent: {
        flex: 1,
        paddingRight: 10,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    insightText: {
        fontSize: 12,
        color: '#555',
        lineHeight: 18,
    }
});