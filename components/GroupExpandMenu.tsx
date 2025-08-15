import { TIME_LIMIT_MS } from "@/constants";
import useQuery, { setQueryData } from "@/hooks/useQuery";
import {
  addListWordLearning,
  publishGroup,
  publishRevertGroup,
} from "@/services/supabase";
import {
  getOwnerReportOnGroup,
  inserReportOnGroup,
} from "@/services/supabase/report";
import useGroupPublishStore from "@/store/groupPublishStore";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import useWordLearningStore from "@/store/wordLearningStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { getGroupKey, getReportOnGroupKey } from "@/utils/string";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { s, ScaledSheet } from "react-native-size-matters";
import Toast from "react-native-toast-message";

const GroupExpandMenu: React.FC<{ group: Group; onClose: () => void }> = ({
  group,
  onClose,
}) => {
  const { data: reportData, isLoading } = useQuery({
    key: getReportOnGroupKey(group?.id || 0),
    async queryFn() {
      const response = await getOwnerReportOnGroup(group?.id || 0);
      return response.data;
    },
  });
  const [isMarkRememberLoading, setIsMarkRememebrLoading] =
    React.useState<boolean>(false);
  const { data, pushData } = useWordLearningStore();
  const info = useInfoStore((state) => state.info);
  const colors = useThemeStore((state) => state.colors);
  const { setVisibleCountDownModal, lastUpdate, setLastUpdate } =
    useGroupPublishStore((state) => state);
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <View style={{ gap: s(16) }}>
      {info?.user_id === group?.user_id && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            disabled={!group.is_publish && (group?.words?.length || 0) < 10}
            style={styles.button}
            onPress={async () => {
              if (
                !lastUpdate ||
                (lastUpdate &&
                  new Date().getTime() - lastUpdate.getTime() > TIME_LIMIT_MS)
              ) {
                try {
                  if (group.is_publish) {
                    await publishRevertGroup(group.id);
                    setQueryData<Group>(getGroupKey(group.id), (oldData) =>
                      !oldData ? oldData : { ...oldData, is_publish: false }
                    );
                  } else {
                    await publishGroup(group.id);
                    setQueryData<Group>(getGroupKey(group.id), (oldData) =>
                      !oldData ? oldData : { ...oldData, is_publish: true }
                    );
                  }
                  setLastUpdate(new Date());
                } catch (e) {}
              } else {
                setVisibleCountDownModal(true);
              }
              // Handle Publish
              onClose();
            }}
          >
            <View
              style={[
                styles.modalItem,
                {
                  opacity:
                    !group.is_publish && (group?.words?.length || 0) < 10
                      ? 0.5
                      : 1,
                },
              ]}
            >
              <MaterialIcons
                name={group.is_publish ? "unpublished" : "publish"}
                size={s(22)}
                color={colors.textPrimary}
              />
              <Text
                style={[styles.modalItemText, { color: colors.textPrimary }]}
              >
                {group.is_publish ? t("common.revert") : t("common.publish")}
              </Text>
            </View>
          </TouchableOpacity>
          {(group?.words?.length || 0) < 10 && (
            <Text style={[styles.description, { color: colors.accent }]}>
              *{t("groups.publishLimit")}
            </Text>
          )}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t("groups.publishDescription")}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t("groups.publishDescription2")}
          </Text>
        </View>
      )}
      {info?.user_id !== group?.user_id && (
        <TouchableOpacity
          style={styles.modalItem}
          disabled={!!reportData || isLoading}
          onPress={() => {
            // Handle Report
            inserReportOnGroup("Report", group?.id || 0).then((r) => {
              if (r.data) {
                setQueryData(getReportOnGroupKey(group?.id || 0), r.data);
                Toast.show({
                  type: "report",
                  text1: t("groups.reportBtnTxt"),
                  text2: t("groups.reportSuccess"),
                });
              }
            });
            onClose();
          }}
        >
          <MaterialIcons
            name="report"
            size={s(22)}
            color={!!reportData ? colors.textDisabled : colors.error}
          />
          <Text
            style={[
              styles.modalItemText,
              { color: !!reportData ? colors.textDisabled : colors.error },
            ]}
          >
            {!!reportData
              ? t("groups.reportSuccess")
              : t("groups.reportBtnTxt")}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.modalItem}
        disabled={!!reportData || isMarkRememberLoading}
        onPress={() => {
          if (data.length <= 25) {
            setIsMarkRememebrLoading(true);
            addListWordLearning(group.words)
              .then((r) => {
                pushData(r.data || []);
              })
              .finally(() => {
                setIsMarkRememebrLoading(false);
              });
          } else {
            router.navigate({
              pathname: "/replace-remember",
              params: {
                groupId: group.id,
              },
            });
          }
          onClose();
        }}
      >
        <Feather name="bookmark" size={s(22)} color={colors.textPrimary} />
        <Text style={[styles.modalItemText, { color: colors.textPrimary }]}>
          {t("remember.remember")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = ScaledSheet.create({
  modalContent: {
    padding: "15@ms",
    paddingBottom: "30@ms", // For safe area
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    gap: "8@s",
  },
  button: {
    gap: "8@s",
    paddingVertical: "16@s",
  },
  modalItemText: {
    marginLeft: "15@ms",
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.body,
    }),
  },
  description: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
});

export default GroupExpandMenu;
