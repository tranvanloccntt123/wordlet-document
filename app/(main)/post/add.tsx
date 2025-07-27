import AppLoading from "@/components/AppLoading";
import GameButtons from "@/components/GameButtons";
import { createPost } from "@/services/supabase/post";
import useThemeStore from "@/store/themeStore";
import {
    FontFamilies,
    FontSizeKeys,
    getAppFontStyle,
} from "@/styles/fontStyles";
import { isValidUrl } from "@/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinkPreview } from "@flyerhq/react-native-link-preview";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, ScaledSheet } from "react-native-size-matters";

const AddPost = () => {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const [value, setValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const ref = React.useRef<TextInput>(null);
  const [links, setLinks] = React.useState<string[]>([]);
  const [newLinkValue, setNewLinkValue] = React.useState("");
  const [errorNewLink, setErrorNewLink] = React.useState("");
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  return (
    <AppLoading isLoading={isLoading}>
      <TouchableWithoutFeedback
        onPress={() => {
          ref.current?.blur();
        }}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <SafeAreaView
            style={{ flex: 1, padding: s(16), justifyContent: "space-between" }}
          >
            <View>
              <Text
                style={[styles.limitLengthText, { color: colors.textDisabled }]}
              >
                {value.length}/255
              </Text>
              <View
                style={[
                  styles.textAreaContainer,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <TextInput
                  ref={ref}
                  style={[styles.textArea, { color: colors.textPrimary }]}
                  multiline
                  placeholder={`${t("post.addPlaceholder")} 🥰🥰🥰🥰`}
                  placeholderTextColor={colors.textDisabled}
                  textAlign="left"
                  textAlignVertical="top"
                  value={value}
                  onChangeText={setValue}
                  maxLength={255}
                  returnKeyType="done"
                />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: "row", marginBottom: s(16) }}>
                <TouchableOpacity
                  onPress={() => bottomSheetRef?.current?.expand()}
                >
                  <View
                    style={[{ backgroundColor: colors.card }, styles.optionBtn]}
                  >
                    <Ionicons
                      name="link"
                      size={s(18)}
                      color={colors.textPrimary}
                    />
                    {!!links.length && (
                      <View
                        style={[
                          styles.linkBadgeContainer,
                          { backgroundColor: colors.accent },
                        ]}
                      >
                        <Text
                          style={[
                            getAppFontStyle({
                              fontFamily: FontFamilies.NunitoRegular,
                              fontSizeKey: FontSizeKeys.caption,
                            }),
                            { color: colors.card, fontSize: s(8) },
                          ]}
                        >
                          {links.length}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              <GameButtons
                primaryButtonText={t("common.save")}
                primaryButtonDisabled={
                  !value.trim().replace(/\n+/g, "\n").length
                }
                onSkipPress={() => {
                  router.back();
                }}
                onPrimaryPress={() => {
                  setIsLoading(true);
                  createPost(
                    value.trim().replace(/\n+/g, "\n").replace(/^\n/g, ""),
                    {
                      links,
                    }
                  ).finally(() => {
                    setIsLoading(false);
                    router.back();
                  });
                }}
              />
            </View>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
      <BottomSheet
        index={-1}
        ref={bottomSheetRef}
        snapPoints={["50%"]}
        onChange={() => {}}
        enableDynamicSizing={true}
        backdropComponent={BottomSheetBackdrop}
        backgroundStyle={{
          backgroundColor: colors.card,
        }}
      >
        <BottomSheetFlatList
          data={links}
          keyExtractor={(i) => i}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.linkContainer,
                { borderBottomColor: colors.shadow },
              ]}
            >
              <View style={styles.linkContentContainer}>
                <Text
                  style={[
                    getAppFontStyle({
                      fontFamily: FontFamilies.NunitoBold,
                      fontSizeKey: FontSizeKeys.caption,
                    }),
                    { color: colors.primary },
                  ]}
                >
                  {item}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setLinks(links.filter((_, i) => i !== index));
                  }}
                >
                  <View
                    style={[{ backgroundColor: colors.card }, styles.optionBtn]}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={s(18)}
                      color={colors.error}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <LinkPreview text={item} />
            </View>
          )}
          ListHeaderComponent={
            <>
              <View
                style={[
                  styles.linkAddHeader,
                  { opacity: links.length >= 5 ? 0.5 : 1 },
                ]}
              >
                <TextInput
                  value={newLinkValue}
                  onChangeText={setNewLinkValue}
                  style={[
                    styles.linkInput,
                    {
                      borderColor: !!errorNewLink
                        ? colors.error
                        : colors.shadow,
                    },
                  ]}
                  placeholder="Youtube.com, facebook.com,..."
                  placeholderTextColor={colors.textDisabled}
                />
                <TouchableOpacity
                  disabled={links.length >= 5}
                  onPress={() => {
                    if (newLinkValue.trim()) {
                      if (isValidUrl(newLinkValue.trim())) {
                        setLinks([...links, newLinkValue]);
                        setNewLinkValue("");
                        setErrorNewLink("");
                      } else {
                        //ERROR
                        setErrorNewLink(t("post.incorrectAddress"));
                      }
                    } else {
                      //ERROR
                      setErrorNewLink(t("post.emptyAddress"));
                    }
                  }}
                >
                  <View
                    style={[{ backgroundColor: colors.card }, styles.optionBtn]}
                  >
                    <MaterialIcons
                      name="add-link"
                      size={s(18)}
                      color={colors.primary}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              {!!errorNewLink && (
                <Text
                  style={[
                    getAppFontStyle({
                      fontFamily: FontFamilies.NunitoRegular,
                      fontSizeKey: FontSizeKeys.caption,
                    }),
                    {
                      color: colors.error,
                      paddingHorizontal: s(16),
                      paddingVertical: s(4),
                    },
                  ]}
                >
                  *{errorNewLink}
                </Text>
              )}
            </>
          }
        />
      </BottomSheet>
    </AppLoading>
  );
};

export default AddPost;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  textAreaContainer: {
    height: "300@vs",
    borderRadius: "16@s",
    borderStyle: "dashed",
    borderWidth: 1,
  },
  textArea: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.body,
    }),
    padding: "16@s",
  },
  limitLengthText: {
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
    alignSelf: "flex-end",
    marginRight: "16@s",
    marginBottom: "8@s",
  },
  optionBtn: {
    width: "50@s",
    height: "50@s",
    borderRadius: "8@s",
    justifyContent: "center",
    alignItems: "center",
  },
  linkAddHeader: {
    flexDirection: "row",
    paddingHorizontal: "16@s",
    height: "45@vs",
  },
  linkInput: {
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: "16@s",
    borderRadius: "8@s",
    ...getAppFontStyle({
      fontFamily: FontFamilies.NunitoRegular,
      fontSizeKey: FontSizeKeys.caption,
    }),
  },
  linkBadgeContainer: {
    position: "absolute",
    borderRadius: "16@s",
    paddingVertical: "2@s",
    paddingHorizontal: "4@s",
    minWidth: "16@s",
    justifyContent: "center",
    alignItems: "center",
    top: "-4@s",
    right: "-4@s",
  },
  linkContainer: {
    borderBottomWidth: 1,
  },
  linkContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "16@s",
  },
});
