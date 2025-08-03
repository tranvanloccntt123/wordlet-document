import CommonHeader from "@/components/CommonHeader";
import { AIChatTopic } from "@/constants/topic";
import useSpeakAndCompare from "@/hooks/useSpeakAndCompare";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { playWord } from "@/utils/voice";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";
import Rive, { RiveRef } from "rive-react-native";

const AIChat = () => {
  const colors = useThemeStore((state) => state.colors);
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
    percent,
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
    setSpokenText("");
    const _data = [
      ...data,
      {
        role: "model",
        content:
          AIChatTopic[selectedTopic].conversation.timeline[
            indexCommunication.current
          ].dialogue,
      },
    ];
    setData([...(_data as any)]);
    playWord(
      AIChatTopic[selectedTopic].conversation.timeline[
        indexCommunication.current
      ].dialogue,
      "extra_mtb_ev.db"
    ).then(() => {
      setData([
        ...(_data as any),
        {
          role: "user",
          content:
            AIChatTopic[selectedTopic].conversation.timeline[
              indexCommunication.current + 1
            ].dialogue,
        },
      ]);
    });
    indexCommunication.current += 2;
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
        },
      ];
      setData([...(_data as any)]);
      playWord(
        AIChatTopic[selectedTopic].conversation.timeline[
          indexCommunication.current
        ].dialogue,
        "extra_mtb_ev.db"
      ).then(() => {
        setData([
          ...(_data as any),
          {
            role: "user",
            content:
              AIChatTopic[selectedTopic].conversation.timeline[
                indexCommunication.current + 1
              ].dialogue,
          },
        ]);
      });
      indexCommunication.current += 2;
    }
  }, [selectedTopic]);

  React.useEffect(() => {
    //Start Communication
    if (data.length === 0) {
      setData([
        {
          role: "model",
          content: "Hi! Welcome to Wordlet AI.",
        },
      ]);
      playWord("Hi! Welcome to Wordlet AI", "extra_mtb_ev.db").then(() => {
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
          <Text>
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
        </View>
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
                    playWord(
                      `You have selected topic ${v.topic}, now let's start the conversation.`,
                      "extra_mtb_ev.db"
                    ).then(() => {
                      setSelectedTopic(i);
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
          ListFooterComponent={
            !!feedback.length ? (
              <TouchableOpacity
                style={[styles.continueBtn]}
                onPress={() => {
                  next();
                }}
              >
                <Text
                  style={[
                    getAppFontStyle({
                      fontFamily: FontFamilies.NunitoRegular,
                      fontSizeKey: FontSizeKeys.caption,
                    }),
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  {t("common.continue")}...
                </Text>
              </TouchableOpacity>
            ) : (
              <></>
            )
          }
        />
        <View
          style={[
            styles.audioRecorderContainer,
            { opacity: selectedTopic === -1 || isLoading ? 0.5 : 1 },
          ]}
        >
          <View style={{ flex: 1, borderRadius: s(50), overflow: "hidden" }}>
            <Rive
              resourceName={"recording"}
              style={{ width: s(60), height: s(60) }}
              autoplay={false}
              ref={recordRef}
            />
          </View>
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            disabled={selectedTopic === -1}
            onPress={() => {
              if (!isListening) {
                setSpokenText("");
                startListening(
                  data[data.length - 1].content.replaceAll("-", " ")
                );
              } else {
                stopListening();
              }
            }}
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
