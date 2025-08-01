import CommonHeader from "@/components/CommonHeader";
import { initContent, sendChat } from "@/services/ai";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";

const AIChat = () => {
  const colors = useThemeStore((state) => state.colors);
  React.useEffect(() => {
    sendChat(initContent);
  }, []);
  const [data, setData] = React.useState<
    {
      role: "user" | "model";
      content: string;
    }[]
  >([
    {
      role: "model",
      content: "Hi! Welcome to Wordlet AI.",
    },
    {
      role: "model",
      content: "Please select one of the following role plays",
    },
  ]);
  const renderItem = ({
    item,
    index,
  }: {
    item: {
      role: "user" | "model";
      content: string;
    };
    index: number;
  }) => {
    return (
      <View
        style={[
          { alignItems: item.role === "model" ? "flex-start" : "flex-end" },
        ]}
      >
        <View
          style={[
            styles.commentContainer,
            {
              backgroundColor: colors.card,
            },
          ]}
        >
          <Text style={[styles.commentText, { color: colors.textPrimary }]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.container}>
        <CommonHeader title="Wordlet AI" />
        <FlatList data={data} renderItem={renderItem} />
      </SafeAreaView>
    </View>
  );
};

export default AIChat;

const styles = ScaledSheet.create({
  container: { flex: 1 },
  commentContainer: {
    paddingVertical: "12@s",
    paddingHorizontal: "16@s",
    borderRadius: "8@s",
    marginBottom: "16@s",
    marginHorizontal: "24@s",
    maxWidth: "75%",
  },
  commentText: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.caption,
      fontFamily: FontFamilies.NunitoRegular,
    }),
  },
});
