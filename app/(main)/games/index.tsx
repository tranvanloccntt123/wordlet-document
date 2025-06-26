import CommonHeader from "@/components/CommonHeader"; // Import CommonHeader
import IntroLoading from "@/components/IntroLoading";
import { SEARCH_LIMIT } from "@/constants";
import Colors from "@/constants/Colors";
import useQuery, { setQueryData } from "@/hooks/useQuery";
import { fetchGroups } from "@/services/supabase";
import useThemeStore from "@/store/themeStore"; // Import your theme store
import { getGroupKey } from "@/utils/string";
import { MaterialIcons } from "@expo/vector-icons"; // For icons
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native"; // Import necessary components
import { SafeAreaView } from "react-native-safe-area-context"; // Import SafeAreaView
import { ScaledSheet, s } from "react-native-size-matters"; // Import ScaledSheet and scaling units

const GroupListItem: React.FC<{ id: number }> = ({ id }) => {
  const { data: item } = useQuery({
    key: getGroupKey(id),
  });
  const colors = useThemeStore((state) => state.colors);
  const styles = createStyles(colors); // Create styles with theme colors
  const { t } = useTranslation(); // Specify namespaces

  // Placeholder for navigating to a game screen for a specific group
  const handleSelectGroupForGame = (groupId: number, groupName: string) => {
    // In a real app, you would navigate to a screen
    // where the user selects a game type for this group,
    // or directly to a default game screen passing the groupId.
    // Example: router.push(`/games/select-type?groupId=${groupId}`);
    // For now, we'll just show an alert.
    router.navigate({
      pathname: "/games/list",
      params: { groupId, groupName },
    });
    // You might navigate here, e.g.:
    // router.push(`/games/sort?groupId=${groupId}`); // Example navigation
  };
  return (
    !!item && (
      <TouchableOpacity
        style={[styles.groupItem, { backgroundColor: colors.card }]}
        onPress={() => handleSelectGroupForGame(item.id, item.name)}
      >
        <View style={styles.groupInfo}>
          <View style={styles.groupNameContainer}>
            <Text style={[styles.groupName, { color: colors.textPrimary }]}>
              {item.name}
            </Text>
            {item.is_boosted && (
              <View
                style={[styles.hotBadge, { backgroundColor: colors.error }]}
              >
                <Text style={[styles.hotText, { color: colors.card }]}>
                  HOT
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.wordCount, { color: colors.textSecondary }]}>
            {item?.words?.length > 1
              ? t("groups.wordCount_other", {
                  count: item.words.length,
                })
              : t("groups.wordCount_one", {
                  count: item.words.length,
                })}
          </Text>
        </View>
        <MaterialIcons
          name="play-circle-outline"
          size={s(28)}
          color={colors.primary}
        />
      </TouchableOpacity>
    )
  );
};

export default function Games() {
  const [supabaseData, setSupabaseData] = React.useState<number[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] =
    React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const canLoadMore = React.useRef<boolean>(true);
  const currentOffset = React.useRef("");
  const colors = useThemeStore((state) => state.colors); // Get theme colors
  const { t } = useTranslation(); // Specify namespaces

  const fetchData = async (isRefresh: boolean = false) => {
    if ((isLoadingHistory && !isRefresh) || !canLoadMore.current) {
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
      currentOffset.current = ""; // Reset offset for refresh
      canLoadMore.current = true; // Allow loading more after refresh
    } else {
      setIsLoadingHistory(true);
    }

    try {
      const { data: newItems, error } = await fetchGroups(
        SEARCH_LIMIT,
        currentOffset.current
      );

      if (error) throw error;

      if (!newItems || newItems.length === 0) {
        canLoadMore.current = false;
      } else {
        newItems.map((g) => setQueryData(getGroupKey(g.id), g));
        setSupabaseData((prevData) =>
          isRefresh ? newItems : [...prevData, ...newItems.map((v) => v.id)]
        );
        currentOffset.current = newItems[newItems.length - 1].created_at;
        if (newItems.length < SEARCH_LIMIT) canLoadMore.current = false;
      }
    } catch (e) {
      console.error("Failed to fetch group:", e);
      canLoadMore.current = false; // Stop trying if error
    } finally {
      setIsLoadingHistory(false);
      if (isRefresh) setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  const styles = createStyles(colors); // Create styles with theme colors

  const renderItem = React.useCallback(
    ({ item }: { item: number }) => <GroupListItem id={item} />,
    [colors, t] // Added colors and t to dependencies
  );

  const ListEmptyComponent = React.useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialIcons
          name="extension"
          size={s(70)}
          color={colors.textDisabled}
          style={styles.emptyIcon}
        />
        <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
          {t("games.noGroupsForGamesTitle")}
        </Text>
        <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
          {t("games.noGroupsForGamesSubtitle")}
        </Text>
        <TouchableOpacity
          style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/groups")} // Navigate to groups screen
        >
          <MaterialIcons
            name="add"
            size={s(20)}
            color={colors.card} // White or light color for text on primary background
          />
          <Text style={[styles.emptyStateButtonText, { color: colors.card }]}>
            {t("groups.title")}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [colors]
  );

  return (
    <IntroLoading isLoading={isLoadingHistory && !supabaseData.length}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <CommonHeader title={t("games.gameRoadmapTitle")} />
        <View style={styles.contentContainer}>
          <FlatList
            data={supabaseData}
            keyExtractor={(item) => `${item}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContentContainer}
            ListEmptyComponent={!isLoadingHistory ? ListEmptyComponent : null}
            onEndReached={() => fetchData()}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        </View>
      </SafeAreaView>
    </IntroLoading>
  );
}

// Use a function to create styles based on theme colors
const createStyles = (colors: typeof Colors.dark | typeof Colors.light) =>
  ScaledSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: "16@s",
    },
    listContentContainer: {
      paddingBottom: "20@ms", // Add padding at the bottom of the list
    },
    groupItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: "15@ms",
      paddingHorizontal: "15@ms",
      borderRadius: "10@s",
      marginBottom: "12@ms",
      // backgroundColor and borderColor applied via inline style
    },
    groupInfo: {
      flex: 1, // Allows text to take available space
      marginRight: "10@ms", // Space between text and icon
    },
    groupNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: "4@ms",
    },
    groupName: {
      fontSize: "18@s",
      fontWeight: "bold",
      marginBottom: "4@ms",
      // color applied via inline style
    },
    wordCount: {
      fontSize: "14@s",
      // color applied via inline style
    },
    hotBadge: {
      marginLeft: "8@s",
      paddingHorizontal: "8@s",
      paddingVertical: "2@s",
      borderRadius: "16@s",
      justifyContent: "center",
      alignItems: "center",
    },
    hotText: {
      fontSize: "8@s",
      fontWeight: "bold",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      textAlign: "center",
      alignItems: "center",
      paddingHorizontal: "30@ms",
      paddingTop: "50@vs",
    },
    emptyIcon: {
      marginBottom: "20@ms",
    },
    emptyText: {
      fontSize: "20@s",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "10@ms",
    },
    emptySubText: {
      fontSize: "15@s",
      textAlign: "center",
    },
    emptyStateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: "12@ms",
      paddingHorizontal: "25@ms",
      borderRadius: "25@s", // Make it a pill shape
      marginTop: "25@ms",
      // backgroundColor is applied via inline style
    },
    emptyStateButtonText: {
      fontSize: "16@s",
      fontWeight: "bold",
      marginLeft: "10@s",
    },
  });
