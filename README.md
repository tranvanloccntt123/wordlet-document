##### _#Project idea prompt:_

- The design will follows by the Flat design.
- Password of db: `j[F)SpD{QDFr4SG&Kp;,<C;&CTf9X<`
  - https://dl.dict.laban.vn/dict_store/dicts.json
  - https://dl.dict.laban.vn/dict_store/dicts1.json
- Dark and light mode

## **I. Technical**

#### **1. Platform**

- Main stack is _Expo_

#### **2. Libraries**

- Expo Notification
- Expo route
- React native size matter
- Expo-speech
- Async Storage used for zustand persist
- Zustand
- Expo-sqlite
- react-native-zip-archive
- expo-file-system
- axios

## **II. Features**:

#### **1. Search feature**:

- Project about learning english words.
- Users will search a new word on Search Screen, we need to suggest for user a word list with spell, word, vietnamese translation.
- Users can select the correct word in suggest list that it be able store at any group i want.
- The words and group can persist to local store

#### **2. Play games feature:**

- Users have to choose a group before play the games.
- Words inside group selected will be use in the games.
- Game Categories:
  - Sort charactors to full fill the word
  - Choose correct word from vietnamese translation
  - Choose vietnamese translation from english word

#### **3. Remind word feature**:

- Users will receive a notification about information of a random word, notification will includes: english word, spell, translate
- The notification will send at random time

#### **4. Text to speech feature**

- Choose word and play audio of word

#### **5. Streak days**

##### _#Project style prompt_

- Colors:

```js
const Colors = {
  light: {
    primary: "#007AFF",
    primaryDark: "#005BB5",
    accent: "#FF2D55",
    accentDark: "#C3002F",
    background: "#F5F5F5",
    card: "#FFFFFF",
    border: "#E0E0E0",
    textPrimary: "#333333",
    textSecondary: "#666666",
    textDisabled: "#B0B0B0",
    success: "#34C759",
    error: "#FF3B30",
    warning: "#FF9500",
    transparent: "transparent",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  dark: {
    primary: "#0A84FF",
    primaryDark: "#0066CC",
    accent: "#FF375F",
    accentDark: "#D81B60",
    background: "#121212",
    card: "#1C1C1E",
    border: "#2C2C2E",
    textPrimary: "#E5E5E7",
    textSecondary: "#8E8E93",
    textDisabled: "#636366",
    success: "#30D158",
    error: "#FF453A",
    warning: "#FF9F0A",
    transparent: "transparent",
    shadow: "rgba(0, 0, 0, 0.3)",
  },
};

export default Colors;
```

- Safe Area: Screen must be wrap by SafeAreaView from 'react-native-safe-area-context' with flexible is full screen.