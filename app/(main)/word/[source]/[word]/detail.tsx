import AppLoading from "@/components/AppLoading";
import CommonHeader from "@/components/CommonHeader";
import ParseContent from "@/components/ParseContent";
import { wordSupabase } from "@/services/supabase";
import useThemeStore from "@/store/themeStore";
import { playWord } from "@/utils/voice";
import { MaterialIcons } from "@expo/vector-icons"; // Or your preferred icon library
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react"; // Added useCallback
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
  const params = useLocalSearchParams<{ word?: string; source?: string }>();
  const { word: wordToSearch, source: wordSource } = params;
  const [wordDetails, setWordDetails] = useState<WordStore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useThemeStore();

  useEffect(() => {
    if (!wordToSearch) {
      setIsLoading(false);
      return;
    }

    const fetchWordDetails = async () => {
      setIsLoading(true);
      try {
        // Ensure your database name is correct

        // Assuming fts_words has columns 'word' and 'content'
        // Adjust column names if they are different in your WordStore and fts_words table
        // For FTS tables, you might typically use MATCH, but if 'word' is a direct column
        // and you want an exact match, '=' can be used.
        // If 'word' in fts_words is the FTS indexed content, you might do:
        // const result = await db.getFirstAsync<WordStore>('SELECT word, content, parsedword, source FROM fts_words WHERE fts_words MATCH ? LIMIT 1', wordToSearch);
        // For this example, I'll assume a direct column match on 'word'.
        const { data: result } = await wordSupabase
          .schema("public")
          .from("fts_words")
          .select("*")
          .eq("word", wordToSearch)
          .eq("source", wordSource)
          .single();

        if (result) {
          setWordDetails(result);
        }
      } catch (e: any) {
        console.error("Failed to fetch word details:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordDetails();
  }, [wordToSearch, wordSource]);

  const handleOpenModal = useCallback(() => {
    if (wordDetails) {
      router.push({
        pathname: `/word/${wordSource || ""}/${
          wordToSearch || ""
        }/add-group` as any,
        params: { wordDetails: JSON.stringify(wordDetails) },
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
