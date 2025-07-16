import useQuery from "@/hooks/useQuery";
import { fetchGroupsInSerie } from "@/services/supabase";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import { getGroupsInSeries } from "@/utils/string";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";

const GroupItem: React.FC<{ item: Group }> = ({ item }) => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();

  const handlePress = () => {
    router.push({
      pathname: "/games/list",
      params: { groupId: item.id.toString(), groupName: item.name },
    });
  };

  const wordCount = item.words?.length || 0;

  return (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: colors.card }]}
      onPress={handlePress}
    >
      <Text
        style={[styles.itemName, { color: colors.textPrimary }]}
        numberOfLines={3}
      >
        {item.name}
      </Text>
      <Text style={[styles.itemWordCount, { color: colors.textSecondary }]}>
        {wordCount > 1
          ? t("groups.wordCount_other", { count: wordCount })
          : t("groups.wordCount_one", { count: wordCount })}
      </Text>
    </TouchableOpacity>
  );
};

const RecentGroups: React.FC<{ groupId: number; serieId: number }> = ({
  groupId,
  serieId,
}) => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const { data } = useQuery<Group[]>({
    key: getGroupsInSeries(serieId),
    async queryFn() {
      const response = await fetchGroupsInSerie(serieId);
      return response.data || [];
    },
  });

  const filterList = data?.filter((group) => group.id !== groupId) || [];

  if (!filterList.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {t("common.series")}
      </Text>
      <FlatList
        data={filterList}
        renderItem={({ item }) => <GroupItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    marginBottom: "10@vs",
  },
  title: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.caption,
    }),
    marginLeft: "16@s",
    marginBottom: "8@ms",
  },
  listContentContainer: {
    paddingHorizontal: "16@s",
  },
  itemContainer: {
    width: "140@s",
    height: "120@s",
    borderRadius: "10@s",
    padding: "12@s",
    marginRight: "12@s",
    justifyContent: "space-between",
  },
  itemName: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.body,
    }),
  },
  itemWordCount: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
    alignSelf: "flex-end",
  },
});

export default RecentGroups;
