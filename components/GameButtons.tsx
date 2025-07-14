import Colors from "@/constants/Colors";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys, // Import font size keys
  getAppFontStyle, // Import the font style utility
} from "@/styles/fontStyles"; // Adjust the path if necessary
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";

interface GameButtonsProps {
  hidePrimaryButton?: boolean;
  primaryButtonDisabled?: boolean;
  skipButtonDisabled?: boolean;
  onPrimaryPress?: () => void;
  onSkipPress?: () => void;
  primaryButtonText?: string; // Added to make primary button text configurable
  skipButtonText?: string;
  skipButtonTextColor?: string;
  fontSize?: number;
}

// Moved createStyles up and cleaned it
const createStyles = (colors: typeof Colors.dark | typeof Colors.light) =>
  ScaledSheet.create({
    actionButtonsContainer: {
      flexDirection: "row",
      gap: "20@ms",
      marginBottom: "20@ms",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    actionButton: {
      paddingVertical: "10@ms",
      paddingHorizontal: "20@ms",
      borderRadius: "8@s",
      minWidth: "100@s",
      alignItems: "center",
    },
    primaryButton: {
      backgroundColor: colors.warning,
    },
    skipButton: {
      backgroundColor: colors.shadow,
    },
    // Use the getAppFontStyle utility for font styling
    actionButtonText: {
      ...getAppFontStyle({
        fontFamily: FontFamilies.NunitoBlack, // Choose the base font family
        fontSizeKey: FontSizeKeys.heading, // Choose the size key
      }),
    },
    primaryButtonText: {
      color: colors.card,
    },
    skipButtonText: {
      color: colors.textSecondary,
    },
  });

const GameButtons: React.FC<GameButtonsProps> = ({
  hidePrimaryButton = false,
  primaryButtonDisabled = false,
  skipButtonDisabled = false,
  onPrimaryPress,
  onSkipPress,
  skipButtonText,
  primaryButtonText = "Submit", // Default text for primary button
  skipButtonTextColor,
  fontSize,
}) => {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { t } = useTranslation(); // Use common namespace for "Skip"

  return (
    <View style={styles.actionButtonsContainer}>
      {!hidePrimaryButton && (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
              { opacity: primaryButtonDisabled ? 0.5 : 1 },
            ]}
            onPress={onPrimaryPress}
            disabled={primaryButtonDisabled}
          >
            <Text
              style={[
                styles.actionButtonText,
                styles.primaryButtonText,
                fontSize ? { fontSize } : undefined,
              ]}
            >
              {primaryButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.skipButton,
            { opacity: skipButtonDisabled ? 0.5 : 1 },
          ]}
          onPress={onSkipPress}
          disabled={skipButtonDisabled}
        >
          <Text
            style={[
              styles.actionButtonText,
              skipButtonTextColor
                ? { color: skipButtonTextColor }
                : styles.skipButtonText,
              fontSize ? { fontSize } : undefined,
            ]}
          >
            {skipButtonText || t("common.skip")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GameButtons;
