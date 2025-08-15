import AppLoading from "@/components/AppLoading";
import GameButtons from "@/components/GameButtons";
import useQuery from "@/hooks/useQuery";
import {
  addListWordLearning,
  deleteWordLearningByUserId,
  fetchGroupDetail,
} from "@/services/supabase";
import useThemeStore from "@/store/themeStore";
import useWordLearningStore from "@/store/wordLearningStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { getGroupKey } from "@/utils/string";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { s, ScaledSheet } from "react-native-size-matters";

const ReplaceRememberScreen = () => {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ groupId: string }>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { clear, pushData } = useWordLearningStore();
  const { data: group } = useQuery({
    key: getGroupKey(Number(params.groupId || "0")),
    async queryFn() {
      try {
        const res = await fetchGroupDetail(Number(params.groupId || ""));
        if (res.error) {
          throw "Failed to fetch group";
        }
        return res.data;
      } catch (e) {
        throw e;
      }
    },
  });
  return (
    <AppLoading isLoading={isLoading}>
      <View style={styles.container}>
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.alertTitle, { color: colors.textPrimary }]}>
            {t("common.confirm")}
          </Text>
          <Text
            style={[styles.alertDescription, { color: colors.textPrimary }]}
          >
            {t("remember.replaceRememberWord")}
          </Text>
          <GameButtons
            primaryButtonText={t("common.confirm")}
            skipButtonText={t("common.goBack")}
            onPrimaryPress={() => {
              setIsLoading(true);
              deleteWordLearningByUserId()
                .then((r) => {
                  addListWordLearning(group.words)
                    .then((r) => {
                      clear();
                      pushData(r.data || []);
                    })
                    .finally(() => {
                      setIsLoading(false);
                      router.back();
                    });
                })
                .catch(() => {
                  setIsLoading(false);
                  router.back();
                });
            }}
            onSkipPress={() => {
              router.back();
            }}
            fontSize={s(15)}
          />
        </View>
      </View>
    </AppLoading>
  );
};

export default ReplaceRememberScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: "16@s",
    borderRadius: "16@s",
    width: "300@s",
    gap: "8@s",
    justifyContent: "center",
    alignItems: "center",
  },
  alertTitle: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.subheading,
    }),
    textAlign: "center",
  },
  alertDescription: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
    textAlign: "center",
    marginBottom: "16@s",
  },
});
