import CommonHeader from "@/components/CommonHeader";
import {
  fetchLeaderboardRanks,
  fetchUserPlayerRank,
} from "@/services/supabase";
import useThemeStore from "@/store/themeStore";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, s } from "react-native-size-matters";

const PAGE_SIZE = 10;

const LeaderboardScreen = () => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();

  const [leaderboardData, setLeaderboardData] = useState<PlayerRank[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<PlayerRank | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const { data: ranksData, error: ranksError } =
          await fetchLeaderboardRanks(PAGE_SIZE, 0);
        if (ranksError) throw ranksError;
        if (ranksData) setLeaderboardData(ranksData);

        const { data: userRankData, error: userRankError } =
          await fetchUserPlayerRank();
        if (userRankError && userRankError.code !== "PGRST116") {
          // PGRST116: single row not found
          throw userRankError;
        }
        if (userRankData) setCurrentUserRank(userRankData);
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
        // Handle error display if needed
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreData) {
      return;
    }

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    const offset = nextPage * PAGE_SIZE;

    try {
      const { data: ranksData, error: ranksError } =
        await fetchLeaderboardRanks(PAGE_SIZE, offset);

      if (ranksError) throw ranksError;

      if (ranksData && ranksData.length > 0) {
        setLeaderboardData((prevData) => [...prevData, ...ranksData]);
        setCurrentPage(nextPage);
        setHasMoreData(ranksData.length === PAGE_SIZE);
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error("Failed to fetch more leaderboard data:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderItem = ({ item }: { item: PlayerRank }) => (
    <View style={[styles.leaderboardItem, { backgroundColor: colors.card }]}>
      <Text style={[styles.rank, { color: colors.textSecondary }]}>
        {item.rank}
      </Text>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Text style={[styles.name, { color: colors.textPrimary }]}>
        {item.name}
      </Text>
      <Text style={[styles.score, { color: colors.primary }]}>
        {item.total_score.toLocaleString()}{" "}
        {t("leaderboard.pointsSuffix", "PT")}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <CommonHeader title={t("leaderboard.title", "Leaderboard")} />
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={leaderboardData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.contentContainer,
            currentUserRank ? { paddingBottom: s(70) } : {}, // Add padding if current user rank is shown
          ]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("leaderboard.empty", "Leaderboard is empty.")}
            </Text>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} />
            ) : null
          }
        />
      )}
      {currentUserRank && !isLoading && (
        <View
          style={[
            styles.currentUserRankContainer,
            {
              backgroundColor: colors.primaryDark,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.currentUserRankText,
              styles.rank,
              { color: colors.card },
            ]}
          >
            {t("leaderboard.rank", "Rank")}: {currentUserRank.rank}
          </Text>
          <Text
            style={[
              styles.currentUserRankText,
              styles.name,
              { color: colors.card, textAlign: "center" },
            ]}
          >
            {t("common.you", "You")}
          </Text>
          <Text
            style={[
              styles.currentUserRankText,
              styles.score,
              { color: colors.card, textAlign: "right" },
            ]}
          >
            {currentUserRank.total_score.toLocaleString()}{" "}
            {t("leaderboard.pointsSuffix", "PT")}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: "15@ms",
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "12@ms",
    paddingHorizontal: "15@ms",
    borderRadius: "8@s",
    marginBottom: "10@ms",
  },
  rank: {
    fontSize: "16@s",
    fontWeight: "bold",
    width: "60@s",
    textAlign: "center",
  },
  avatar: {
    width: "25@s",
    height: "25@s",
    borderRadius: "50@s",
  },
  name: {
    flex: 1,
    fontSize: "16@s",
    fontWeight: "500",
    paddingHorizontal: "8@s",
  },
  score: { fontSize: "16@s", fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: "20@ms", fontSize: "16@s" },
  currentUserRankContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: "12@ms",
    paddingHorizontal: "15@ms",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
  },
  currentUserRankText: {
    fontSize: "15@s",
    fontWeight: "bold",
  },
  footerLoader: {
    marginVertical: "20@ms",
  }
});

export default LeaderboardScreen;
