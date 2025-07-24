import { decreaseSuggest } from "@/services/supabase";
import useAdMobStore from "@/store/admobStore";
import useEnergyStore from "@/store/energyStore";
import useGameStore from "@/store/gameStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { s, ScaledSheet } from "react-native-size-matters";
import WordSuggestionModal from "./WordSuggestionModal";

const SuggestButton: React.FC<{
  isCorrect?: boolean | null;
  currentWord?: Omit<WordStore, "id"> | null;
}> = ({ isCorrect, currentWord }) => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const suggest = useEnergyStore((state) => state.suggest);
  const setSuggest = useEnergyStore((state) => state.setSuggest);
  const checkSuggestAvailable = React.useRef<boolean>(false);
  const { user, group } = useGameStore();
  const [isSuggestModalVisible, setIsSuggestModalVisible] =
    React.useState(false);
  const loaded = useAdMobStore((state) => state.suggestRewardedLoaded);
  const rewarded = useAdMobStore((state) => state.suggestReward);
  const rewardSuccess = useAdMobStore((state) => state.suggestRewardSuccess);

  React.useEffect(() => {
    if (rewardSuccess) {
      setIsSuggestModalVisible(true);
      checkSuggestAvailable.current = true;
    }
  }, [rewardSuccess]);

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!checkSuggestAvailable.current && group?.user_id !== user?.id) {
      if (suggest === 0 && !rewardSuccess) {
        //SHOW ADS
        loaded && rewarded?.show();
        return;
      } else {
        // Only allow suggestion if answer not submitted
        decreaseSuggest().then((response) => {
          if (response?.data?.data?.[0]) {
            setSuggest(response?.data?.data?.[0].suggest || 0);
          }
        });
      }
    }
    setIsSuggestModalVisible(true);
    checkSuggestAvailable.current = true;
  };

  const disabled =
    isCorrect !== null ||
    !currentWord ||
    (group?.user_id !== user?.id && !suggest && !loaded);

  return (
    !!currentWord && (
      <View>
        <TouchableOpacity
          onPress={onPress}
          style={[
            styles.suggestButton,
            {
              borderColor: disabled ? colors.textDisabled : colors.primary,
            },
          ]}
          disabled={disabled}
        >
          <MaterialIcons
            name="lightbulb-outline"
            size={s(18)}
            color={disabled ? colors.textDisabled : colors.primary}
          />
          <Text
            style={[
              styles.suggestButtonText,
              {
                color: disabled ? colors.textDisabled : colors.primary,
              },
            ]}
          >
            {t("games.suggestButton")}
          </Text>
          {group?.user_id !== user?.id && (
            <View
              style={[
                styles.suggestNumberContainer,
                {
                  backgroundColor: disabled
                    ? colors.textDisabled
                    : colors.primary,
                },
              ]}
            >
              <Text style={[styles.suggestNumberText, { color: colors.card }]}>
                {suggest || "AD"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <WordSuggestionModal
          isVisible={isSuggestModalVisible}
          onClose={() => setIsSuggestModalVisible(false)}
          wordDetail={currentWord}
        />
      </View>
    )
  );
};

const styles = ScaledSheet.create({
  suggestButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "8@vs",
    paddingHorizontal: "10@s",
    borderRadius: "30@s",
    borderWidth: 1,
    marginBottom: "20@ms", // Space before submit button or feedback
    gap: "8@s",
  },
  suggestButtonText: {
    fontSize: "14@s",
    fontWeight: "600",
    marginLeft: "8@s",
    marginRight: "8@s",
  },
  suggestNumberContainer: {
    width: "30@s",
    height: "30@s",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "30@s",
  },
  suggestNumberText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
});

export default SuggestButton;
