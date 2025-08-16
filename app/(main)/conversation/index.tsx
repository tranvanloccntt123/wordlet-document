import AppLoading from "@/components/AppLoading";
import ChatItem from "@/components/ChatItem";
import ConversationItem from "@/components/ConversationItem";
import DoubleCheckBackScreen from "@/components/DoubleCheckBackScreen";
import GameButtons from "@/components/GameButtons";
import useConversationFlow from "@/hooks/useConversationFlow";
import useSpeakAndCompare from "@/hooks/useSpeakAndCompare";
import {
  fetchConversation,
  fetchUnlockedConversation,
} from "@/services/supabase";
import useConversationStore from "@/store/conversationStore";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { joinCategories } from "@/utils";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { s, ScaledSheet } from "react-native-size-matters";

const SIZE = s(10);

const HEIGHT_SIZE = [s(10), s(40)];

const WordPlayingAnimComponent = () => {
  const anim = useSharedValue(0);
  const colors = useThemeStore((state) => state.colors);

  React.useEffect(() => {
    anim.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1
    );
    return () => {
      anim.value = 0;
    };
  }, []);
  const animation1Style = useAnimatedStyle(() => {
    return {
      height: interpolate(
        anim.value,
        [0, 1, 2, 3],
        [HEIGHT_SIZE[1], HEIGHT_SIZE[0], HEIGHT_SIZE[0], HEIGHT_SIZE[0]]
      ),
    };
  });
  const animation2Style = useAnimatedStyle(() => {
    return {
      height: interpolate(
        anim.value,
        [0, 1, 2, 3],
        [HEIGHT_SIZE[0], HEIGHT_SIZE[1], HEIGHT_SIZE[0], HEIGHT_SIZE[0]]
      ),
    };
  });
  const animation3Style = useAnimatedStyle(() => {
    return {
      height: interpolate(
        anim.value,
        [0, 1, 2, 3],
        [HEIGHT_SIZE[0], HEIGHT_SIZE[0], HEIGHT_SIZE[1], HEIGHT_SIZE[0]]
      ),
    };
  });
  const animation4Style = useAnimatedStyle(() => {
    return {
      height: interpolate(
        anim.value,
        [0, 1, 2, 3],
        [HEIGHT_SIZE[0], HEIGHT_SIZE[0], HEIGHT_SIZE[0], HEIGHT_SIZE[1]]
      ),
    };
  });
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: s(8),
        height: s(44),
      }}
    >
      <Animated.View
        style={[
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE,
            backgroundColor: colors.textPrimary,
          },
          animation1Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE,
            backgroundColor: colors.textPrimary,
          },
          animation2Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE,
            backgroundColor: colors.textPrimary,
          },
          animation3Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE,
            backgroundColor: colors.textPrimary,
          },
          animation4Style,
        ]}
      />
    </View>
  );
};

const AIChat = () => {
  const colors = useThemeStore((state) => state.colors);
  const {
    timeline: data,
    setTimeline: setData,
    conversation,
    isWordPlaying,
    setIsWordPlaying,
    selectingTopic,
    pushUnlocked,
  } = useConversationStore();

  const router = useRouter();

  const [conversations, setConversations] = React.useState<Conversation[]>([]);

  const socialInfo = useInfoStore((state) => state.socialInfo);

  const flatListRef = React.useRef<FlatList>(null);

  const [isLoading, _setIsLoading] = React.useState<boolean>(false);

  const { t } = useTranslation();

  const {
    stopListening,
    setSpokenText,
    isListening,
    startListening,
    feedback,
    nextWord,
  } = useSpeakAndCompare();

  const { next } = useConversationFlow({
    timeline: data,
    setTimeline: setData,
    conversation,
    isWordPlaying,
    setIsWordPlaying,
  });

  React.useEffect(() => {
    if (feedback.length) {
      setData(
        data.map((v, i) => ({
          ...v,
          feedback: data.length - 1 === i ? feedback : v.feedback,
        }))
      );
    }
  }, [feedback]);

  React.useEffect(() => {
    !!socialInfo &&
      fetchConversation(joinCategories(socialInfo), 6).then((r) => {
        const { data } = r;
        if (data) {
          setConversations(data);
          fetchUnlockedConversation(data.map((v) => v.id)).then((r) =>
            pushUnlocked(r.data || [])
          );
        }
      });
  }, [socialInfo]);

  React.useEffect(() => {
    flatListRef.current?.scrollToEnd();
  }, [data]);

  const renderItem = React.useCallback(
    ({
      item,
      index,
    }: {
      item: {
        role: "user" | "model";
        content: string;
        feedback?: { char: string; status: string }[];
      };
      index: number;
    }) => {
      return (
        <View
          style={[
            { alignItems: item.role === "model" ? "flex-start" : "flex-end" },
          ]}
        >
          {index <= 1 && !!conversation ? (
            <></>
          ) : (
            <ChatItem item={item} index={index} disableAudio={isWordPlaying} />
          )}
          {index === 1 && !conversation && !isWordPlaying && (
            <View style={styles.topicListContainer}>
              {conversations.map((v) => (
                <ConversationItem item={v} key={`${v.id}`} />
              ))}
              <GameButtons
                fontSize={s(15)}
                hideSkipButton
                hidePrimaryButton={!!conversation || selectingTopic}
                primaryButtonText={t("common.more")}
                primaryButtonDisabled={selectingTopic}
                onPrimaryPress={() => {
                  if (!selectingTopic) {
                    router.navigate("/conversation/list");
                  }
                }}
              />
            </View>
          )}
          {index === 1 && !!conversation && (
            <View style={[styles.conversationSelectedContainer]}>
              <View
                style={[
                  styles.conversationSelectedContentContainer,
                  { backgroundColor: colors.border },
                ]}
              >
                <Text style={{ fontSize: s(25) }}>{conversation.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      getAppFontStyle({
                        fontFamily: FontFamilies.NunitoBold,
                        fontSizeKey: FontSizeKeys.body,
                      }),
                      { width: "85%", color: colors.textPrimary },
                    ]}
                  >
                    {conversation.topic}
                  </Text>
                  <Text
                    style={[
                      getAppFontStyle({
                        fontFamily: FontFamilies.NunitoRegular,
                        fontSizeKey: FontSizeKeys.caption,
                      }),
                      { width: "85%", color: colors.textSecondary },
                    ]}
                  >
                    {conversation.conversation.setting}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      );
    },
    [conversation, selectingTopic, conversations, data, isWordPlaying]
  );

  return (
    <DoubleCheckBackScreen title="Wordlet AI">
      <AppLoading isLoading={false}>
        <FlatList
          ref={flatListRef}
          keyExtractor={(item, index) => `CHAT_${index}`}
          data={data}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
        <View style={{ marginHorizontal: s(16), paddingVertical: s(8) }}>
          {isWordPlaying ? (
            <WordPlayingAnimComponent />
          ) : !!conversation ? (
            <GameButtons
              onSkipPress={() => {
                setSpokenText("");
                nextWord();
                next();
              }}
              onPrimaryPress={() => {
                if (!isListening) {
                  setSpokenText("");
                  startListening(
                    data[data.length - 1].content.replaceAll("-", " ")
                  );
                } else {
                  stopListening();
                }
              }}
              skipButtonDisabled={
                !conversation || isLoading || isWordPlaying || isListening
              }
              primaryButtonText={
                isListening ? t("games.stopButton") : t("games.startButton")
              }
              hidePrimaryButton={data[data.length - 1].role !== "user"}
              skipButtonText={t("common.continue")}
              primaryButtonDisabled={
                !conversation ||
                isWordPlaying ||
                data[data.length - 1].role !== "user"
              }
            />
          ) : (
            <></>
          )}
        </View>
      </AppLoading>
    </DoubleCheckBackScreen>
  );
};

export default AIChat;

const styles = ScaledSheet.create({
  container: { flex: 1 },
  topicListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "8@s",
    paddingHorizontal: "16@s",
    marginBottom: "16@s",
  },
  topicContentContainer: {
    width: "100@s",
    height: "100@s",
    borderRadius: "8@s",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "8@s",
  },
  audioRecorderContainer: {
    width: "60@s",
    height: "60@s",
    borderRadius: "50@s",
    alignSelf: "center",
    elevation: 5,
  },
  continueBtn: {
    alignSelf: "flex-end",
    marginHorizontal: "16@s",
    paddingHorizontal: "8@s",
    paddingVertical: "4@s",
  },
  conversationSelectedContainer: {
    paddingHorizontal: "16@s",
    marginBottom: "25@s",
    borderRadius: "16@s",
    width: "100%",
  },
  conversationSelectedContentContainer: {
    flexDirection: "row",
    padding: "16@s",
    flex: 1,
    borderRadius: "16@s",
    gap: "16@s",
    minHeight: "75@vs",
  },
});
