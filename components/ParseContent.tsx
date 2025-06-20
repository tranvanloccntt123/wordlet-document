import useThemeStore from "@/store/themeStore";
import { router } from "expo-router";
import React from "react"; // Added useCallback
import { Text, View } from "react-native"; // Added Alert
import { ScaledSheet } from "react-native-size-matters"; // Import s for scaling

type ContentComponents = "0#" | "1#" | "3#" | "5#" | "6#" | "7#" | "8#" | "9#";

interface ParseContentProps {
  content: string;
  hideComponents?: ContentComponents[];
}

const ParseContent: React.FC<ParseContentProps> = ({
  content,
  hideComponents,
}) => {
  const { colors } = useThemeStore();

  const parseAndRenderContent = () => {
    if (!content) {
      return null;
    }

    const elements: React.ReactNode[] = [];
    const lines = content.split("\n");
    let lastSevenLine: string | null = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Helper to check if a component type should be hidden
      const shouldHide = (type: ContentComponents) =>
        hideComponents?.includes(type);

      if (trimmedLine.startsWith("0#") && !shouldHide("0#")) {
        // Current logic for 0# is just to reset lastSevenLine,
        // but this check is here for consistency if 0# were to render something.
        lastSevenLine = null;
      } else if (trimmedLine.startsWith("1#")) {
        if (!shouldHide("1#")) {
          elements.push(
            <Text
              key={`1-${index}`}
              style={[cardStyles.phoneticText, { color: colors.primary }]}
            >
              {trimmedLine.substring(2).trim()}
            </Text>
          );
        }
        lastSevenLine = null;
      } else if (trimmedLine.startsWith("3#")) {
        if (!shouldHide("3#")) {
          const txt = trimmedLine.substring(2).trim();
          if (txt.includes("6#") && !shouldHide("3#")) {
            const parts = txt.split("6#");
            elements.push(
              <Text
                key={`3-${index}`}
                style={[
                  cardStyles.partOfSpeechText,
                  { color: colors.textPrimary, fontWeight: "400" },
                ]}
              >
                {parts[0].trim() + " "}
                <Text
                  onPress={() => {
                    router.push(
                      `/word/${encodeURIComponent(
                        "extra_mtb_ev.db"
                      )}/${encodeURIComponent(parts[1].trim())}/detail`
                    );
                  }}
                  style={[
                    cardStyles.partOfSpeechText,
                    { color: colors.primaryDark },
                  ]}
                >
                  {parts[1].trim()}
                </Text>
              </Text>
            );
          } else {
            elements.push(
              <Text
                key={`3-${index}`}
                style={[
                  cardStyles.partOfSpeechText,
                  { color: colors.primaryDark },
                ]}
              >
                {trimmedLine.substring(2).trim()}
              </Text>
            );
          }
        }
        lastSevenLine = null;
      } else if (trimmedLine.startsWith("5#")) {
        if (!shouldHide("5#")) {
          elements.push(
            <Text
              key={`5-${index}`}
              style={[cardStyles.definitionText, { color: colors.textPrimary }]}
            >
              {trimmedLine.substring(2).trim()}
            </Text>
          );
        }
        lastSevenLine = null;
      } else if (trimmedLine.startsWith("6#")) {
        if (!shouldHide("6#")) {
          elements.push(
            <Text
              key={`6-${index}`}
              style={[cardStyles.definitionText, { color: colors.success }]}
            >
              {trimmedLine.substring(2).trim()}
            </Text>
          );
        } else {
          lastSevenLine = null; // If 7# is hidden, ensure lastSevenLine is null
        }
      } else if (trimmedLine.startsWith("7#")) {
        if (!shouldHide("7#")) {
          lastSevenLine = trimmedLine.substring(2).trim();
        } else {
          lastSevenLine = null; // If 7# is hidden, ensure lastSevenLine is null
        }
      } else if (trimmedLine.startsWith("8#")) {
        // Render 8# only if it's not hidden AND its corresponding 7# was not hidden (lastSevenLine is not null)
        if (!shouldHide("8#") && lastSevenLine) {
          elements.push(
            <View key={`78-${index}`} style={cardStyles.examplePairContainer}>
              <Text
                style={[cardStyles.dotPoint, { color: colors.textDisabled }]}
              >
                •
              </Text>
              <View style={cardStyles.examplePairBox}>
                <Text
                  style={[
                    cardStyles.exampleText,
                    { color: colors.textPrimary },
                  ]}
                >
                  {lastSevenLine}
                </Text>
                <Text
                  style={[
                    cardStyles.translationText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {trimmedLine.substring(2).trim()}
                </Text>
              </View>
            </View>
          );
        }
        lastSevenLine = null; // Reset after pairing or if 8# is processed
      } else if (trimmedLine.startsWith("9#")) {
        if (!shouldHide("9#")) {
          elements.push(
            <Text
              key={`9-${index}`}
              style={[cardStyles.idiomHeaderText, { color: colors.accentDark }]}
            >
              {trimmedLine.substring(2).trim()}
            </Text>
          );
        }
        lastSevenLine = null;
      } else if (trimmedLine) {
        // Handle lines without a specific prefix, if necessary
        // For now, rendering them as default text or could be part of a multi-line definition
        // elements.push(<Text key={`other-${index}`} style={cardStyles.defaultText}>{trimmedLine}</Text>);
      }
    });

    return elements;
  };

  return <>{parseAndRenderContent()}</>; // Wrap in a fragment for type safety if elements is empty
};

export default ParseContent;

// Renamed 'styles' to 'cardStyles' to avoid conflict with 'screenStyles'
const cardStyles = ScaledSheet.create({
  phoneticText: {
    fontSize: "13@s",
    marginBottom: "8@ms",
  },
  partOfSpeechText: {
    fontSize: "13@s",
    fontWeight: "bold",
    marginTop: "10@ms",
    marginBottom: "4@ms",
  },
  definitionText: {
    fontSize: "14@s",
    lineHeight: "20@s", // 14 * 1.4 approx
    marginBottom: "8@ms",
  },
  examplePairContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: "4@ms",
  },
  dotPoint: {
    fontSize: "14@s", // Should match exampleText or be distinct
    marginRight: "8@s",
    lineHeight: "20@s", // Align with exampleText lineHeight
  },
  examplePairBox: {
    flex: 1,
  },
  exampleText: {
    fontSize: "14@s",
    lineHeight: "20@s",
    fontStyle: "italic",
  },
  translationText: {
    fontSize: "14@s",
    lineHeight: "20@s",
  },
  idiomHeaderText: {
    fontSize: "16@s",
    fontWeight: "bold",
    marginTop: "12@ms",
    marginBottom: "6@ms",
  },
});
