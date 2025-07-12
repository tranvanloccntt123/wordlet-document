import AppLoading from "@/components/AppLoading";
import CommonHeader from "@/components/CommonHeader"; // Import the new CommonHeader
import EditGroupModal from "@/components/EditGroupModal"; // Import the moved component
import { GROUP_LIMIT } from "@/constants";
import useQuery, { setQueryData } from "@/hooks/useQuery";
import { updateGroupInfo } from "@/services/groupServices";
import { getOwnerGroup } from "@/services/supabase";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore"; // Import theme store
import { getGroupKey, getOwnerGroupKey } from "@/utils/string";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
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

const GroupItem: React.FC<{
  groupId: number;
  onOpenEdit: (item: Group) => void;
}> = ({ groupId, onOpenEdit }) => {
  const { t } = useTranslation(); // Initialize useTranslation for the 'groups' namespace

  const { data: item } = useQuery({
    key: getGroupKey(groupId),
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
      pathname: "/games/list",
      params: { groupId, groupName },
    });
    // You might navigate here, e.g.:
    // router.push(`/games/sort?groupId=${groupId}`); // Example navigation
  };

  const editTab = Gesture.Tap()
    .onEnd((event) => {
      router.push({
        pathname: "/groups/edit",
        params: {
          groupId: `${groupId}`,
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
        pathname: "/groups/delete",
        params: {
          groupId: `${groupId}`,
          x: `${event.absoluteX || 0}`,
          y: `${event.absoluteY || 0}`,
          groupName: item?.name,
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
        <Text style={[styles.wordCount, { color: colors.textSecondary }]}>
          {(item?.words?.length || 0) > 1
            ? t("groups.wordCount_other", {
                count: item?.words?.length || 0,
              })
            : t("groups.wordCount_one", {
                count: item?.words?.length || 0,
              })}
        </Text>
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

const GroupManagementScreen = () => {
  const { data: groups, isLoading: isFetchGroupLoading } = useQuery<number[]>({
    key: getOwnerGroupKey(),
    async queryFn() {
      const { error, data } = await getOwnerGroup();
      if (!error && !!data) {
        data.map((group) => setQueryData(getGroupKey(group.id), group));
        return data.map((v) => v.id);
      }
      return [];
    },
  });
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const userInfo = useInfoStore((state) => state.info);
  const { colors } = useThemeStore(); // Use theme colors
  const { t } = useTranslation(); // Initialize useTranslation for the 'groups' namespace
  const [currentEditingGroup, setCurrentEditingGroup] = useState<Group | null>(
    null
  );
  const addAnim = useSharedValue(0);
  const atGroupLimit =
    !userInfo?.is_premium && (groups?.length || 0) >= GROUP_LIMIT;

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const addGroup = async () => {
    if (atGroupLimit) {
      Alert.alert(
        t("groups.limitReachedTitle"),
        t("groups.limitReachedMessage", { limit: GROUP_LIMIT })
      );
      return;
    }
    addAnim.value = withTiming(1, { duration: 500 });
    setTimeout(() => {
      router.push("/groups/add");
    }, 600);
    // setIsLoading(true); // Keep loading indicator for the createGroup async operation
    // try {
    //   await createGroupInfo(); // This will internally check the limit again if you modify createGroup store logic
    // } catch (e) {}
    // setIsLoading(false); // Stop loading indicator
  };

  const openEditModal = (group: Group) => {
    setCurrentEditingGroup(group);
    bottomSheetRef.current?.expand();
  };

  const closeEditModal = () => {
    bottomSheetRef.current?.close();
    setCurrentEditingGroup(null);
  };

  const handleSaveGroupName = async (groupId: number, newName: string) => {
    bottomSheetRef.current?.close();
    await updateGroupInfo(groupId, (oldData) =>
      !oldData
        ? oldData
        : {
            ...oldData,
            name: newName,
          }
    );
  };

  useFocusEffect(
    // Callback should be wrapped in `React.useCallback` to avoid running the effect too often.
    React.useCallback(() => {
      addAnim.value = withTiming(0, { duration: 500 });
    }, [])
  );

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

  return (
    <AppLoading isLoading={isFetchGroupLoading || isLoading}>
      <View style={styles.container}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <CommonHeader title={t("groups.title")} />
          {atGroupLimit && (
            <View
              style={[
                styles.limitMessageContainer,
                {
                  backgroundColor:
                    colors.textDisabled ||
                    colors.textDisabled ||
                    colors.warning,
                },
              ]}
            >
              <MaterialIcons
                name="info-outline"
                size={s(20)}
                color={colors.warning || colors.warning || colors.textPrimary}
                style={styles.limitMessageIcon}
              />
              <Text
                style={[
                  styles.limitMessageText,
                  {
                    color:
                      colors.warning || colors.warning || colors.textPrimary,
                  },
                ]}
              >
                {t("groups.limitReachedMessage", { limit: GROUP_LIMIT })}
              </Text>
            </View>
          )}
          <FlatList
            data={groups}
            keyExtractor={(item) => `${item}`}
            renderItem={({ item }) => (
              <GroupItem
                groupId={item}
                onOpenEdit={(item) => {
                  openEditModal(item);
                }}
              />
            )}
            contentContainerStyle={styles.listContentContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="folder-special"
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
              onPress={addGroup}
              disabled={atGroupLimit} // Disable the button if at limit
              activeOpacity={atGroupLimit ? 1 : 0.7} // Reduce opacity feedback when disabled
            >
              <Animated.View style={addIconStyle}>
                <MaterialIcons name="add" size={s(28)} color="#FFFFFF" />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
          <BottomSheet
            index={-1}
            ref={bottomSheetRef}
            snapPoints={["25%"]}
            enableDynamicSizing={true}
            backdropComponent={BottomSheetBackdrop}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            backgroundStyle={{
              backgroundColor: colors.card,
            }}
          >
            <BottomSheetView style={{ paddingHorizontal: s(20) }}>
              <EditGroupModal
                onClose={closeEditModal}
                group={currentEditingGroup}
                onSave={handleSaveGroupName}
                colors={colors}
              />
            </BottomSheetView>
          </BottomSheet>
        </SafeAreaView>
      </View>
    </AppLoading>
  );
};

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

export default GroupManagementScreen;
