import AppAudio from "@/assets/audio";
import AppLoading from "@/components/AppLoading";
import WordletBanner from "@/components/Banner";
import CommonHeader from "@/components/CommonHeader";
import CountdownModal from "@/components/CountdownModal";
import GroupExpandMenu from "@/components/GroupExpandMenu";
import ListWordInOrder from "@/components/ListWordInOrder";
import RecentGroups from "@/components/RecentGroups";
import { TIME_LIMIT_MS } from "@/constants";
import useQuery from "@/hooks/useQuery";
import { fetchGroupDetail } from "@/services/supabase";
import useGroupPublishStore from "@/store/groupPublishStore";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { energyCheck } from "@/utils/energy";
import { getGroupKey } from "@/utils/string";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useAudioPlayer } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router"; // Import router
import React from "react"; // Import useEffect, useState
import { useTranslation } from "react-i18next"; // Import useTranslation
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import Rive from "rive-react-native";

const LimitCountDownModal: React.FC<object> = () => {
  const { lastUpdate, visibleCountDownModal, setVisibleCountDownModal } =
    useGroupPublishStore((state) => state);
  return (
    <CountdownModal
      visible={!!lastUpdate && visibleCountDownModal}
      seconds={Math.round(
        (TIME_LIMIT_MS -
          (new Date().getTime() - (lastUpdate?.getTime() || 0))) /
          1000
      )}
      onFinish={function (): void {
        // throw new Error("Function not implemented.");
        setVisibleCountDownModal(false);
      }}
      onClose={function (): void {
        // throw new Error("Function not implemented.");
        setVisibleCountDownModal(false);
      }}
      maxSeconds={60}
    />
  );
};

export default function SelectGameScreen() {
  const colors = useThemeStore((state) => state.colors);
  const info = useInfoStore((state) => state.info);
  const params = useLocalSearchParams<{ groupId: string; groupName: string }>();
  const playerVictory = useAudioPlayer(AppAudio.VICTORY);
  const { groupId, groupName } = params;
  const [challengeVisible, setChallengeVisible] = React.useState(false);
  const { isLoading, data: group } = useQuery({
    key: getGroupKey(Number(groupId || "0")),
    async queryFn() {
      try {
        const res = await fetchGroupDetail(Number(groupId || ""));
        if (res.error) {
          throw "Failed to fetch group";
        }
        return res.data;
      } catch (e) {
        throw e;
      }
    },
  });

  React.useEffect(() => {
    if (challengeVisible) {
      playerVictory.seekTo(0);
      playerVictory.play();
    }
  }, [challengeVisible]);

  const { t } = useTranslation(); // Initialize useTranslation
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const onOpenMenu = () => {
    bottomSheetRef.current?.expand();
    // modalizeRef.current?.open();
  };

  // Define GAME_CATEGORIES using translations
  const GAME_CATEGORIES = [
    {
      id: "sort-characters",
      titleKey: "games.sortCharactersTitle",
      descriptionKey: "games.sortCharactersDescription",
      icon: "sort-by-alpha" as const,
    },
    {
      id: "choose-word-from-translation",
      titleKey: "games.wordFromTranslationTitle",
      descriptionKey: "games.wordFromTranslationDescription",
      icon: "translate" as const,
    },
    {
      id: "choose-translation-from-voice",
      titleKey: "games.translationFromVoiceTitle",
      descriptionKey: "games.translationFromVoiceDescription",
      icon: "g-translate" as const,
    },
    {
      id: "speak-and-compare",
      titleKey: "games.speakAndCompareTitle",
      descriptionKey: "games.speakAndCompareDescription",
      icon: "mic" as const,
    },
    // Add more game types here following the same pattern
  ];

  const getGameDisabledState = (gameId: string): boolean => {
    const numWords = group?.words?.length ?? 0;
    switch (gameId) {
      case "sort-characters":
        return numWords === 0;
      case "choose-word-from-translation":
        return numWords < 4;
      case "choose-translation-from-voice":
        // This game type routes to 'type-correct-from-voice' which needs at least 1 word.
        return numWords === 0;
      case "speak-and-compare":
        // This game needs at least 1 word.
        return numWords === 0;
      default:
        return false;
    }
  };

  const handleSelectGameType = (gameTypeId: string, gameTitle: string) => {
    // Navigation will be prevented by TouchableOpacity's disabled prop if conditions aren't met.
    if (gameTypeId === "sort-characters") {
      router.push({
        pathname: "/games/sort",
        params: { groupId }, // Pass groupId to the sort game screen
      });
    } else if (gameTypeId === "choose-word-from-translation") {
      router.push({
        pathname: "/games/choose-correct",
        params: { groupId }, // Pass groupId to the sort game screen
      });
    } else if (gameTypeId === "speak-and-compare") {
      router.push({
        pathname: "/games/speak-and-compare",
        // Speak & Compare doesn't currently use groupId, but you could pass it if needed later
        params: { groupId },
      });
    } else {
      // Default or placeholder for other game types not explicitly handled
      // This currently routes to type-correct-from-voice, adjust if needed
      console.warn(`Unhandled game type selected: ${gameTypeId}`);
      // Optionally navigate to a default game or show a message
      router.push({
        pathname: "/games/type-correct-from-voice",
        params: { groupId }, // Pass groupId to the sort game screen
      });
    }
  };

  const handleNavigateToCreateWord = () => {
    router.push({
      pathname: "/games/create-word", // Make sure this path matches your file system router setup
      params: { groupId: group?.id, groupName: group?.name },
    });
  };

  const isChallent =
    !isLoading && !!info && !!group && info.user_id !== group.user_id;

  React.useEffect(() => {
    if (isChallent) {
      setTimeout(() => {
        setChallengeVisible(true);
      }, 100);
    }
  }, [isLoading, info, group]);

  const isAuthor = !!info && !!group && info.user_id === group.user_id;

  return (
    <AppLoading isLoading={isLoading}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <CommonHeader
          title={groupName || ""}
          rightActionElement={
            <TouchableOpacity
              onPress={onOpenMenu}
              style={[styles.headerButton, { backgroundColor: colors.card }]}
            >
              <MaterialIcons
                name="more-vert"
                size={s(18)}
                color={colors.textPrimary}
              />
              {isAuthor && (
                <View
                  style={[
                    styles.publicStatusContainer,
                    {
                      backgroundColor: group.is_publish
                        ? colors.success
                        : colors.accent,
                    },
                  ]}
                ></View>
              )}
            </TouchableOpacity>
          }
        />
        <FlatList
          data={GAME_CATEGORIES}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {!!group?.description && (
                <View style={{ marginTop: vs(16) }}>
                  <Text
                    style={[
                      styles.carouselTitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t("groups.groupDescription")}
                  </Text>
                  <View
                    style={[
                      styles.emptyWordsContainer,
                      {
                        backgroundColor: colors.card,
                        alignItems: "flex-start",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.gameTextContainer,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {group.description}
                    </Text>
                  </View>
                </View>
              )}
              {!!group && group.words && group.words.length > 0 ? (
                <View style={styles.carouselSectionContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={[
                        styles.carouselTitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {t("games.wordsInThisGroup", {
                        count: group.words.length,
                      })}
                    </Text>
                    {isAuthor && (
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/search?groupId=${group.id}`)
                        }
                        style={{ marginRight: s(16) }}
                      >
                        <MaterialIcons
                          name="add"
                          size={s(20)}
                          color={colors.textPrimary}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <ListWordInOrder group={group} />
                </View>
              ) : !!group && (!group.words || group.words.length === 0) ? (
                info?.user_id === group.user_id ? (
                  <View
                    style={[
                      styles.emptyWordsContainer,
                      { backgroundColor: colors.card, marginTop: s(10) },
                    ]}
                  >
                    <View style={styles.emptyWordsContent}>
                      <Text
                        style={[
                          styles.emptyWordsText,
                          { color: colors.warning },
                        ]}
                      >
                        {t("games.noWordsInGroupMessage")}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.addWordsButton,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={() =>
                          router.push(`/search?groupId=${group.id}`)
                        }
                      >
                        <MaterialIcons
                          name="search"
                          size={s(18)}
                          color={colors.card}
                        />
                        <Text
                          style={[
                            styles.addWordsButtonText,
                            { color: colors.card },
                          ]}
                        >
                          {t("games.findWordsToAdd")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.emptyWordsContainer,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <View style={styles.emptyWordsContent}>
                      <Text
                        style={[
                          styles.emptyWordsText,
                          { color: colors.warning, marginBottom: 0 },
                        ]}
                      >
                        {t("games.noWordsMessage")}
                      </Text>
                    </View>
                  </View>
                )
              ) : (
                <></>
              )}
              {info?.user_id === group?.user_id && (
                <TouchableOpacity
                  style={[styles.gameItem, { backgroundColor: colors.card }]}
                  onPress={handleNavigateToCreateWord} // Navigate to groups screen
                >
                  <MaterialIcons
                    name="add"
                    size={s(20)}
                    color={colors.textPrimary} // White or light color for text on primary background
                  />
                  <Text
                    style={[
                      styles.addWordsButtonText,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {t("games.createWordForGroupTitle")}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          }
          renderItem={({ item, index }) => {
            const isDisabled = getGameDisabledState(item.id);
            const itemOpacity = isDisabled ? 0.5 : 1;
            const iconColor = isDisabled ? colors.textDisabled : colors.primary;
            const titleColor = isDisabled
              ? colors.textDisabled
              : colors.textPrimary;
            const descriptionColor = isDisabled
              ? colors.textDisabled
              : colors.textSecondary;
            const chevronColor = isDisabled
              ? colors.textDisabled
              : colors.textSecondary;

            return (
              <>
                <TouchableOpacity
                  style={[
                    styles.gameItem,
                    { backgroundColor: colors.card, opacity: itemOpacity },
                  ]}
                  onPress={() =>
                    group.user_id === info?.user_id
                      ? handleSelectGameType(item.id, t(item.titleKey))
                      : energyCheck(() => {
                          handleSelectGameType(item.id, t(item.titleKey));
                        })
                  }
                  disabled={isDisabled}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={s(30)}
                    color={iconColor}
                    style={styles.gameIcon}
                  />
                  <View style={styles.gameTextContainer}>
                    <Text style={[styles.gameTitle, { color: titleColor }]}>
                      {t(item.titleKey)}
                    </Text>
                    <Text
                      style={[
                        styles.gameDescription,
                        { color: descriptionColor },
                      ]}
                    >
                      {t(item.descriptionKey)} {/* Translate description */}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={s(24)}
                    color={chevronColor}
                  >
                    {/* Removed duplicate chevron icon definition */}
                  </MaterialIcons>
                </TouchableOpacity>
                {index === 1 && isChallent && <WordletBanner />}
              </>
            );
          }}
          contentContainerStyle={styles.listContentContainer}
          ListFooterComponent={
            <>
              {!!group?.series_id && (
                <RecentGroups groupId={group.id} serieId={group.series_id} />
              )}
            </>
          }
        />
        <BottomSheet
          index={-1}
          ref={bottomSheetRef}
          snapPoints={[info?.user_id === group?.user_id ? "30%" : "15%"]}
          enableDynamicSizing={true}
          backdropComponent={BottomSheetBackdrop}
          backgroundStyle={{
            backgroundColor: colors.card,
          }}
        >
          <BottomSheetView style={{ paddingHorizontal: s(20) }}>
            <GroupExpandMenu
              group={group}
              onClose={() => bottomSheetRef.current?.close()}
            />
          </BottomSheetView>
        </BottomSheet>
        <LimitCountDownModal />
        <Modal
          visible={challengeVisible}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
        >
          <View style={[styles.alertModalContainer]}>
            <View style={styles.alertContentContainer}>
              <Rive
                resourceName={"winner"}
                style={{ width: s(200), height: s(200), alignSelf: "center" }}
              />
              <Text style={[styles.alertTitle]}>
                {t("games.othersGroupGameAlertTitle")}
              </Text>
              <Text style={[styles.alertDescription]}>
                {t("games.othersGroupGameAlertMessage")}
              </Text>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.primaryButton,
                  {
                    backgroundColor: colors.warning,
                  },
                ]}
                onPress={() => setChallengeVisible(false)}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    styles.primaryButtonText,
                    { color: "black" },
                  ]}
                >
                  {t("common.letGo")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </AppLoading>
  );
}

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
  },
  headerButton: {
    padding: "5@s",
    width: "30@s",
    height: "30@s",
    borderRadius: "30@s",
    alignItems: "center",
    justifyContent: "center",
  },
  listContentContainer: {
    paddingTop: "10@ms",
    paddingBottom: "20@ms",
  },
  carouselSectionContainer: {
    marginVertical: "10@ms",
    height: "300@vs",
  },
  carouselTitle: {
    fontSize: "14@s",
    fontWeight: "600",
    marginLeft: "15@ms",
    marginBottom: "8@ms",
  },
  // Styles for game selection items
  gameItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: "15@ms",
    borderRadius: "10@s",
    marginVertical: "8@ms",
    marginHorizontal: "16@s",
  },
  gameIcon: {
    marginRight: "15@ms",
  },
  gameTextContainer: {
    flex: 1,
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.caption,
      fontFamily: FontFamilies.NunitoRegular,
    }),
  },
  gameTitle: {
    fontSize: "17@s",
    fontWeight: "bold",
    marginBottom: "3@ms",
  },
  gameDescription: {
    fontSize: "13@s",
  },
  emptyWordsContainer: {
    padding: "15@ms",
    marginHorizontal: "16@s",
    marginBottom: "10@s",
    borderRadius: "10@s",
    // marginTop: "10@ms", // Already part of marginVertical
    alignItems: "center", // Center the content if it's a single block
  },
  emptyWordsContent: {
    alignItems: "center", // Center text and button
    width: "100%",
  },
  emptyWordsText: {
    fontSize: "14@s",
    textAlign: "center",
    lineHeight: "20@s",
    marginBottom: "15@ms", // Add space between text and button
  },
  addWordsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "10@ms",
    paddingHorizontal: "20@ms",
    borderRadius: "20@s", // Pill shape
  },
  addWordsButtonText: {
    fontSize: "14@s",
    fontWeight: "bold",
    marginLeft: "8@s",
  },
  modalContent: {
    padding: "15@ms",
    paddingBottom: "30@ms", // For safe area
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "15@ms",
  },
  modalItemText: {
    fontSize: "16@s",
    marginLeft: "15@ms",
    fontWeight: "600",
  },

  alertModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContentContainer: {
    backgroundColor: "white",
    borderRadius: "16@s",
    padding: "20@s",
    width: "300@s",
    gap: "8@s",
  },
  alertTitle: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.subheading,
    }),
    textAlign: "center",
    color: "black",
  },
  alertDescription: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
    textAlign: "center",
    color: "black",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: "20@ms",
    marginBottom: "20@ms",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    paddingVertical: "10@ms",
    paddingHorizontal: "20@ms",
    borderRadius: "8@s",
    minWidth: "100@s",
    alignItems: "center",
  },
  primaryButton: {
    // backgroundColor: colors.warning,
  },
  skipButton: {
    // backgroundColor: colors.shadow,
  },
  // Use the getAppFontStyle utility for font styling
  actionButtonText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack, // Choose the base font family
      fontSizeKey: FontSizeKeys.heading, // Choose the size key
    }),
  },
  primaryButtonText: {
    // color: colors.card,
  },
  skipButtonText: {
    // color: colors.textSecondary,
  },
  publicStatusContainer: {
    marginLeft: "16@s",
    width: "8@s",
    height: "8@s",
    borderRadius: "100@s",
    alignSelf: "flex-start",
    position: "absolute",
    top: "0@s",
    right: "0@s",
  },
  publishStatusTxt: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
});
