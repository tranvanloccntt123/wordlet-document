import { ScaledSheet } from "react-native-size-matters";

export const commonStyles = ScaledSheet.create({
  // Card Styles
  cardBase: {
    borderRadius: "10@s",
    padding: "15@ms",
    marginBottom: "10@ms",
    borderWidth: 1,
  },
  listItemCard: {
    // For items in a list, typically with row layout
    // Inherits or includes properties from cardBase if you prefer to compose
    borderRadius: "10@s",
    padding: "15@ms",
    marginBottom: "10@ms",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Text Input Styles
  textInputContainer: {
    flexDirection: "row",
    borderRadius: "100@s",
    padding: "6@ms",
    minHeight: "50@s",
    alignItems: "center",
    // marginBottom will be screen-specific
  },
  textInput: {
    flex: 1,
    fontSize: "16@s",
    marginLeft: "10@ms", // Assuming an icon is usually to the left
  },
  // Text Styles
  primaryText: {
    fontSize: "18@s",
    fontWeight: "bold",
  },
  secondaryText: {
    fontSize: "12@s",
  },
  // Wrapper Styles
  borderedView: {
    // For content like definitions or notes
    borderWidth: 1,
    borderRadius: "10@s",
    padding: "8@ms",
    marginTop: "4@ms", // Common spacing if it's usually below a primary text
  },
  // Icon Button
  iconButton: {
    // Example: add padding if you want a larger touch target for icons
    // padding: '5@ms',
  },
});

// If you want to easily merge with screen-specific styles or theme colors:
export const applyThemeToCommonStyle = (
  styleName: keyof typeof commonStyles,
  themeColors: any
) => {
  // This is a simple example; you might want a more sophisticated merging strategy
  // For instance, specific styles like 'cardBase' might need 'backgroundColor' and 'borderColor' from theme
  const baseStyle: any = commonStyles[styleName];
  let themedStyle = { ...baseStyle };

  if (
    styleName === "cardBase" ||
    styleName === "listItemCard" ||
    styleName === "textInputContainer"
  ) {
    themedStyle = {
      ...themedStyle,
      backgroundColor: themeColors.card,
      borderColor: themeColors.border,
    };
  }
  if (styleName === "borderedView") {
    themedStyle = {
      ...themedStyle,
      borderColor: themeColors.primary, // Default for borderedView
    };
  }
  if (
    styleName === "primaryText" ||
    styleName === "secondaryText" ||
    styleName === "textInput"
  ) {
    themedStyle = {
      ...themedStyle,
      color: themeColors.textPrimary,
    };
  }
  // Add more specific theme applications as needed

  return themedStyle;
};
