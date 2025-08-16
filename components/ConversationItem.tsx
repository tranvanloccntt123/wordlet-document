import useConversationStore from "@/store/conversationStore";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import { playWord } from "@/utils/voice";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { s, ScaledSheet } from "react-native-size-matters";
import ConversationLocked from "./ConversationLocked";

const ConversationItem: React.FC<{
  item: Conversation;
  onPress?: () => void;
}> = ({ item, onPress }) => {
  const {
    conversation,
    setConversation,
    isWordPlaying,
    setIsWordPlaying,
    selectingTopic,
    setSelectingTopic,
    unlocked,
  } = useConversationStore();
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity
      style={[
        styles.topicContentContainer,
        {
          backgroundColor: colors.primaryDark,
          opacity: !!conversation || selectingTopic ? 0.7 : 1,
        },
      ]}
      key={item.topic}
      disabled={
        !!conversation || selectingTopic || isWordPlaying || isWordPlaying
      }
      onPress={() => {
        if (!selectingTopic && !conversation && !isWordPlaying) {
          if (unlocked[item.id]) {
            setSelectingTopic(true);
            setIsWordPlaying(true);
            playWord(
              `You have selected topic ${item.topic}, now let's start the conversation.`,
              "extra_mtb_ev.db"
            )
              .then(() => {
                setConversation(item);
              })
              .finally(() => {
                setIsWordPlaying(false);
              });
            onPress?.();
          } else {
            //PAYMENT
            router.navigate({
              pathname: "/conversation/unlock-confirmation",
              params: {
                conversationId: `${item.id}`,
              },
            });
          }
        }
      }}
    >
      <Text style={{ fontSize: s(18) }}>{item.emoji}</Text>
      <Text
        style={[
          getAppFontStyle({
            fontSizeKey: FontSizeKeys.caption,
            fontFamily: FontFamilies.NunitoRegular,
          }),
          {
            color: "white",
            textAlign: "center",
            fontSize: s(10),
          },
        ]}
      >
        {item.topic}
      </Text>
      {!unlocked[item.id] && <ConversationLocked />}
    </TouchableOpacity>
  );
};

export default ConversationItem;

const styles = ScaledSheet.create({
  topicContentContainer: {
    width: "100@s",
    height: "100@s",
    borderRadius: "8@s",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "8@s",
  },
});
