# Project Context

Mobile order management app with push notifications for store owners (Expo/React Native).

## Stack

- **Expo SDK 54** + React Native 0.81.5 + React 19
- **Navigation**: expo-router (file-based routing with tabs and stacks)
- **Data Fetching**: Tanstack React Query (not Zustand/Redux)
- **HTTP**: Axios for API calls
- **Auth Storage**: expo-secure-store (auth tokens)
- **Notifications**: expo-notifications + expo-device
- **Local Storage**: @react-native-async-storage/async-storage


## Commands

- `npm start` — local development
- `npm run android` — build and run on Android
- `npm run ios` — build and run on iOS
- `npx expo prebuild` — generate native project files
- `npm run build:android` — release APK build
- `cd android && ./gradlew assembleRelease` — build APK 
- `cd android && ./gradlew bundleRelease` — build AAB 

---

## All Directories

| `assets` | project assets |
| `src/app/` | expo-router screens (tabs, orders stack, settings) |
| `src/app/(tabs)/` | Bottom tab navigator (Home, Orders) |
| `src/app/orders/` | Order stack screens (list, detail) |
| `src/components/` | Shared UI components (OrderCard, FilterBar, StageProgress) |
| `src/contexts/` | React Context providers (AuthContext) |
| `src/hooks/` | Custom hooks (useOrders, usePushNotifications) |
| `src/services/` | API client and notification services |
| `src/types/` | TypeScript types (Order) |
| `App.tsx` | Root component — sets up QueryClientProvider and AuthProvider |
| `index.ts` | Entry point — imports expo-router/entry to initialize file-based routing |
| `google-services.json` | Firebase config for Android push notifications (package_name: com.ecommercetest.admin) |

## Architecture Rules

- **API access** goes through `src/services/api.ts` — never fetch directly in screens
- **Auth tokens** stored via expo-secure-store — not AsyncStorage for sensitive data
- **State management** via React Context + Tanstack Query — avoid duplicating state locally
- **Push notifications** require device permission and notification handler setup — do not disable
- **Update CLAUDE.md** when new features or directories are added

## Key Concepts

- **expo-router**: File-based routing — screens are defined by file structure, not explicit routes
- **Tab navigation**: `src/app/(tabs)/_layout.tsx` defines the bottom tab bar
- **Order detail**: `src/app/orders/[id].tsx` — dynamic route for individual orders
- **Filter state**: Managed via URL query params in orders list, not local state

## Gotchas

- Do not use `fetch` directly in screens — always use the API service
- Do not store auth tokens in AsyncStorage — use expo-secure-store
- Notifications require `expo-notifications` setup with permission handler in `_layout.tsx`
- Do not modify generated Expo files (android/, ios/, .expo/)