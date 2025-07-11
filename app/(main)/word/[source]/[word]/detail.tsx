import AppLoading from "@/components/AppLoading";
import CommonHeader from "@/components/CommonHeader";
import ParseContent from "@/components/ParseContent";
import useQuery from "@/hooks/useQuery";
import { wordSupabase } from "@/services/supabase";
import useThemeStore from "@/store/themeStore";
import { getWordKey } from "@/utils/string";
import { playWord } from "@/utils/voice";
import { MaterialIcons } from "@expo/vector-icons"; // Or your preferred icon library
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react"; // Added useCallback
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"; // Added Alert
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet, s } from "react-native-size-matters"; // Import s for scaling

interface WordDetailCardProps {
  wordData: WordStore;
}

/**
 * A React Native component to display the details of a word in a card format.
 * Mimics the style of a Quizlet flashcard.
 */
const WordDetailCard: React.FC<WordDetailCardProps> = ({ wordData }) => {
  const { colors } = useThemeStore();

  return (
    <View style={[cardStyles.card]}>
      <View style={cardStyles.header}>
        <Text style={[cardStyles.term, { color: colors.textPrimary }]}>
          {wordData.word}
        </Text>
        <TouchableOpacity
          onPress={() => playWord(wordData.word, wordData.source)}
          style={cardStyles.voiceButton}
        >
          <MaterialIcons name="volume-up" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <ParseContent content={wordData.content} />
    </View>
  );
};

// Renamed 'styles' to 'cardStyles' to avoid conflict with 'screenStyles'
const cardStyles = ScaledSheet.create({
  card: {
    margin: "16@ms",
    padding: "16@ms",
    borderRadius: "8@s",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16@ms",
  },
  term: {
    fontSize: "28@s",
    fontWeight: "bold",
    flexShrink: 1, // Allow term to shrink if too long
  },
  voiceButton: {
    padding: "8@s", // Add some padding for easier touch
    marginLeft: "8@s", // Space from the term
  },
});

const WordDetailScreen = () => {
  const params = useLocalSearchParams<{
    word?: string;
    source?: string;
    groupId?: string;
  }>();
  const { word: wordToSearch, source: wordSource } = params;
  const { data: wordDetails, isLoading } = useQuery<WordStore>({
    key: getWordKey(wordToSearch || ""),
    async queryFn() {
      try {
        const { data: result } = await wordSupabase
          .schema("public")
          .from("fts_words")
          .select("*")
          .eq("word", wordToSearch)
          .eq("source", wordSource)
          .single();
        if (result) return result;
        throw "Failed to fetch word details";
      } catch (e) {
        throw e;
      }
    },
  });
  const { colors } = useThemeStore();

  const handleOpenModal = useCallback(() => {
    if (wordDetails) {
      router.push({
        pathname: `/word/${wordSource || ""}/${
          wordToSearch || ""
        }/add-group` as any,
        params: {
          wordDetails: JSON.stringify(wordDetails),
          groupId: params.groupId,
        },
      });
    } else {
      Alert.alert(
        "No Word Loaded",
        "Cannot add to group as word details are not available."
      );
    }
  }, [wordDetails]);

  return (
    <AppLoading isLoading={isLoading}>
      <View style={[{ flex: 1, backgroundColor: colors.background }]}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header Row - Positioned absolutely */}
          <CommonHeader
            title={""}
            rightActionElement={
              !isLoading &&
              wordDetails && (
                <TouchableOpacity
                  onPress={handleOpenModal}
                  style={screenStyles.headerIconTouchable}
                >
                  <MaterialIcons
                    name="playlist-add"
                    size={s(30)}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              )
            }
          />
          {/* Content Area - This View has paddingTop to account for the absolute header */}
          <View style={screenStyles.contentArea}>
            {isLoading && (
              <View style={screenStyles.centered}>
                {/* Loading indicator is handled by FullScreenLoadingModal, 
                  but this prevents rendering heavy content underneath. */}
              </View>
            )}
            {!isLoading && wordDetails && (
              <ScrollView
                contentContainerStyle={[screenStyles.container]}
                showsVerticalScrollIndicator={false}
              >
                <WordDetailCard wordData={wordDetails} />
              </ScrollView>
            )}
            {!isLoading && !wordDetails && wordToSearch && (
              <View style={screenStyles.centered}>
                <Text
                  style={[
                    screenStyles.errorText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Word "{wordToSearch}" not found.
                </Text>
              </View>
            )}
            {!isLoading && !wordDetails && !wordToSearch && (
              <View style={screenStyles.centered}>
                <Text
                  style={[
                    screenStyles.errorText,
                    { color: colors.textSecondary },
                  ]}
                >
                  No word specified to search.
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </AppLoading>
  );
};

const screenStyles = ScaledSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: "16@s",
    textAlign: "center",
  },
  headerIconTouchable: {
    padding: "8@s", // Generous touchable area around icons
  },
  contentArea: {
    flex: 1,
    // Adjust this value based on your actual header height
  },
});

export default WordDetailScreen;
