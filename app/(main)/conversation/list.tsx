import CommonHeader from "@/components/CommonHeader";
import { fetchConversation } from "@/services/supabase";
import useConversationStore from "@/store/conversationStore";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import { joinCategories } from "@/utils";
import { playWord } from "@/utils/voice";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";

const ConversationList = () => {
  const [supabaseData, setSupabaseData] = React.useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const canLoadMore = React.useRef<boolean>(true);
  const currentOffset = React.useRef("");
  const colors = useThemeStore((state) => state.colors); // Get theme colors
  const { t } = useTranslation(); // Specify namespaces
  const socialInfo = useInfoStore((state) => state.socialInfo);
  const {
    setConversation,
    setIsWordPlaying,
    setSelectingTopic,
    selectingTopic,
  } = useConversationStore();

  const fetchData = async (pageNum: number, isRefresh: boolean = false) => {
    if (
      (isLoading && !isRefresh) ||
      (!canLoadMore.current && !isRefresh) ||
      !socialInfo
    ) {
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
      currentOffset.current = ""; // Reset offset for refresh
      canLoadMore.current = true; // Allow loading more after refresh
    } else {
      setIsLoading(true);
    }

    try {
      const { data: newItems, error } = await fetchConversation(
        joinCategories(socialInfo),
        pageNum,
        currentOffset.current
      );

      if (error) throw error;

      if (!newItems || newItems.length === 0) {
        canLoadMore.current = false;
      } else {
        setSupabaseData((prevData) =>
          isRefresh ? newItems : [...prevData, ...newItems]
        );
        currentOffset.current = newItems[newItems.length - 1].created_at;
        if (newItems.length < pageNum) {
          canLoadMore.current = false;
        }
      }
    } catch (e) {
      console.error("Failed to fetch conversation:", e);
      canLoadMore.current = false; // Stop trying if error
    } finally {
      setIsLoading(false);
      if (isRefresh) setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchData(24);
  }, []);

  const handleRefresh = () => {
    fetchData(24, true);
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <CommonHeader title="" />
        <FlatList
          data={supabaseData}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: s(12) }}
          onEndReached={() => fetchData(6)}
          ListFooterComponent={
            <View>
              {isLoading && (
                <ActivityIndicator size={"large"} color={colors.primary} />
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          keyExtractor={(item, index) => `conversation-${index}`}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.topicContentContainer,
                {
                  backgroundColor: colors.primaryDark,
                },
              ]}
              onPress={() => {
                if (!selectingTopic) {
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
                  router.back();
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
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </View>
  );
};

export default ConversationList;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  topicContentContainer: {
    width: "100@s",
    height: "100@s",
    borderRadius: "8@s",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "8@s",
    margin: "4@s",
  },
});
