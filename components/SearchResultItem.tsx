import { PRO_DIC } from "@/constants"; // Assuming WordStore is exported from here
import useThemeStore from "@/store/themeStore";
import { commonStyles } from "@/styles/commonStyles";
import { playWord } from "@/utils/voice";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";

interface SearchResultItemProps {
  item: WordStore;
  onPressItem: () => void; // New prop for handling item press
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  onPressItem,
}) => {
  const { colors } = useThemeStore();

  // Helper function to parse and render content lines, adapted for this component
  const renderParsedContent = (content: string | undefined) => {
    if (!content) {
      return null;
    }

    const lines = content.split("\n");
    let spelling = "";
    const fivePrefixedContents: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("5#")) {
        const lineContent = trimmedLine.substring(2).trim();
        if (lineContent) {
          fivePrefixedContents.push(lineContent);
        }
      }
      if (trimmedLine.startsWith("1#")) {
        spelling = trimmedLine.substring(2).trim();
      }
    }

    const joinedContent = fivePrefixedContents.join(", ");
    let displayedContent = joinedContent;

    if (joinedContent.length > 50) {
      displayedContent = `${joinedContent.substring(0, 47)}...`;
    }

    if (displayedContent) {
      return (
        <View>
          {!!spelling && (
            <Text style={{ color: colors.primaryDark }}>{spelling}</Text>
          )}
          <Text
            style={[
              commonStyles.secondaryText,
              { color: colors.textPrimary, opacity: 0.8 },
            ]}
            numberOfLines={1} // Ensure it fits on one line with ellipsis if still too long
          >
            {displayedContent}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={[
        commonStyles.listItemCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => onPressItem()}
    >
      {/* Column 1: Word and Content */}
      <View style={styles.textContainer}>
        <View style={styles.itemHeaderContainer}>
          <Text
            style={[
              commonStyles.primaryText,
              { color: colors.textPrimary, flex: 1 },
            ]}
          >
            {item.word}
          </Text>
          {PRO_DIC.includes(item.source || "") && (
            <Text style={{ color: colors.warning }}>Specialized</Text>
          )}
        </View>
        {item.content ? <View>{renderParsedContent(item.content)}</View> : null}
      </View>
      {/* Column 2: Voice Button */}
      <TouchableOpacity
        onPress={() => playWord(item.word, item.source)}
        style={commonStyles.iconButton}
      >
        <MaterialIcons name="volume-up" size={24} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  textContainer: {
    flex: 1,
    marginRight: "10@ms",
  },
  itemHeaderContainer: {
    flexDirection: "row",
    gap: "8@s",
    alignItems: "center",
  },
  // Styles specific to the item, if any, that are not in commonStyles
});

export default SearchResultItem;
