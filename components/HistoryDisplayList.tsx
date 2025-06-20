import { fetchUserGameHistory } from "@/services/supabase";
import useInfoStore from "@/store/infoStore";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { formatDate } from "@/utils/date";
import { MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  PixelRatio,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScaledSheet, ms, s, verticalScale } from "react-native-size-matters";
import Svg, {
  Defs,
  G,
  Stop,
  LinearGradient as SvgLinearGradient,
  Path as SvgPath,
} from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import AppLoading from "./AppLoading";
import EmptyHistoryList from "./EmptyHistoryList";

const PAGE_SIZE = 10;

const HistoryDisplayItem: React.FC<{ item: GameHistory }> = ({ item }) => {
  const { colors } = useThemeStore();
  const ref = React.useRef<View>(null);
  const path1String =
    "M63,224 C89.509,224 111,202.51 111,176 C111,176 111,154 111,154 C111,154 145,154 145,154 C145,154 145,176 145,176 C145,202.51 167,224 193,224 C219,224 29.42,224 63,224 Z";
  const path2String =
    "M193,256 C193,256 63,256 63,256 C54.163,256 47,248.836 47,240 C47,231.163 54.163,224 63,224 C72.287,224 183.976,224 193,224 C201.836,224 209,231.163 209,240 C209,248.836 201.836,256 193,256 Z";
  const path3String =
    "M248,62 C248,62 236,62 236,62 C217.222,62 201,77.222 201,96 C201,96 195,96 195,96 C195,96 195,62 195,62 C197.78,48.307 209.486,38 224,38 C224,38 248,38 248,38 C252.418,38 256,41.582 256,46 C256,46 256,54 256,54 C256,58.418 252.418,62 248,62 ZM20,62 C20,62 8,62 8,62 C3.582,62 0,58.418 0,54 C0,54 0,46 0,46 C0,41.582 3.582,38 8,38 C8,38 32,38 32,38 C46.513,38 58.22,48.307 61,62 C61,62 61,96 61,96 C61,96 55,96 55,96 C55,77.222 38.778,62 20,62 Z";
  const path4String =
    "M54,32 C54,32 202,32 202,32 C202,32 202,98 202,98 C202,138.869 168.869,172 128,172 C87.131,172 54,138.869 54,98 C54,98 54,32 54,32 Z";
  const path5String =
    "M52,0 C52,0 204,0 204,0 C208.418,0 212,3.582 212,8 C212,8 212,16 212,16 C212,20.418 208.418,24 204,24 C204,24 52,24 52,24 C47.582,24 44,20.418 44,16 C44,16 44,8 44,8 C44,3.582 47.582,0 52,0 Z";
  const path6String =
    "M162.856,90.349 C157.186,96.253 149.864,104.224 149.864,104.224 C149.864,104.224 151.121,114.155 152.104,122.143 C153.122,130.408 148.536,129.653 143.551,127.407 C136.369,124.171 128,120.112 128,120.112 C128,120.112 119.631,124.171 112.449,127.407 C107.464,129.653 102.877,130.408 103.895,122.143 C104.879,114.155 106.136,104.224 106.136,104.224 C106.136,104.224 98.814,96.253 93.144,90.349 C90.272,87.359 89.502,83.284 95.639,82.135 C103.704,80.624 114.487,78.513 114.487,78.513 C114.487,78.513 119.123,67.961 123.261,60.785 C125.386,57.099 130.614,57.099 132.739,60.785 C136.877,67.961 141.513,78.513 141.513,78.513 C141.513,78.513 152.296,80.624 160.361,82.135 C166.497,83.284 165.728,87.359 162.856,90.349 Z";

  const handleShareItem = async (item: GameHistory) => {
    if (!(await Sharing.isAvailableAsync())) {
      alert("Sharing is not available on this device.");
      return;
    }
    if (!!ref.current) {
      const targetPixelCount = 1080; // If you want full HD pictures
      const pixelRatio = PixelRatio.get(); // The pixel ratio of the device
      const pixels = targetPixelCount / pixelRatio;
      const result = await captureRef(ref, {
        result: "tmpfile",
        height: pixels,
        width: pixels,
        quality: 1,
        format: "png",
      });

      await Sharing.shareAsync(result, {
        mimeType: "image/png",
        UTI: "public.png",
      });
    }
  };
  return (
    <View style={[styles.itemContainer, { backgroundColor: colors.shadow }]}>
      <View
        ref={ref}
        collapsable={false}
        style={[
          styles.itemContentContainer,
          {
            backgroundColor: colors.card  ,
          },
        ]}
      >
        <Svg style={styles.canvas} viewBox="0 0 256 256">
          <Defs>
            <SvgLinearGradient id="cupGradient" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#fc9502" />
              <Stop offset="1" stopColor="#fcbe02" />
            </SvgLinearGradient>
          </Defs>
          <G transform={`translate(${verticalScale(2)} ${verticalScale(2)})`}>
            <SvgPath d={path1String} fill="#fcc402" />
            <SvgPath d={path2String} fill="#fce202" />
            <SvgPath d={path3String} fill="#fce202" />
            <SvgPath d={path4String} fill="url(#cupGradient)" />
            <SvgPath d={path5String} fill="#fcc402" />
            <SvgPath d={path6String} fill="#ffffff" />
          </G>
        </Svg>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.itemLogo}
        />
        {!!item.score && (
          <Text style={[styles.scoreText, { color: colors.accent }]}>
            {item.score} Pt
          </Text>
        )}
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {formatDate(new Date(item.created_at))}
        </Text>
        <Text
          style={[styles.messageText, { color: colors.primaryDark }]}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {item.message}
        </Text>
        <TouchableOpacity
          style={styles.shareIconContainer}
          onPress={() => handleShareItem(item)}
        >
          <MaterialIcons
            name="ios-share"
            size={ms(22)}
            color={colors.textDisabled}
          />
        </TouchableOpacity>
      </View>
      {!!item.group && (
        <View style={styles.itemGroupContainer}>
          <TouchableOpacity
            onPress={() => {
              router.navigate({
                pathname: "/games/list",
                params: {
                  groupId: item.group?.id,
                  groupName: item.group?.name,
                },
              });
            }}
          >
            <View style={[styles.groupChip]}>
              <Text
                style={[styles.groupChipText, { color: colors.textPrimary }]}
              >
                {item.group.name}
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={ms(18)}
                color={colors.textPrimary}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const HistoryDisplayList: React.FC<{
  ListHeaderComponent?: React.ReactElement;
}> = ({ ListHeaderComponent }) => {
  const { history } = useInfoStore();
  const { t } = useTranslation();
  const { colors } = useThemeStore();
  const [supabaseData, setSupabaseData] = React.useState<GameHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] =
    React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const canLoadMore = React.useRef<boolean>(true);
  const currentOffset = React.useRef("");

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
      const { data: newItems, error } = await fetchUserGameHistory(
        PAGE_SIZE,
        currentOffset.current
      );

      if (error) throw error;

      if (!newItems || newItems.length === 0) {
        canLoadMore.current = false;
      } else {
        setSupabaseData((prevData) =>
          isRefresh ? newItems : [...prevData, ...newItems]
        );
        currentOffset.current = newItems[newItems.length - 1].created_at;
        if (newItems.length < PAGE_SIZE) canLoadMore.current = false;
      }
    } catch (e) {
      console.error("Failed to fetch history:", e);
      canLoadMore.current = false; // Stop trying if error
    } finally {
      setIsLoadingHistory(false);
      if (isRefresh) setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const historyList = React.useMemo(() => {
    // Simple de-duplication based on ID, assuming IDs from store and Supabase are consistent
    const combined = [...history, ...supabaseData];
    const uniqueItems = Array.from(
      new Map(combined.map((item) => [item.id, item])).values()
    );
    return uniqueItems.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [supabaseData, history]);

  const loadMore = () => {
    if (!isLoadingHistory && canLoadMore.current && supabaseData.length > 0)
      fetchData();
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: GameHistory;
    index: number;
  }) => {
    const itemDate = new Date(item.created_at);
    const itemDateFormatted = formatDate(itemDate);

    const today = new Date();
    const todayFormatted = formatDate(today);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayFormatted = formatDate(yesterday);

    let displayDateText = "";
    if (itemDateFormatted === todayFormatted) {
      displayDateText = t("common.today");
    } else if (itemDateFormatted === yesterdayFormatted) {
      displayDateText = t("common.yesterday");
    } else {
      displayDateText = itemDateFormatted;
    }

    const showDateHeader =
      index === 0 ||
      (index > 0 &&
        formatDate(new Date(historyList[index - 1].created_at)) !==
          itemDateFormatted);

    return (
      <View>
        <View style={{ paddingHorizontal: s(16) }}>
          {showDateHeader && (
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {displayDateText}
            </Text>
          )}
        </View>
        <HistoryDisplayItem item={item} />
      </View>
    );
  };

  const renderFooter = () => {
    if (isLoadingHistory && supabaseData.length > 0 && !isRefreshing) {
      return (
        <ActivityIndicator
          style={{ marginVertical: ms(20) }}
          size="small"
          color={colors.primary}
        />
      );
    }
    return null;
  };

  const renderEmptyComponent = () => {
    if (!isLoadingHistory && historyList.length === 0) {
      return <EmptyHistoryList />;
    }
    return null;
  };

  return (
    <AppLoading isLoading={isLoadingHistory && !supabaseData.length}>
      <FlatList
        data={historyList}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.id}`} // id is already a string and should be unique
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    </AppLoading>
  );
};

const styles = ScaledSheet.create({
  listContentContainer: { paddingVertical: "10@ms", flexGrow: 1 },
  itemContainer: {
    margin: "16@ms",
    borderRadius: "8@s",
  },
  itemContentContainer: {
    padding: "12@ms",
    borderRadius: "8@s",
    height: "300@ms",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  itemLogo: {
    width: "30@s",
    height: "30@s",
    borderRadius: "50@s",
    position: "absolute",
    left: "16@s",
    top: "16@s",
  },
  itemGroupContainer: {
    paddingHorizontal: "16@s",
    paddingBottom: "12@s", // Add some bottom padding if group exists
    paddingTop: "8@s", // Add some top padding
    alignItems: "flex-start", // Align chip to the start
  },
  groupChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "6@ms",
    paddingHorizontal: "12@ms",
    borderRadius: "16@s", // Pill shape
    width: "100%",
    justifyContent: "space-between",
    gap: "8@s",
  },
  groupChipText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
  shareIconContainer: {
    position: "absolute",
    right: "16@s",
    top: "16@s",
    padding: "5@s", // Add some padding for easier touch
  },
  shareIcon: {
    width: "24@s",
    height: "24@s",
    // If your share.png is not already tinted, you might want to add a tintColor
    // tintColor: colors.primary, // Example tint color
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "6@ms",
  },
  dateText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.FredokaOne,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
  scoreText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.FredokaOne,
      fontSizeKey: FontSizeKeys.subheading,
    }),
    fontSize: "40@s",
    bottom: "5@s",
    opacity: 0.8,
  },
  messageText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBlack,
      fontSizeKey: FontSizeKeys.body,
    }),
    textAlign: "center",
    marginVertical: "16@vs",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: "20@ms",
  },
  emptyText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
    textAlign: "center",
    marginBottom: "15@ms",
  },
  loadingText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
    marginTop: "10@ms",
  },
  refreshButton: {
    paddingVertical: "10@ms",
    paddingHorizontal: "20@ms",
    borderRadius: "20@s",
  },
  refreshButtonText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoBold,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
  canvas: {
    position: "absolute",
    width: 150,
    height: 150,
    bottom: -25,
    left: -25,
    transform: [
      {
        rotate: "45deg",
      },
    ],
  },
});

export default HistoryDisplayList;
