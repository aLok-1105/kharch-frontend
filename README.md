# Kharch - Finance & Budget Management App

Kharch is a comprehensive React Native application built with Expo designed to help users manage their finances effectively. It provides tools for tracking expenses, setting budgets, and visualizing spending habits over time.

> **Note**: This is the frontend repository. The backend is built with Spring Boot and PostgreSQL, and can be found here: [Kharch Backend](https://github.com/aLok-1105/kharch-backend).

## Features

- **Dashboard**: Get a quick overview of your financial status, including daily and weekly spending visualizations.
- **Expense Tracking**: Easily add, edit, and categorize your expenses. View all your transactions in a detailed list.
- **Budget Management**: Set budgets for different categories and track your progress to avoid overspending.
- **User Authentication**: Secure login and registration flows to keep your financial data private.
- **Profile Management**: Manage your user profile and settings.
- **Data Visualization**: Clean, modern UI with charts and progress indicators to visualize your financial health.

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/)
- **Toolchain**: [Expo](https://expo.dev/)
- **Navigation**: [React Navigation](https://reactnavigation.org/) (Native Stack & Bottom Tabs)
- **UI Components**: 
  - [React Native Paper](https://callstack.github.io/react-native-paper/)
  - [react-native-element-dropdown](https://github.com/hoaphantn7604/react-native-element-dropdown)
  - `react-native-paper-dates` for date picking.
- **Network Requests**: [Axios](https://axios-http.com/) for communicating with the backend API.
- **Local Storage**: [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) for persisting user sessions.

## Project Structure

- `/screens`: Contains all the main views of the application (`DashboardScreen`, `AddExpenseScreen`, `BudgetScreen`, `LoginScreen`, etc.).
- `/components`: Reusable UI components used across the app for consistent design.
- `/api`: Configuration and helpers for backend communication (Axios instances).
- `/store`: State management context (e.g., authentication state, global data).
- `/assets`: Static assets like images and fonts.

## Prerequisites

Before you begin, ensure you have met the following requirements:
* You have installed Node.js and npm/yarn.
* You have installed the Expo CLI (`npm install -g expo-cli`).
* For testing on mobile devices, download the **Expo Go** app from the App Store or Google Play Store.

## Getting Started

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd kharch
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

4. **Run the App**:
   * **Physical Device**: Scan the QR code displayed in your terminal or browser using the Expo Go app.
   * **Emulator**: Press `a` in the terminal to run on an Android emulator, or `i` to run on an iOS simulator.

## Environment Variables / API Configuration

The app uses `axios` to communicate with the backend API. It loads configuration from a `.env` file using Expo's built-in environment variable support.

To set up the frontend to talk to your backend:
1. Create a `.env` file in the root of the project.
2. Add your backend base URL prefixed with `EXPO_PUBLIC_` like so:
   ```env
   EXPO_PUBLIC_BACKEND_URL=YOUR_BACKEND_URL
   # e.g., EXPO_PUBLIC_BACKEND_URL=http://[IP_ADDRESS] for local
   ```

To run the complete application stack locally:
1. Clone and run the [Kharch Backend](https://github.com/aLok-1105/kharch-backend). It is a Spring Boot application backed by a PostgreSQL database and secured with JWT.
2. Ensure that the `EXPO_PUBLIC_BACKEND_URL` in your `.env` points to your local backend instance (e.g., your network IP for testing on a physical device, or `http://localhost:8081` for a simulator).

## License

This project is licensed under the MIT License.
