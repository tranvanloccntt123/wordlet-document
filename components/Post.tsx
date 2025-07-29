import useQuery from "@/hooks/useQuery";
import useThemeStore from "@/store/themeStore";
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles";
import { formatDate } from "@/utils/date";
import { getPostKey } from "@/utils/string";
import { MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinkPreview } from "@flyerhq/react-native-link-preview";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { s, ScaledSheet } from "react-native-size-matters";

enum ContentType {
  CENTER,
  TOP_LEFT,
}

const Post: React.FC<{ postId: number }> = ({ postId }) => {
  const colors = useThemeStore((state) => state.colors);
  const { data: item } = useQuery<Post>({
    key: getPostKey(postId),
  });
  const type =
    item?.content?.length > 30 ? ContentType.TOP_LEFT : ContentType.CENTER;
  return (
    !!item && (
      <View style={[styles.container]}>
        <View style={styles.headerContainer}>
          <View style={{ flexDirection: "row", gap: s(8) }}>
            <Image
              source={{ uri: item?.user_info?.avatar }}
              style={styles.avatar}
            />
            <View>
              <Text style={[styles.name, { color: colors.textPrimary }]}>
                {item?.user_info?.name}
              </Text>
              <Text style={[styles.date, { color: colors.textDisabled }]}>
                {formatDate(new Date(item?.created_at))}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.headerButton]}>
            <MaterialIcons
              name="more-vert"
              size={s(18)}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: colors.card },
            type === ContentType.CENTER ? styles.contentCenter : {},
          ]}
        >
          <Text
            style={[
              type === ContentType.CENTER
                ? styles.contentCenterText
                : styles.contentTopLeftText,
              { color: colors.textPrimary },
            ]}
          >
            {item?.content}
          </Text>
        </View>
        {!!item?.params?.links?.length && (
          <View style={{ backgroundColor: colors.card }}>
            {(item?.params?.links as string[]).map((link, index) => (
              <LinkPreview
                key={`${link}-${index}`}
                text={link}
                renderText={(string) => (
                  <Text
                    style={[
                      getAppFontStyle({
                        fontFamily: FontFamilies.NunitoBlack,
                        fontSizeKey: FontSizeKeys.body,
                      }),
                      {
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {string}
                  </Text>
                )}
                renderTitle={(string) => (
                  <Text
                    style={[
                      getAppFontStyle({
                        fontFamily: FontFamilies.NunitoRegular,
                        fontSizeKey: FontSizeKeys.body,
                      }),
                      {
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {string}
                  </Text>
                )}
                renderDescription={(string) => (
                  <Text
                    style={[
                      getAppFontStyle({
                        fontFamily: FontFamilies.NunitoRegular,
                        fontSizeKey: FontSizeKeys.caption,
                      }),
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {string}
                  </Text>
                )}
              />
            ))}
          </View>
        )}
        <View
          style={[styles.footerContainer, { backgroundColor: colors.card }]}
        >
          <TouchableOpacity
            style={[styles.footerButton, { backgroundColor: colors.border }]}
          >
            <AntDesign name="like2" size={s(18)} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    )
  );
};

export default Post;

const styles = ScaledSheet.create({
  container: {
    paddingVertical: "16@s",
    marginTop: "16@s",
    borderRadius: "16@s",
  },
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: "16@s",
    marginBottom: "8@s",
    gap: "8@s",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contentContainer: {
    width: "100%",
    minHeight: "75@vs",
    paddingHorizontal: "16@s",
    paddingVertical: "8@s",
  },
  contentCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentCenterText: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.title,
      fontFamily: FontFamilies.NunitoBlack,
    }),
    textAlign: "center",
  },
  contentTopLeftText: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.caption,
      fontFamily: FontFamilies.NunitoRegular,
    }),
    textAlign: "left",
  },
  avatar: {
    width: "25@s",
    height: "25@s",
    borderRadius: "45@s",
  },
  name: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.caption,
      fontFamily: FontFamilies.NunitoBold,
    }),
  },
  date: {
    ...getAppFontStyle({
      fontSizeKey: FontSizeKeys.caption,
      fontFamily: FontFamilies.NunitoRegular,
    }),
    fontSize: "8@s",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: "16@s",
    paddingVertical: "8@s",
  },
  footerButton: {
    width: "30@s",
    height: "30@s",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "30@s",
  },
  headerButton: {
    padding: "5@s",
    width: "30@s",
    height: "30@s",
    borderRadius: "30@s",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
});
