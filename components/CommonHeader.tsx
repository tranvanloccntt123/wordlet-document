import Colors from "@/constants/Colors";
import useThemeStore from "@/store/themeStore";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { ScaledSheet, ms, s } from "react-native-size-matters";

interface CommonHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightActionElement?: React.ReactNode;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightActionElement,
  headerStyle,
  titleStyle,
}) => {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.headerBar, headerStyle]}>
      {showBackButton ? (
        <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
          <MaterialIcons
            name="arrow-back"
            size={s(24)}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} /> // Spacer if no back button
      )}
      <Text
        style={[styles.headerTitle, { color: colors.textPrimary }, titleStyle]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {rightActionElement ? (
        <View style={styles.rightActionContainer}>{rightActionElement}</View>
      ) : (
        <View style={styles.spacer} /> // Spacer if no right action
      )}
    </View>
  );
};

const createStyles = (colors: typeof Colors.dark | typeof Colors.light) =>
  ScaledSheet.create({
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: ms(15),
      paddingVertical: ms(10),
      // borderBottomWidth: 1, // Optional: if you want a separator
      // borderBottomColor: colors.border,
    },
    iconButton: { padding: s(5) },
    headerTitle: {
      fontSize: ms(20),
      fontWeight: "bold",
      textAlign: "center",
      flexShrink: 1,
      marginHorizontal: s(10),
    },
    spacer: { width: s(24) + s(10) }, // Width of icon + padding
    rightActionContainer: { minWidth: s(24) + s(10), alignItems: "flex-end" }, // Ensure it takes at least icon space
  });

export default CommonHeader;
