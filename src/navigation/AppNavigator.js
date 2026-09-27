import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/CartScreen';
import LoginScreen from '../screens/LoginScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import MenuScreen from '../screens/MenuScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReservationScreen from '../screens/ReservationScreen';
import LoadingView from '../components/LoadingView';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const symbols = {
  Menu: '◈',
  Cart: '▱',
  Reserve: '◫',
  Orders: '◎',
  Profile: '●',
  Dashboard: '◆',
};

function TabSymbol({ name, color }) {
  return <Text style={{ color, fontSize: 20, fontWeight: '900' }}>{symbols[name]}</Text>;
}

function CartStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '900' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Checkout' }} />
    </Stack.Navigator>
  );
}

function CustomerTabs() {
  const { colors } = useTheme();
  const { itemCount } = useCart();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 70,
          paddingTop: 7,
          paddingBottom: 9,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
        tabBarIcon: ({ color }) => <TabSymbol name={route.name === 'CartRoot' ? 'Cart' : route.name} color={color} />,
      })}
    >
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen
        name="CartRoot"
        component={CartStack}
        options={{
          title: 'Cart',
          tabBarBadge: itemCount || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, color: '#FFFFFF', fontSize: 9 },
        }}
      />
      <Tab.Screen name="Reserve" component={ReservationScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function ManagerTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 70,
          paddingTop: 7,
          paddingBottom: 9,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
        tabBarIcon: ({ color }) => <TabSymbol name={route.name} color={color} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={ManagerDashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  const { isRestoring: restaurantRestoring } = useRestaurant();
  const { isRestoring: ordersRestoring } = useOrders();
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '900' },
    },
  };

  if (restaurantRestoring || ordersRestoring) return <LoadingView label="Restoring Zahid Restaurant data…" />;

  return (
    <NavigationContainer theme={navigationTheme}>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : user.role === 'Manager' ? <ManagerTabs /> : <CustomerTabs />}
    </NavigationContainer>
  );
}
