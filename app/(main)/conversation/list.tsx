import CommonHeader from "@/components/CommonHeader";
import ConversationItem from "@/components/ConversationItem";
import { fetchConversation, fetchUnlockedConversation } from "@/services/supabase";
import useConversationStore from "@/store/conversationStore";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import { joinCategories } from "@/utils";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
  const socialInfo = useInfoStore((state) => state.socialInfo);
  const pushUnlocked = useConversationStore((state) => state.pushUnlocked);

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
        fetchUnlockedConversation(newItems.map((v) => v.id)).then((r) =>
          pushUnlocked(r.data || [])
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
            <View style={styles.topicContentContainer}>
              <ConversationItem
                item={item}
                onPress={() => {
                  router.back();
                }}
              />
            </View>
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
