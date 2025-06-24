import { TIME_LIMIT_MS } from "@/constants";
import { setQueryData } from "@/hooks/useQuery";
import { publishGroup, publishRevertGroup } from "@/services/supabase";
import useGroupPublishStore from "@/store/groupPublishStore";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import { getGroupKey } from "@/utils/string";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { s, ScaledSheet } from "react-native-size-matters";

const GroupExpandMenu: React.FC<{ group: Group; onClose: () => void }> = ({
  group,
  onClose,
}) => {
  const info = useInfoStore((state) => state.info);
  const colors = useThemeStore((state) => state.colors);
  const { setVisibleCountDownModal, lastUpdate, setLastUpdate } =
    useGroupPublishStore((state) => state);
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <View>
      {info?.user_id === group?.user_id && (
        <TouchableOpacity
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
          <View style={[styles.modalItem]}>
            <MaterialIcons
              name={group.is_publish ? "unpublished" : "publish"}
              size={s(22)}
              color={colors.textPrimary}
            />
            <Text style={[styles.modalItemText, { color: colors.textPrimary }]}>
              {group.is_publish ? t("common.revert") : t("common.publish")}
            </Text>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t("groups.publishDescription")}
          </Text>
        </TouchableOpacity>
      )}
      {info?.user_id !== group?.user_id && (
        <TouchableOpacity
          style={styles.modalItem}
          onPress={() => {
            // Handle Report
            onClose();
          }}
        >
          <MaterialIcons name="report" size={s(22)} color={colors.error} />
          <Text style={[styles.modalItemText, { color: colors.error }]}>
            Report Group
          </Text>
        </TouchableOpacity>
      )}
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
