import WordletBanner from "@/components/Banner";
import Post from "@/components/Post";
import { SEARCH_LIMIT } from "@/constants";
import useQuery, { setQueryData } from "@/hooks/useQuery";
import { fetchPosts } from "@/services/supabase/post";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { getPostKey, getPostListKey } from "@/utils/string";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { BannerAdSize } from "react-native-google-mobile-ads";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";

const NewFeed = () => {
  const colors = useThemeStore((state) => state.colors);
  const { data } = useQuery({
    key: getPostListKey(),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const currentOffset = React.useRef("");
  const canLoadMore = React.useRef<boolean>(true);
  const { t } = useTranslation();

  const fetchData = async (isRefresh: boolean = false) => {
    if ((isLoading && !isRefresh) || (!canLoadMore.current && !isRefresh)) {
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
      const { data: newItems, error } = await fetchPosts(
        SEARCH_LIMIT,
        currentOffset.current
      );

      if (error) throw error;

      if (!newItems || newItems.length === 0) {
        canLoadMore.current = false;
      } else {
        newItems.map((g) => setQueryData(getPostKey(g.id), g));
        setQueryData(getPostListKey(), (prevData: number[] | undefined) =>
          isRefresh
            ? newItems.map((v) => v.id)
            : [...(prevData || []), ...newItems.map((v) => v.id)]
        );
        currentOffset.current = newItems[newItems.length - 1].created_at;
        if (newItems.length < SEARCH_LIMIT) canLoadMore.current = false;
      }
    } catch (e) {
      console.error("Failed to fetch group:", e);
      canLoadMore.current = false; // Stop trying if error
    } finally {
      setIsLoading(false);
      if (isRefresh) setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const header = () => {
    return (
      <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
        <Pressable
          style={styles.shareSthBtn}
          onPress={() => router.navigate("/post/add")}
        >
          <Text style={[styles.placeholder, { color: colors.textDisabled }]}>
            {t("post.addPlaceholder").length > 30
              ? t("post.addPlaceholder").slice(0, 27) + "..."
              : t("post.addPlaceholder")}
          </Text>
        </Pressable>
      </View>
    );
  };
  const handleRefresh = () => {
    fetchData(true);
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.container}>
        <Animated.FlatList
          ListHeaderComponent={header}
          data={data}
          keyExtractor={(item, index) => `POST-${index}`}
          renderItem={({ item, index }) => (
            <>
              <Post postId={item} />
              {index === 0 && (
                <WordletBanner banner={BannerAdSize.INLINE_ADAPTIVE_BANNER} />
              )}
            </>
          )}
          onEndReached={() => fetchData()}
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
        />
      </SafeAreaView>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: "16@s",
    height: "50@vs",
    borderRadius: "50@s",
    marginVertical: "16@s",
  },
  placeholder: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
  },
  shareSthBtn: {
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: "24@s",
  },
});

export default NewFeed;
