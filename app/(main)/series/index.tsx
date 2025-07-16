import AppLoading from "@/components/AppLoading";
import CommonHeader from "@/components/CommonHeader"; // Import the new CommonHeader
import useQuery, { setQueryData } from "@/hooks/useQuery";
import { getOwnerSeries } from "@/services/supabase";
import useThemeStore from "@/store/themeStore"; // Import theme store
import { getOwnerSeriesKey, getSerieDetailKey } from "@/utils/string";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, ms, s } from "react-native-size-matters";

const SerieItem: React.FC<{
  serieId: number;
}> = ({ serieId }) => {
  const { data: item } = useQuery<Series>({
    key: getSerieDetailKey(serieId),
  });

  const colors = useThemeStore((state) => state.colors); // Use theme colors

  // Placeholder for navigating to a game screen for a specific group
  const handleSelectGroupForGame = (groupId: number, groupName: string) => {
    // In a real app, you would navigate to a screen
    // where the user selects a game type for this group,
    // or directly to a default game screen passing the groupId.
    // Example: router.push(`/games/select-type?groupId=${groupId}`);
    // For now, we'll just show an alert.
    router.push({
      pathname: "/groups",
      params: { serieId: `${serieId}`, serieName: item.name },
    });
    // You might navigate here, e.g.:
    // router.push(`/games/sort           `?groupId=${groupId}`); // Example navigation
  };

  const editTab = Gesture.Tap()
    .onEnd((event) => {
      router.push({
        pathname: "/series/edit",
        params: {
          serieId: `${serieId}`,
          x: `${event.absoluteX || 0}`,
          y: `${event.absoluteY || 0}`,
          groupName: item?.name,
        },
      });
    })
    .runOnJS(true);

  const deleteTab = Gesture.Tap()
    .onEnd((event) => {
      router.push({
        pathname: "/series/delete",
        params: {
          serieId: `${serieId}`,
          x: `${event.absoluteX || 0}`,
          y: `${event.absoluteY || 0}`,
          serieName: item?.name,
        },
      });
    })
    .runOnJS(true);

  return (
    <View
      style={[
        styles.groupCard,
        {
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.groupInfo}>
        <Pressable onPress={() => handleSelectGroupForGame(item.id, item.name)}>
          <Text style={[styles.groupName, { color: colors.textPrimary }]}>
            {item?.name}
          </Text>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <GestureDetector gesture={editTab}>
          <MaterialIcons name="edit" size={s(22)} color={colors.primary} />
        </GestureDetector>
        <GestureDetector gesture={deleteTab}>
          <MaterialIcons name="delete" size={s(22)} color={colors.error} />
        </GestureDetector>
      </View>
    </View>
  );
};

const MySeries = () => {
  const { t } = useTranslation();
  const { colors } = useThemeStore(); // Use theme colors
  const { data: groups, isLoading } = useQuery<number[]>({
    key: getOwnerSeriesKey(),
    async queryFn() {
      const { error, data } = await getOwnerSeries();
      if (!error && !!data) {
        data.map((serie) => setQueryData(getSerieDetailKey(serie.id), serie));
        return data.map((v) => v.id);
      }
      return [];
    },
  });
  const addAnim = useSharedValue(0);

  const addButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(addAnim.value, [0, 1], [1, 50]),
        },
      ],
    };
  });

  const addIconStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(addAnim.value, [0, 0.15], [1, 0]),
    };
  });

  useFocusEffect(
    // Callback should be wrapped in `React.useCallback` to avoid running the effect too often.
    React.useCallback(() => {
      addAnim.value = withTiming(0, { duration: 500 });
    }, [])
  );

  const atGroupLimit = false;

  return (
    <AppLoading isLoading={isLoading}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.container}>
          <CommonHeader title={t("series.series")} />
          <FlatList
            data={groups}
            keyExtractor={(item) => `${item}`}
            renderItem={({ item }) => <SerieItem serieId={item} />}
            contentContainerStyle={styles.listContentContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="list"
                  size={s(70)}
                  color={colors.textDisabled}
                  style={styles.emptyIcon}
                />
                <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                  {t("groups.noGroups")}
                </Text>
                <Text
                  style={[styles.emptySubText, { color: colors.textSecondary }]}
                >
                  {t("groups.startManaging")}
                </Text>
              </View>
            }
          />
          <Animated.View
            style={[
              styles.addButton,
              {
                backgroundColor: atGroupLimit
                  ? colors.textDisabled
                  : colors.primary,
                shadowColor: colors.shadow,
              },
              addButtonStyle,
            ]}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => {
                if (atGroupLimit) {
                  Alert.alert(
                    t("groups.limitReachedTitle"),
                    t("groups.limitReachedMessage", { limit: 5 })
                  );
                  return;
                }
                addAnim.value = withTiming(1, { duration: 500 });
                setTimeout(() => {
                  router.push("/series/add");
                }, 600);
              }}
              disabled={atGroupLimit} // Disable the button if at limit
              activeOpacity={atGroupLimit ? 1 : 0.7} // Reduce opacity feedback when disabled
            >
              <Animated.View style={addIconStyle}>
                <MaterialIcons name="add" size={s(28)} color="#FFFFFF" />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>
    </AppLoading>
  );
};

export default MySeries;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  // Removed headerBar, backButton, and headerTitle styles as they are now handled by CommonHeader
  // If CommonHeader's default title style (ms(20)) is different from the previous "24@s",
  // you can pass a custom titleStyle to CommonHeader or adjust CommonHeader's default.
  // For this example, we'll use CommonHeader's default.
  groupCard: {
    // backgroundColor applied via inline style using theme
    borderRadius: "12@s",
    paddingVertical: "12@ms",
    paddingHorizontal: "15@ms",
    marginHorizontal: "15@ms",
    marginBottom: "12@ms",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Shadow for iOS
    shadowOffset: { width: 0, height: ms(2) },
    shadowOpacity: 0.1,
    shadowRadius: ms(4),
    // Elevation for Android
    elevation: 3,
  },
  groupInfo: {
    flex: 1, // Allows text to take available space and wrap if needed
    marginRight: "10@ms",
  },
  groupName: {
    fontSize: "17@s",
    fontWeight: "bold",
    marginBottom: "3@ms",
  },
  wordCount: {
    fontSize: "13@s",
  },
  actions: {
    flexDirection: "row",
    gap: "15@ms", // Increased gap for better touchability
    alignItems: "center",
  },
  addButton: {
    position: "absolute",
    bottom: "25@ms",
    right: "25@ms",
    // backgroundColor applied via inline style using theme
    borderRadius: "28@s", // Make it perfectly circular
    width: "56@s",
    height: "56@s",
    justifyContent: "center",
    alignItems: "center",
    // Shadow for iOS
    shadowOffset: { width: 0, height: ms(2) },
    shadowOpacity: 0.2,
    shadowRadius: ms(4),
    // Elevation for Android
    elevation: 5,
  },
  listContentContainer: {
    paddingBottom: "80@ms", // Ensure FAB doesn't overlap last item
    paddingTop: "5@ms",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "120@vs",
    paddingHorizontal: "30@ms",
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
  limitMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "10@ms",
    paddingHorizontal: "15@ms",
    marginHorizontal: "15@ms",
    marginBottom: "10@ms", // Space before the list starts
    borderRadius: "8@s",
  },
  limitMessageIcon: {
    marginRight: "10@s",
  },
  limitMessageText: {
    fontSize: "14@s",
    flex: 1, // Allow text to wrap
  },
});
