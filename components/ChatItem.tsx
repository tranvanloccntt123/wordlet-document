import useConversationStore from "@/store/conversationStore";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import { playWord } from "@/utils/voice";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { s, ScaledSheet } from "react-native-size-matters";

const ChatItem: React.FC<{
  item: {
    role: "user" | "model";
    content: string;
    translate?: string;
    feedback?: { char: string; status: string }[];
  };
  index: number;
  disableAudio?: boolean;
}> = ({ item, index, disableAudio }) => {
  const setIsWordPlaying = useConversationStore(
    (state) => state.setIsWordPlaying
  );
  const colors = useThemeStore((state) => state.colors);
  const [isTranslation, setIsTranslation] = React.useState<boolean>(false);
  return (
    <View
      style={[
        styles.commentContainer,
        {
          backgroundColor: colors.card,
        },
      ]}
    >
      {!item.feedback?.length && (
        <Text style={[styles.commentText, { color: colors.textPrimary }]}>
          {item.content.replaceAll("-", " ")}
        </Text>
      )}
      <Text style={styles.commentText}>
        {item.feedback?.map((item, index) => (
          <Text
            key={index}
            style={[
              styles.commentText,
              item.status === "correct"
                ? { color: colors.success }
                : item.status === "incorrect"
                ? { color: colors.error }
                : { color: colors.textPrimary },
            ]}
          >
            {item.char}
          </Text>
        ))}
      </Text>
      {index >= 2 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: s(8),
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setIsTranslation(!isTranslation);
            }}
            style={{ padding: s(8) }}
          >
            <Entypo name="language" size={s(15)} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (disableAudio) return;
              setIsWordPlaying(true);
              playWord(item.content, "extra_mtb_ev.db").finally(() => {
                setIsWordPlaying(false);
              });
            }}
            disabled={disableAudio}
            style={{ padding: s(8) }}
          >
            <FontAwesome
              name="volume-up"
              size={s(15)}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      )}
      {isTranslation && !!item.translate && (
        <View
          style={{
            padding: s(8),
            borderRadius: s(8),
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ fontSize: s(12), color: colors.card }}>
            {item.translate}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ChatItem;

const styles = ScaledSheet.create({
  commentContainer: {
    paddingVertical: "12@s",
    paddingHorizontal: "16@s",
    borderRadius: "8@s",
    marginBottom: "16@s",
    marginHorizontal: "24@s",
    maxWidth: "75%",
    gap: "8@s",
  },
  commentText: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.caption,
      fontFamily: FontFamilies.NunitoRegular,
    }),
  },
});
