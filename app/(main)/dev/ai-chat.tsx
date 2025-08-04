import CommonHeader from "@/components/CommonHeader";
import GameButtons from "@/components/GameButtons";
import { AIChatTopic } from "@/constants/topic";
import useSpeakAndCompare from "@/hooks/useSpeakAndCompare";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { playWord } from "@/utils/voice";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";
import { RiveRef } from "rive-react-native";
// <FontAwesome name="volume-up" size={24} color="black" />

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
          >
            <Entypo name="language" size={s(15)} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              playWord(item.content, "extra_mtb_ev.db");
            }}
            disabled={disableAudio}
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

const AIChat = () => {
  const colors = useThemeStore((state) => state.colors);
  const [isWordPlaying, setIsWordPlaying] = React.useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = React.useState<number>(-1);
  const [data, setData] = React.useState<
    {
      role: "user" | "model";
      content: string;
      feedback?: { char: string; status: string }[];
    }[]
  >([]);

  const recordRef = React.useRef<RiveRef>(null);

  const flatListRef = React.useRef<FlatList>(null);

  const [isLoading, _setIsLoading] = React.useState<boolean>(false);

  const selectingTopic = React.useRef<boolean>(false);

  const { t } = useTranslation();

  const {
    stopListening,
    setSpokenText,
    isListening,
    startListening,
    feedback,
    nextWord,
  } = useSpeakAndCompare();
  const indexCommunication = React.useRef<number>(0);

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

  const next = () => {
    if (
      indexCommunication.current >=
      AIChatTopic[selectedTopic].conversation.timeline.length
    ) {
      //break;
      router.back();
      return;
    }
    setSpokenText("");
    const _data = [
      ...data,
      {
        role: "model",
        content:
          AIChatTopic[selectedTopic].conversation.timeline[
            indexCommunication.current
          ]?.dialogue,
        translate:
          AIChatTopic[selectedTopic].conversation.timeline[
            indexCommunication.current
          ]?.translate,
      },
    ];
    setData([...(_data as any)]);
    setIsWordPlaying(true);
    playWord(
      AIChatTopic[selectedTopic].conversation.timeline[
        indexCommunication.current
      ].dialogue,
      "extra_mtb_ev.db"
    )
      .then(() => {
        setData([
          ...(_data as any),
          {
            role: "user",
            content:
              AIChatTopic[selectedTopic].conversation.timeline[
                indexCommunication.current + 1
              ].dialogue,
            translate:
              AIChatTopic[selectedTopic].conversation.timeline[
                indexCommunication.current + 1
              ]?.translate,
          },
        ]);
      })
      .finally(() => {
        setIsWordPlaying(false);
        indexCommunication.current += 2;
      });
    nextWord();
  };

  React.useEffect(() => {
    if (selectedTopic !== -1) {
      const _data = [
        ...data,
        {
          role: "model",
          content:
            AIChatTopic[selectedTopic].conversation.timeline[
              indexCommunication.current
            ].dialogue,
          translate:
            AIChatTopic[selectedTopic].conversation.timeline[
              indexCommunication.current
            ]?.translate,
        },
      ];
      setData([...(_data as any)]);
      setIsWordPlaying(true);
      playWord(
        AIChatTopic[selectedTopic].conversation.timeline[
          indexCommunication.current
        ].dialogue,
        "extra_mtb_ev.db"
      )
        .then(() => {
          setData([
            ...(_data as any),
            {
              role: "user",
              content:
                AIChatTopic[selectedTopic].conversation.timeline[
                  indexCommunication.current + 1
                ].dialogue,
              translate:
                AIChatTopic[selectedTopic].conversation.timeline[
                  indexCommunication.current + 1
                ]?.translate,
            },
          ]);
        })
        .finally(() => {
          setIsWordPlaying(false);
          indexCommunication.current += 2;
        });
    }
  }, [selectedTopic]);

  React.useEffect(() => {
    if (data.length === 0) {
      setData([
        {
          role: "model",
          content: "Hi! Welcome to Wordlet AI.",
        },
      ]);
      setIsWordPlaying(true);
      playWord("Hi! Welcome to Wordlet AI", "extra_mtb_ev.db")
        .then(() => {
          playWord(
            "Please select one of the following role plays",
            "extra_mtb_ev.db"
          );
          setData([
            {
              role: "model",
              content: "Hi! Welcome to Wordlet AI.",
            },
            {
              role: "model",
              content: "Please select one of the following role plays",
            },
          ]);
        })
        .finally(() => {
          setIsWordPlaying(false);
        });
    }
  }, []);

  React.useEffect(() => {
    flatListRef.current?.scrollToEnd();
  }, [data]);

  React.useEffect(() => {
    if (isListening) {
      recordRef.current?.play();
    } else {
      recordRef.current?.reset();
    }
  }, [isListening]);

  const renderItem = ({
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
        <ChatItem item={item} index={index} disableAudio={isWordPlaying} />
        {index === 1 && (
          <View style={styles.topicListContainer}>
            {AIChatTopic.map((v, i) => (
              <TouchableOpacity
                style={[
                  styles.topicContentContainer,
                  {
                    backgroundColor: colors.primaryDark,
                    opacity:
                      selectedTopic !== -1 && selectedTopic != i ? 0.7 : 1,
                  },
                ]}
                key={v.topic}
                disabled={selectedTopic !== -1}
                onPress={() => {
                  if (!selectingTopic.current) {
                    selectingTopic.current = true;
                    setIsWordPlaying(true);
                    playWord(
                      `You have selected topic ${v.topic}, now let's start the conversation.`,
                      "extra_mtb_ev.db"
                    )
                      .then(() => {
                        setSelectedTopic(i);
                      })
                      .finally(() => {
                        setIsWordPlaying(false);
                      });
                  }
                }}
              >
                <Text style={{ fontSize: s(18) }}>{v.emoji}</Text>
                <Text
                  style={[
                    getAppFontStyle({
                      fontSizeKey: FontSizeKeys.caption,
                      fontFamily: FontFamilies.NunitoRegular,
                    }),
                    {
                      color: "white",
                      textAlign: "center",
                    },
                  ]}
                >
                  {v.topic}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.container}>
        <CommonHeader title="Wordlet AI" />
        <FlatList
          ref={flatListRef}
          keyExtractor={(item, index) => `CHAT_${index}`}
          data={data}
          renderItem={renderItem}
        />
        <View style={{ marginHorizontal: s(16), paddingVertical: s(8) }}>
          <GameButtons
            onSkipPress={next}
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
              selectedTopic === -1 || isLoading || isWordPlaying || isListening
            }
            primaryButtonText={
              isListening ? t("games.stopButton") : t("games.startButton")
            }
            skipButtonText={t("common.continue")}
            primaryButtonDisabled={selectedTopic === -1 || isWordPlaying}
          />
        </View>
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
    gap: "8@s",
  },
  commentText: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.caption,
      fontFamily: FontFamilies.NunitoRegular,
    }),
  },
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
});
