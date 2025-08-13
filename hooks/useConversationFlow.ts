import { playWord, setDefaultVoice, stopWord } from "@/utils/voice";
import { router } from "expo-router";
import { getAvailableVoicesAsync } from "expo-speech";
import React from "react";
const useConversationFlow = ({
  conversation,
  timeline: data,
  setTimeline: setData,
  isWordPlaying,
  setIsWordPlaying,
}: {
  timeline: Chat[];
  setTimeline: (_: Chat[]) => void;
  conversation: Conversation | null;
  isWordPlaying: boolean;
  setIsWordPlaying: (_: boolean) => void;
}) => {
  const indexCommunication = React.useRef<number>(0);

  React.useEffect(() => {
    if (conversation) {
      getAvailableVoicesAsync().then((r) => {
        const list = r.filter((v) => v.language === "en-US");
        setDefaultVoice(list[conversation.id % (list.length || 1)].identifier);
      });
    }
  }, [conversation]);

  React.useEffect(() => {
    if (!!conversation && !isWordPlaying && indexCommunication.current === 0) {
      const _data = [
        ...data,
        {
          role: "model",
          content:
            conversation?.conversation.timeline[indexCommunication.current]
              .dialogue,
          translate:
            conversation?.conversation.timeline[indexCommunication.current]
              ?.translate,
        },
      ];
      setData([...(_data as any)]);
      setIsWordPlaying(true);
      getAvailableVoicesAsync().then((r) => {
        const list = r.filter((v) => v.language === "en-US");
        setDefaultVoice(list[conversation.id % (list.length || 1)].identifier);
        playWord(
          conversation?.conversation.timeline[indexCommunication.current]
            .dialogue || "",
          "extra_mtb_ev.db",
          1.0,
          list[conversation.id % (list.length || 1)].identifier
        )
          .then(() => {
            setData([
              ...(_data as any),
              {
                role: "user",
                content:
                  conversation?.conversation.timeline[
                    indexCommunication.current + 1
                  ].dialogue,
                translate:
                  conversation?.conversation.timeline[
                    indexCommunication.current + 1
                  ]?.translate,
              },
            ]);
          })
          .finally(() => {
            setIsWordPlaying(false);
            indexCommunication.current += 2;
          });
      });
    }
  }, [conversation, isWordPlaying]);

  React.useEffect(() => {
    if (data.length === 0) {
      setData([
        {
          role: "model",
          content: "Hi! Welcome to Wordlet AI.",
        },
      ]);
      setIsWordPlaying(true);
      playWord("Hi! Welcome to Wordlet AI", "extra_mtb_ev.db").then(() => {
        playWord(
          "Please select one of the following role plays",
          "extra_mtb_ev.db"
        ).finally(() => {
          setIsWordPlaying(false);
        });
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
    return () => {
      stopWord();
      setDefaultVoice("");
    };
  }, []);

  const next = () => {
    if (
      indexCommunication.current >=
      (conversation?.conversation?.timeline.length || 0)
    ) {
      //break;
      router.replace("/conversation/game-over");
      return;
    }
    const _data = [
      ...data,
      {
        role: "model",
        content:
          conversation?.conversation.timeline[indexCommunication.current]
            ?.dialogue,
        translate:
          conversation?.conversation.timeline[indexCommunication.current]
            ?.translate,
      },
    ];
    setData([...(_data as any)]);
    setIsWordPlaying(true);
    playWord(
      conversation?.conversation.timeline[indexCommunication.current]
        .dialogue || "",
      "extra_mtb_ev.db"
    )
      .then(() => {
        setData([
          ...(_data as any),
          {
            role: "user",
            content:
              conversation?.conversation.timeline[
                indexCommunication.current + 1
              ].dialogue,
            translate:
              conversation?.conversation.timeline[
                indexCommunication.current + 1
              ]?.translate,
          },
        ]);
      })
      .finally(() => {
        setIsWordPlaying(false);
        indexCommunication.current += 2;
      });
  };
  return {
    next,
  };
};

export default useConversationFlow;
