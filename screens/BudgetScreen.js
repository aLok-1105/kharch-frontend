import { useContext, useState, useCallback, useEffect } from "react";
import { Alert, FlatList, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { AuthContext } from "../store/AuthContext";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import Header from "../components/Header";
import { useFocusEffect } from '@react-navigation/native';
import SmallDropdown from "../components/SmallDropdown";
import NoDisplay from "../components/NoDisplay";
import LoadingOverlay from "../components/LoadingOverlay";
import { RefreshContext } from "../store/RefreshContext";
import { baseUrl } from '../api/api'

export default function BudgetScreen({ navigation }) {

    const [budget, setBudget] = useState([]);
    const [activeTab, setActiveTab] = useState('Active Budgets');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const authCtx = useContext(AuthContext);
    const refreshCtx = useContext(RefreshContext);


    async function getBudget() {
        setIsLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/api/budget`,
                {
                    headers: {
                        Authorization: 'Bearer ' + authCtx.token
                    }
                }
            );
            setBudget(response.data);

        } catch (error) {
            Alert.alert("Error", error.message)
            console.log(error);
            console.log("Error fetching expenses");
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        getBudget();
    }, [refreshCtx.refreshCnt]);

    // useFocusEffect(
    //     useCallback(() => {
    //         async function getExpenses() {
    //             setIsLoading(true);
    //             try {
    //                 const response = await axios.get('${baseUrl}/api/budget',
    //                     {
    //                         headers: {
    //                             Authorization: 'Bearer ' + authCtx.token
    //                         }
    //                     }
    //                 );
    //                 setBudget(response.data);

    //             } catch (error) {
    //                 Alert.alert("Error", error.message)
    //                 console.log(error);
    //                 console.log("Error fetching expenses");
    //             } finally {
    //                 setIsLoading(false);
    //             }
    //         }
    //         getExpenses();

    //     }, [refresh, authCtx.token])
    // );

    const totalBudget = budget.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const totalSpend = budget.reduce((sum, b) => sum + (parseFloat(b.spend) || 0), 0);
    const totalRemaining = totalBudget - totalSpend;

    const getCategoryIcon = (category) => {
        switch (category?.toUpperCase()) {
            case 'FOOD': return { name: 'fast-food-outline', color: '#FF9800', bg: '#FFF3E0', progress: ['#FFE0B2', '#FFB74D', '#F57C00', '#E65100'] };
            case 'TRANSPORT': return { name: 'water-outline', color: '#2196F3', bg: '#E3F2FD', progress: ['#BBDEFB', '#42A5F5', '#1976D2', '#0D47A1'] };
            case 'HOUSING': return { name: 'home-outline', color: '#4CAF50', bg: '#E8F5E9', progress: ['#C8E6C9', '#66BB6A', '#388E3C', '#1B5E20'] };
            case 'SHOPPING': return { name: 'cart-outline', color: '#F44336', bg: '#FFEBEE', progress: ['#FFCDD2', '#EF5350', '#D32F2F', '#B71C1C'] };
            case 'UTILITIES': return { name: 'flash-outline', color: '#FFC107', bg: '#FFF8E1', progress: ['#FFECB3', '#FFCA28', '#FFA000', '#FF6F00'] };
            case 'HEALTHCARE': return { name: 'medkit-outline', color: '#F44336', bg: '#FFEBEE', progress: ['#FFCDD2', '#EF5350', '#D32F2F', '#B71C1C'] };
            case 'ENTERTAINMENT': return { name: 'film-outline', color: '#9C27B0', bg: '#F3E5F5', progress: ['#E1BEE7', '#AB47BC', '#7B1FA2', '#4A148C'] };
            default: return { name: 'wallet-outline', color: '#5B67CA', bg: '#E8EAF6', progress: ['#C5CAE9', '#5B67CA', '#3949AB', '#1A237E'] };
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
    }

    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        return Math.round((e - s) / (1000 * 60 * 60 * 24));
    }

    const calculateDaysLeft = (end) => {
        if (!end) return 0;
        const today = new Date();
        const e = new Date(end);
        const diff = Math.round((e - today) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    }

    const filteredBudgets = budget.filter(b => activeTab === 'Active Budgets' ? b.active : true);

    const formatCurrency = (val) => {
        return Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const renderBudgetItem = ({ item, index }) => {
        const iconData = getCategoryIcon(item.category);
        const displayCategory = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase() : 'Budget';

        const budgetAmount = parseFloat(item.amount) || 0;
        const spendAmount = parseFloat(item.spend) || 0;
        const percentage = budgetAmount > 0 ? (spendAmount / budgetAmount) * 100 : 0;
        const clampedPercentage = Math.min(percentage, 100);

        const days = calculateDays(item.startDate, item.endDate);
        const daysLeft = calculateDaysLeft(item.endDate);

        // Adjust formatting for budgetPeriod (e.g., 'MONTHLY' -> 'Monthly')
        const displayPeriod = item.period ? item.period.charAt(0).toUpperCase() + item.period.slice(1).toLowerCase() : 'Custom';

        const getProgressColor = (percent, colors) => {
            if (percent <= 25) return colors[0];
            if (percent <= 50) return colors[1];
            if (percent <= 80) return colors[2];
            return colors[3];
        };

        const currentColor = getProgressColor(percentage, iconData.progress);

        function handleEditClick(item) {
            // console.log("Budget ID:", budgetId);
            setOpenDropdownId(null)
            navigation.navigate('AddBudget', { data: item });
            setRefresh(!refresh)
        }

        async function handleDeleteClick(budgetId) {
            try {
                await axios.delete(`${baseUrl}/api/budget/${budgetId}`, {
                    headers: {
                        Authorization: 'Bearer ' + authCtx.token
                    }
                });
                Alert.alert("Success", "Budget deleted successfully");
                setOpenDropdownId(null);
                setRefresh(!refresh);
            } catch (error) {
                console.log("Delete error:", error);
                Alert.alert("Error", "Failed to delete budget");
            }
            refreshCtx.triggerRefresh();
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <View style={[styles.iconBox, { backgroundColor: iconData.bg }]}>
                            <Ionicons name={iconData.name} size={24} color={iconData.color} />
                        </View>
                        <View style={styles.cardTitleContainer}>
                            <Text style={styles.cardTitle}>{displayCategory}</Text>
                            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                        </View>
                    </View>
                    <View style={styles.cardHeaderRight}>
                        {item.active && (
                            <View style={styles.activePill}>
                                <Text style={styles.activeText}>Active</Text>
                            </View>
                        )}
                        <TouchableOpacity onPress={() => setOpenDropdownId(openDropdownId === index ? null : index)}>
                            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                        </TouchableOpacity>

                        {openDropdownId === index && (
                            <View style={styles.dropdownMenu}>
                                <TouchableOpacity style={styles.dropdownItem} onPress={handleEditClick.bind(this, item)}>
                                    <Ionicons name="pencil-outline" size={16} color="#333" />
                                    <Text style={styles.dropdownText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.dropdownItem} onPress={handleDeleteClick.bind(this, item.budgetId)}>
                                    <Ionicons name="trash-outline" size={16} color="#E53935" />
                                    <Text style={[styles.dropdownText, { color: '#E53935' }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>


                <View style={styles.amountsRow}>
                    <Text style={styles.spentText}>₹ {formatCurrency(spendAmount)} spent</Text>
                    <Text style={styles.totalText}>₹ {formatCurrency(budgetAmount)}</Text>
                </View>

                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${clampedPercentage}%`, backgroundColor: currentColor }]} />
                </View>

                <View style={styles.progressTextRow}>
                    <Text style={[styles.progressText, { color: currentColor }]}>{Math.round(percentage)}% of budget used</Text>
                    <Text style={styles.daysLeftText}>{daysLeft} days left</Text>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCol}>
                        <Ionicons name="calendar-outline" size={14} color="#666" />
                        <View style={styles.statInfo}>
                            <Text style={styles.statValue}>{formatDate(item.startDate)}</Text>
                            <Text style={styles.statLabel}>Start Date</Text>
                        </View>
                    </View>
                    <View style={styles.statCol}>
                        <Ionicons name="calendar-outline" size={14} color="#666" />
                        <View style={styles.statInfo}>
                            <Text style={styles.statValue}>{formatDate(item.endDate)}</Text>
                            <Text style={styles.statLabel}>End Date</Text>
                        </View>
                    </View>
                    <View style={styles.statCol}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <View style={styles.statInfo}>
                            <Text style={styles.statValue}>{displayPeriod == 'Other' ? 'Custom' : displayPeriod}</Text>
                            <Text style={styles.statLabel}>Period</Text>
                        </View>
                    </View>
                    <View style={styles.statCol}>
                        <Ionicons name="today-outline" size={14} color="#666" />
                        <View style={styles.statInfo}>
                            <Text style={styles.statValue}>{days} Days</Text>
                            <Text style={styles.statLabel}>Days</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    const listHeader = (
        <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryIconBox}>
                    <Ionicons name="wallet-outline" size={24} color="#4CAF50" />
                </View>

                <View style={styles.summaryCol}>
                    <Text style={styles.summaryLabel}>Total Budget</Text>
                    <Text style={styles.summaryValue}>₹ {formatCurrency(totalBudget)}</Text>
                </View>

                <View style={styles.summarySeparator} />

                <View style={styles.summaryCol}>
                    <Text style={styles.summaryLabel}>Total Spend</Text>
                    <Text style={[styles.summaryValue, { color: '#E53935' }]}>₹ {formatCurrency(totalSpend)}</Text>
                </View>

                <View style={styles.summarySeparator} />

                <View style={styles.summaryCol}>
                    <Text style={styles.summaryLabel}>Remaining</Text>
                    <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>₹ {formatCurrency(totalRemaining)}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>{activeTab}</Text>
        </>
    );

    const listFooter = (
        <View style={styles.tipCard}>
            <View style={styles.tipIconBox}>
                <Ionicons name="bulb-outline" size={20} color="#5B67CA" />
            </View>
            <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Budget Tip</Text>
                <Text style={styles.tipText}>You're doing great! Try to keep your spending within your budget limits.</Text>
            </View>
        </View>
    );

    if (isLoading && budget.length === 0) {
        return <LoadingOverlay message="Loading budgets..." />;
    }

    return (
        <View style={styles.container}>
            <Header title="Budgets" subtitle="Track every budget. Build a better you." icon="add" color="#000000" size={24} onPress={() => { navigation.navigate('AddBudget') }} />
            {
                budget.length === 0 ? (
                    <NoDisplay message="No budgets found" subMessage="Click on the + icon to create your first budget." />
                ) :
                    (
                        <View>
                            {/* Tabs */}
                            <View style={styles.tabsContainer}>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'Active Budgets' && styles.activeTab]}
                                    onPress={() => setActiveTab('Active Budgets')}
                                >
                                    <Text style={[styles.tabText, activeTab === 'Active Budgets' && styles.activeTabText]}>Active Budgets</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'All Budgets' && styles.activeTab]}
                                    onPress={() => setActiveTab('All Budgets')}
                                >
                                    <Text style={[styles.tabText, activeTab === 'All Budgets' && styles.activeTabText]}>All Budgets</Text>
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={filteredBudgets}
                                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                                renderItem={renderBudgetItem}
                                ListHeaderComponent={listHeader}
                                // ListFooterComponent={listFooter}
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
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#5B67CA',
    },
    tabText: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#5B67CA',
        fontWeight: '600',
    },
    listContent: {
        padding: 20,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 20,
    },
    summaryIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    summaryCol: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    summaryLabel: {
        fontSize: 9,
        color: '#888',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    summarySeparator: {
        width: 1,
        height: 30,
        backgroundColor: '#EAEAEA',
        marginHorizontal: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        flex: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTitleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 11,
        color: '#888',
        lineHeight: 16,
        paddingRight: 10,
    },
    cardHeaderRight: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    activePill: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 10,
    },
    activeText: {
        fontSize: 10,
        color: '#4CAF50',
        fontWeight: '600',
    },
    amountsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    spentText: {
        fontSize: 12,
        color: '#444',
        fontWeight: '600',
    },
    totalText: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '700',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 30,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    progressText: {
        fontSize: 10,
        fontWeight: '600',
    },
    daysLeftText: {
        fontSize: 10,
        color: '#888',
    },
    statsGrid: {
        flexDirection: 'row',
        borderTopWidth: 1,
        alignItems: 'center',
        justifyContent: "space-between",
        borderTopColor: '#F0F0F0',
        paddingTop: 15,
    },
    statCol: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statInfo: {
        marginLeft: 6,
    },
    statValue: {
        fontSize: 10,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 8,
        color: '#888',
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#F4F5FB',
        borderRadius: 16,
        padding: 16,
        marginTop: 5,
        marginBottom: 20,
    },
    tipIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8EAF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tipContent: {
        flex: 1,
        justifyContent: 'center',
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5B67CA',
        marginBottom: 4,
    },
    tipText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 25,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 10,
        minWidth: 110,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    dropdownText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 10,
        fontWeight: '500',
    }
});