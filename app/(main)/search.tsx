import EmptySearchResult from "@/components/EmptySearchResult"; // Import the new empty state component
import InitialEmptySearch from "@/components/InitialEmptySearch"; // Corrected import name if it was a typo
import SearchResultItem from "@/components/SearchResultItem"; // Import the new item component
import { SEARCH_LIMIT } from "@/constants";
import useDebounce from "@/hooks/useDebounce";
import { setQueryData } from "@/hooks/useQuery";
import { fetchSearchResults } from "@/services/supabase/searchDb";
import useThemeStore from "@/store/themeStore";
import { commonStyles } from "@/styles/commonStyles"; // Import common styles
import {
  FontFamilies,
  FontSizeKeys,
  getAppFontStyle,
} from "@/styles/fontStyles"; // Import font styles
import { getWordKey } from "@/utils/string";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import {
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, s } from "react-native-size-matters"; // Import s for scaling

const SearchScreen = () => {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { t } = useTranslation(); // Get the t function
  const params = useLocalSearchParams<{ groupId?: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = React.useState<WordStore[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For pagination loading
  const [hasMoreData, setHasMoreData] = useState(true);

  const debounce = useDebounce({ time: 500 });

  const handleNavigateToDetail = (item: WordStore) => {
    setQueryData(getWordKey(item.word), item);
    // Navigate to the detail screen, passing the word itself as a parameter.
    // Ensure the word is URL-encoded in case it contains special characters.
    router.push({
      pathname: `/word/${encodeURIComponent(item.source)}/${encodeURIComponent(
        item.word
      )}/detail` as any,
      params: {
        groupId: params.groupId,
      },
    });
  };

  React.useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim();
    setSuggestions([]); // Clear previous suggestions immediately
    setCurrentPage(0);
    setHasMoreData(true); // Optimistically assume more data for a new term

    if (trimmedSearchTerm === "") {
      setIsLoading(false); // Not loading if term is empty
      setHasMoreData(false);
      debounce(() => {});
      return;
    }

    debounce(async (abortController) => {
      setIsLoading(true); // Start full-screen loading for new search
      const specificSourceResults = await fetchSearchResults(
        trimmedSearchTerm,
        0,
        null,
        abortController
      );
      setSuggestions(specificSourceResults);
      setHasMoreData(specificSourceResults.length >= SEARCH_LIMIT);
      setIsLoading(false); // End full-screen loading
    });
  }, [searchTerm]);

  const handleLoadMore = async () => {
    const trimmedSearchTerm = searchTerm.trim();
    if (
      isLoadingMore ||
      isLoading ||
      !hasMoreData ||
      trimmedSearchTerm === "" ||
      suggestions.length === 0
    )
      return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    const results = await fetchSearchResults(trimmedSearchTerm, nextPage, null);

    if (results.length > 0) {
      setSuggestions((prevSuggestions) => [...prevSuggestions, ...results]);
      setCurrentPage(nextPage);
    }
    setHasMoreData(results.length === SEARCH_LIMIT);
    setIsLoadingMore(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.searchHeaderContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons
              name="arrow-back" // Or "chevron-left"
              size={s(24)} // Use s for consistent scaling
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <View
            style={[
              commonStyles.textInputContainer, // Use common style
              {
                backgroundColor: colors.card,
                flex: 1,
              },
            ]}
          >
            <TextInput
              style={[
                commonStyles.textInput,
                { color: colors.textPrimary },
                getAppFontStyle({
                  fontFamily: FontFamilies.NunitoRegular,
                  fontSizeKey: FontSizeKeys.body,
                }),
              ]} // Use common style
              placeholder={t("search.searchPlaceholder")}
              placeholderTextColor={colors.textDisabled}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </View>
        <FlatList
          data={suggestions}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => `${item.word}-${index}`} // Using index for more robust key if words can repeat
          renderItem={({ item }) => (
            <SearchResultItem
              item={item}
              onPressItem={() => handleNavigateToDetail(item)} // Pass the navigation handler
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? ( // Show pagination loader if isLoadingMore is true
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          ListEmptyComponent={
            !isLoading && searchTerm.trim() !== "" ? (
              <EmptySearchResult searchTerm={searchTerm.trim()} />
            ) : (
              <InitialEmptySearch />
            ) // Don't show anything if not loading and no search term (initial state)
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    padding: "15@ms",
  },
  searchHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: "8@s",
    marginBottom: "16@s",
  },
  // spellingText and translationText are not currently used in this component's render output.
  // voiceButton is handled by commonStyles.iconButton
});

export default SearchScreen;
