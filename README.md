# 🍽️ Zahid Restaurant

### Restaurant App MVP — React Native + Expo | Fall 2026

Zahid Restaurant is a frontend-only mobile restaurant application built with React Native and Expo. It provides separate Customer and Manager roles using local mock data, role-based navigation, reusable contexts and reducers, and on-device persistence without a backend or external database.

## 🎥 Demo Video

[▶ Watch Demo Video](https://drive.google.com/file/d/1GqHks1CFKvqu3fVBc2bIlWKAJtnpC96P/view?usp=sharing)

## 📱 App Preview

| Customer Menu | Order Summary |
| ------------- | ------------- |
| ![Customer menu](<./screenshots/WhatsApp Image 2026-09-28 at 12.24.12 AM (2).jpeg>) | ![Order summary](<./screenshots/WhatsApp Image 2026-09-28 at 12.24.17 AM (1).jpeg>) |

| Order Tracking | Manager Dashboard |
| -------------- | ----------------- |
| ![Order tracking](<./screenshots/WhatsApp Image 2026-09-28 at 12.24.18 AM.jpeg>) | ![Manager dashboard](<./screenshots/WhatsApp Image 2026-09-28 at 12.24.21 AM.jpeg>) |

[📸 View All Screenshots](./screenshots)

## Project Overview

The academic project title is **Restaurant App MVP**, while the in-app brand is **Zahid Restaurant**. The project demonstrates authentication, menu browsing, search and filtering, cart management, checkout, order tracking, reservations, manager operations, performance techniques, and AsyncStorage persistence in one Expo application.

The application is intentionally frontend-only:

- No backend server
- No Firebase
- No external database
- No remote menu images
- No TypeScript

## Key Features

- Customer and Manager authentication with role-based navigation
- Light and dark themes shared across major screens
- 16 original menu items in four categories
- Debounced search, recent searches, filters, sorting, and favourites
- Reducer-driven cart with notes, quantities, promo codes, and live totals
- Dine-in and Takeaway checkout
- Automatic demo order progression
- Reservation validation and table matching
- Manager controls for orders, reservations, prices, and availability
- AsyncStorage restoration for orders, reservations, and manager menu changes

## Customer Features

- Combined Login and Signup screen with validation
- Exact one-second authentication simulation and loading indicator
- Menu loading, pull-to-refresh, category filters, sorting, and item count
- 400 ms debounced search with the last five unique searches
- Favourites, visible render counter, and Back to Top control
- Cart quantity controls, item removal, and special instructions
- Promo codes and checkout price breakdown
- Dine-in table selection or Takeaway pickup information
- Order tracking from Pending to Served
- Reservation form, unavailable slots, confirmation, history, and cancellation
- Customer profile, theme toggle, and logout

## Manager Features

- Incoming order list and manual status updates
- Reservation review with Accept and Decline actions
- Menu price editing and availability toggles
- Add-and-publish menu form
- Shared menu updates that immediately affect the Customer menu
- Manager profile, theme toggle, and logout

## Demo Accounts

| Role | Email | Password |
| ---- | ----- | -------- |
| Customer | customer@zahidrestaurant.com | Guest2026 |
| Manager | manager@zahidrestaurant.com | Manage2026 |

The selected role must match the account.

Available promo codes:

| Code | Discount |
| ---- | -------- |
| ZAHID10 | 10% |
| DINNER15 | 15% |

## Tech Stack

- React 19.2
- React Native 0.86
- Expo SDK 57
- JavaScript and JSX
- React Navigation 7
- React Context API
- useReducer
- AsyncStorage 2.2
- Local mock data and local PNG assets

## Project Structure

    restaurant-app-mvp/
    |-- A1/
    |   |-- SRS.pdf
    |   `-- UML/
    |-- assets/
    |   `-- menu/
    |-- screenshots/
    |-- src/
    |   |-- components/
    |   |-- context/
    |   |-- data/
    |   |-- hooks/
    |   |-- navigation/
    |   |-- reducers/
    |   |-- screens/
    |   `-- theme/
    |-- App.js
    |-- app.json
    `-- package.json

## Installation

Use Node.js 22.13 or newer for Expo SDK 57.

    cd C:\Users\LENOVO\Desktop\mad2\restaurant-app-mvp
    npm install

## Running with Expo

Start the development server:

    npx expo start

Other available commands:

    npm run android
    npm run ios
    npm run web
    npm run lint

For Expo Go, connect the phone and computer to the same network, start Expo, and scan the displayed QR code.

## Hooks Used

| Hook | Purpose |
| ---- | ------- |
| useForm | Form values, field updates, validation errors, and reset |
| useDebounce | 400 ms delayed search and reservation phone feedback |
| useReservation | Reservation validation, availability, table matching, and creation |
| useAuth | Safe access to authentication state and actions |
| useTheme | Global colors, theme mode, and theme switching |
| useCart | Cart state and reducer actions |
| useOrders | Persisted orders and order status actions |
| useRestaurant | Shared menu and reservation state |

Each context hook throws a clear error when used outside its matching provider.

## Context vs Prop Drilling

Authentication, theme, cart, orders, reservations, and menu management are used by screens in different navigation branches. Context supplies this shared state directly to the components that need it instead of passing the same props through unrelated screens.

The main disadvantage is that context updates can re-render multiple consumers. This project limits that cost by separating concerns into AuthContext, ThemeContext, CartContext, OrdersContext, and RestaurantContext and by memoizing provider values and repeated components.

## useReducer vs useState

useState is used for independent interface values such as selected filters, form controls, focus state, and loading state.

useReducer is used when multiple named actions must update related state consistently:

- cartReducer handles items, quantities, notes, promo codes, and clearing the cart
- ordersReducer handles restoration, order placement, and status updates

Reducers keep transition rules centralized and make them easier to test.

## Reducer Test Cases

| # | Action | Expected result |
| - | ------ | --------------- |
| 1 | ADD_ITEM on an empty cart | Adds one item with quantity 1 |
| 2 | ADD_ITEM for an existing item | Increases quantity without duplicating the row |
| 3 | INCREMENT | Adds one to the selected quantity |
| 4 | DECREMENT from quantity 1 | Removes the item |
| 5 | UPDATE_NOTE | Updates only the selected item's instructions |
| 6 | APPLY_PROMO | Stores the promo code and percentage |
| 7 | REMOVE_PROMO | Clears the code and discount |
| 8 | CLEAR_CART | Restores the required empty cart state |
| 9 | PLACE_ORDER | Adds the new order to the order list |
| 10 | UPDATE_STATUS | Updates only the matching order |

## Performance Optimization

- React.memo is applied to repeated menu, cart, and order-status components.
- useMemo calculates the filtered and sorted menu, subtotal, service charge, sales tax, discount, and grand total.
- useCallback keeps handlers stable when they are passed to memoized list items.
- FlatList renders the customer menu efficiently.
- MenuItemCard logs its renders for performance demonstration screenshots.

Memoization is not used for every value. For small calculations or functions that are not passed to memoized children, its overhead would provide no practical benefit.

Checkout calculation:

    subtotal
    + 5% service charge
    + 15% sales tax
    - promo discount
    = grand total

## AsyncStorage Persistence

The application restores persisted data before showing role-based navigation.

| Storage key | Data |
| ----------- | ---- |
| @zahid_restaurant/menu | Manager menu additions, prices, and availability |
| @zahid_restaurant/reservations | Reservation history and manager decisions |
| @zahid_restaurant/orders | Customer orders and status updates |

Cart and authentication remain session-based for a simple classroom demonstration.

## Customer Application Flow

    Login or Signup
        -> Customer Menu
        -> Search, Filter, Sort, or Favourite
        -> Add Items to Cart
        -> Apply Promo and Review Order
        -> Choose Dine-in or Takeaway
        -> Place Order
        -> Track Order Status

Customers can also create reservations and manage their profile/theme independently of the ordering flow.

## Manager Application Flow

    Manager Login
        -> Operations Dashboard
        -> Incoming Orders
        -> Reservations
        -> Menu Management
        -> Manager Profile

Manager changes are shared through RestaurantContext and are persisted locally.

## 📚 Assignment Documentation

- [SRS Document](./A1/SRS.pdf)
- [Use Case Diagram](./A1/UML/use-case-diagram.png)
- [Class Diagram](./A1/UML/class-diagram.png)
- [Sequence Diagram](./A1/UML/sequence-diagram.png)
- [State Machine Diagram](./A1/UML/state-machine-diagram.png)
- [Component Diagram](./A1/UML/component-diagram.png)

The academic files retain the required title **Restaurant App MVP**.

## Screenshots

The screenshots directory contains 17 real application captures. Their original WhatsApp filenames are preserved exactly as supplied.

[📸 View All Screenshots](./screenshots)

