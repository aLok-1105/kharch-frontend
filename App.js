import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import AuthContextProvider, { AuthContext } from './store/AuthContext';
import DashboardScreen from './screens/DashboardScreen';
import AllExpenseScreen from './screens/AllExpenseScreen';
import BudgetScreen from './screens/BudgetScreen';
import ProfileScreen from './screens/ProfileScreen';
import { useContext } from 'react';
import AddExpenseScreen from './screens/AddExpenseScreen';
import AddBudgetScreen from './screens/AddBudgetScreen';
import UserDetailsContextProvider from './store/UserDetailsContext';
import RefreshContextProvider from './store/RefreshContext';
import { Provider as PaperProvider } from 'react-native-paper';
import { enGB, registerTranslation } from 'react-native-paper-dates'
registerTranslation('en-GB', enGB)

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Expenses() {
  return (
    <Stack.Navigator >
      <Stack.Screen name="AllExpense" component={AllExpenseScreen} options={
        ({ navigation }) => ({
          headerRight: () => (
            <Ionicons name="add" size={24} color="black" onPress={() => navigation.navigate('AddExpense')} />
          ),
          headerShown: false
        })
      } />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}
function BudgetTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} >
      <Stack.Screen name="BudgetScreen" component={BudgetScreen} options={
        ({ navigation }) => ({
          headerRight: () => (
            <Ionicons name="add" size={24} color="black" onPress={() => navigation.navigate('AddBudget')} />
          )
        },
          { headerShown: false }
        )

      } />
      <Stack.Screen name="AddBudget" component={AddBudgetScreen} />
    </Stack.Navigator>
  )
}

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}
  >
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#5B67CA',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#5B67CA',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 4,
      borderColor: '#F8F9FA'
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

function ExpenseApp() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: 75,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#5B67CA',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={Expenses}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} size={24} color={color} />
          )
        }}
      />

      {/* <Tab.Screen
        name="AddAction"
        component={View}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <Ionicons name="add" size={25} color="#FFFFFF" />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          )
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Transactions', { screen: 'AddExpense' });
          }
        })}
      /> */}

      <Tab.Screen
        name="Budget"
        component={BudgetTab}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "wallet" : "wallet-outline"} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator >
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}


function Navigation() {
  const authCtx = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <NavigationContainer >
        {authCtx.isAuthenticated ? <ExpenseApp /> : <AuthStack />}
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <>
      <SafeAreaProvider>
        <PaperProvider>
          <RefreshContextProvider>
            <AuthContextProvider>
              <UserDetailsContextProvider>
                <StatusBar style="dark" />
                <Navigation />
              </UserDetailsContextProvider>
            </AuthContextProvider>
          </RefreshContextProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
