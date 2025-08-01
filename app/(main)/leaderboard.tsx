import CommonHeader from "@/components/CommonHeader";
import CrownIcon from "@/components/CrownIcon";
import useQuery from "@/hooks/useQuery";
import { fetchLeaderboardRanks, getUserPlayerRank } from "@/services/supabase";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { formatScore } from "@/utils";
import { getCurrentRankKey, getTop100PlayersKey } from "@/utils/string";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, s, vs } from "react-native-size-matters";

const UserTopRank: React.FC<{
  player: PlayerRank;
  height: number;
  color: string;
  animOrder: number;
  rank: number;
}> = ({ player, height, color, animOrder, rank }) => {
  const { textPrimary } = useThemeStore((state) => state.colors);
  const heightAnim = useSharedValue(vs(50));

  const crownAnim = useSharedValue(0);

  React.useEffect(() => {
    heightAnim.value = withTiming(height, {
      duration: 500 * (animOrder || 0 + 1),
    });
  }, []);

  React.useEffect(() => {
    crownAnim.value = withDelay(
      500 * (animOrder || 0 + 1),
      withTiming(1, {
        duration: 500,
      })
    );
  }, [rank, animOrder]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      height: heightAnim.value,
    };
  });

  const crownContainerStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      crownAnim.value,
      [0, 1],
      [0, rank === 2 ? -42 : rank === 3 ? 20 : 0]
    );
    const translateX = interpolate(
      crownAnim.value,
      [0, 1],
      [0, rank === 2 ? -15 : rank === 3 ? 10 : 0]
    );
    const translateY = interpolate(
      crownAnim.value,
      [0, 1],
      [0, rank === 2 ? -5 : rank === 3 ? -3 : 0]
    );
    return {
      transform: [
        {
          rotate: `${rotation}deg`,
        },
        {
          translateX: translateX,
        },
        {
          translateY: translateY,
        },
      ],
    };
  });

  return (
    <Animated.View style={[containerStyle]}>
      <View style={[styles.topRankAvatar]}>
        <Image source={{ uri: player.avatar }} style={styles.avatar} />
        <Animated.View style={[styles.crownIconContainer, crownContainerStyle]}>
          <CrownIcon rank={rank as never} size={s(30)} />
        </Animated.View>
      </View>
      <Animated.View
        style={[styles.topRank, { backgroundColor: color, flex: 1 }]}
      />
      <Text style={[styles.topRankScore, { color: textPrimary }]}>
        {formatScore(player?.total_score || 0)}
      </Text>
    </Animated.View>
  );
};

const LeaderboardScreen = () => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();

  const { data: currentUserRank, isLoading: isCurrentRankLoading } = useQuery({
    key: getCurrentRankKey(),
    async queryFn() {
      const { data: userRankData } = await getUserPlayerRank();
      return userRankData;
    },
    delayTime: 400,
  });

  const { data: top100Players, isLoading: isTop100PlayersLoading } = useQuery({
    key: getTop100PlayersKey(),
    async queryFn() {
      const { data } = await fetchLeaderboardRanks(100, 0);
      return data || [];
    },
    delayTime: 200,
  });

  const renderItem = ({ item, index }: { item: PlayerRank; index: number }) =>
    !([0, 1, 2].includes(index) && item.total_score !== 0) ? (
      <View style={[styles.leaderboardItem, { backgroundColor: colors.card }]}>
        <Text style={[styles.rank, { color: colors.textSecondary }]}>
          {item.total_score === 0 ? "--" : item.rank}
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
    ) : (
      <></>
    );

  const TopRanking = () => {
    return (
      <View style={styles.topRankContainer}>
        {!!top100Players?.[1] && top100Players[1].total_score !== 0 && (
          <UserTopRank
            player={top100Players[1]}
            height={vs(140)}
            color={colors.warning}
            animOrder={2}
            rank={2}
          />
        )}
        {!!top100Players?.[0] && top100Players[0].total_score !== 0 && (
          <UserTopRank
            player={top100Players[0]}
            height={vs(180)}
            color={colors.success}
            animOrder={3}
            rank={1}
          />
        )}
        {!!top100Players?.[2] && top100Players[2].total_score !== 0 && (
          <UserTopRank
            player={top100Players[2]}
            height={vs(100)}
            color={colors.primary}
            animOrder={1}
            rank={3}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <CommonHeader title={t("leaderboard.title", "Leaderboard")} />
      {isTop100PlayersLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={top100Players}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.contentContainer,
            currentUserRank ? { paddingBottom: s(70) } : {}, // Add padding if current user rank is shown
          ]}
          ListHeaderComponent={
            <View style={styles.listHeaderContainer}>
              <Text style={[styles.top100Text, { color: colors.textPrimary }]}>
                {t("leaderboard.top100")}
              </Text>
              {!!top100Players?.[1] &&
                top100Players[1].total_score !== 0 &&
                TopRanking()}
            </View>
          }
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("leaderboard.empty", "Leaderboard is empty.")}
            </Text>
          }
        />
      )}
      {currentUserRank && !isCurrentRankLoading && (
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
            {t("leaderboard.rank", "Rank")}:{" "}
            {currentUserRank.total_score === 0 ? "--" : currentUserRank.rank}
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
  },
  top100Text: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.title,
    }),
  },
  listHeaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: "35@s",
  },
  topRankContainer: {
    flexDirection: "row",
    gap: "12@s",
    marginTop: "40@vs",
    height: "180@vs",
    alignItems: "flex-end",
  },
  topRank: {
    width: "60@s",
    borderRadius: "8@s",
    paddingBottom: "8@s",
    alignItems: "center",
  },
  topRankAvatar: {
    backgroundColor: "white",
    padding: 2,
    borderRadius: 100,
    alignSelf: "center",
    marginBottom: "8@s",
  },
  topRankScore: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.caption,
      fontFamily: FontFamilies.NunitoBlack,
    }),
    textAlign: "center",
  },
  crownIconContainer: {
    position: "absolute",
    top: "-18@s",
    alignSelf: "center",
  },
});

export default LeaderboardScreen;
