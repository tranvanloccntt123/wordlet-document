const games = {
  // Game Titles & Descriptions
  sortCharactersTitle: "Sort Characters",
  sortCharactersDescription: "Arrange letters to form the correct word.",
  wordFromTranslationTitle: "Choose The Correct Word",
  wordFromTranslationDescription:
    "Select the English word for the given Vietnamese meaning.",
  translationFromVoiceTitle: "Listen And Fill In The Blanks",
  translationFromVoiceDescription:
    "Select the Vietnamese meaning for the given English voice.",
  speakAndCompareTitle: "Pronunciation score",
  speakAndCompareDescription:
    "Practice speaking and compare your pronunciation.",

  // UI Text for the game list screen
  wordsInThisGroup: "Words in this Group ({{count}})",
  noWordsInGroupMessage:
    "This group has no words. Please add some words to this group to start playing games.",
  noWordsMessage: "This group has no words.",
  findWordsToAdd: "Find Words to Add",
  loadingGame: "Loading Game...",
  notEnoughWordsTitle: "Not Enough Words",
  notEnoughWordsMessage_one:
    "This group needs at least {{count}} word to play this game.",
  notEnoughWordsMessage_other:
    "This group needs at least {{count}} words to play this game.",
  preparingQuestion: "Preparing question...",
  progressText: "Question {{current}} of {{total}}",
  // For Games index screen
  gameRoadmapTitle: "Game Roadmap",
  noGroupsForGamesTitle: "No Groups Available for Games!",
  noGroupsForGamesSubtitle:
    'Create some groups with words first in the "Manage Groups" tab to start playing games.',
  // For SortCharactersGame and SingleWordSortGame
  sortPrompt: "Sort the letters to form the word",
  loadingWord: "Loading word...",
  wordProgress: "Word {{current}} of {{total}}",
  tryAgain: "Try again!",
  correct: "Correct!",
  useLetters: "Use Letters",
  useKeyboard: "Use Keyboard",
  undo: "Undo",
  noDefinitionAvailable: "No definition available.",
  // For SpeakAndCompareScreen
  gameErrorTitle: "Game Error",
  noWordsInGroupPractice:
    "This group has no words to practice or was not found.",
  noGroupSelectedPractice: "No group selected for the game.",
  // loadingGame: "Loading game...", // Already exists
  noWordsToPractice: "No words available to practice.",
  backToGames: "Back to Games", // Common button text
  tapToSpeakInstruction: "Tap the mic and speak this phrase:",
  // loadingWord: "Loading word...", // Already exists
  listeningStatus: "Listening...",
  startButton: "Start",
  stopButton: "Stop",
  // For ChooseCorrectFromVoice (TypeCorrectFromVoice)
  // translationFromVoiceTitle: "Translation From Voice", // Already exists, used as header
  notEnoughWordsMessageSingular:
    "This group needs at least 1 word to play this game.",
  tapToListenInstruction: "Tap to Listen",
  speedEasy: "Easy",
  speedMedium: "Medium",
  speedHigh: "High",
  typeWordPlaceholder: "Type the word here",
  suggestButton: "Suggest",
  correctWordWas: "The correct word was: {{word}}",
  submitButton: "Submit",
  // For GameOverScreen
  gameOverTitle: "Well Done!",
  gameOverMessage: "You've successfully completed all the words.",
  gameOverBackToGames: "Back to Games",
  //
  noSound: "No sound available",
  goToGroupsButton: "Go to Groups",
  addWordButton: "Add Word",
  addWordModalTitle: "Add New Word",
  addWordEmptyError: "Word cannot be empty.",
  addContentEmptyError: "Content cannot be empty.",
  createWordTitle: "Create New Word",
  createWordForGroupTitle: "Create Word",
  wordLabel: "Word",
  wordPlaceholder: "Enter the word",
  wordTypeLabel: "Type of Word",
  selectPrompt: "Choose a word type",
  wordType: {
    select: "Select type...",
    noun: "Noun (n)",
    verb: "Verb (v)",
    adjective: "Adjective (adj)",
    adverb: "Adverb (adv)",
    preposition: "Preposition (prep)",
    pronoun: "Pronoun (pron)",
    conjunction: "Conjunction (conj)",
    interjection: "Interjection (interj)",
    phrase: "Phrase",
    other: "Other",
  },
  contentLabel: "Content (Meanings, Examples, etc.)",
  contentPlaceholder: "Enter definitions, examples, etc.",
  errorNoGroupSelected: "No group selected. Cannot save word.",
  wordAddedSuccess: "Word '{{word}}' added successfully!",
  watchVideoPrompt:
    "Watch the video to learn how to pronounce this sound before starting the game!",
  myGroupGameAlertTitle: "Friendly Match!",
  myGroupGameAlertMessage:
    "This is your own group's game. Scores won't be recorded on the leaderboard. Have fun practicing!",
  othersGroupGameAlertTitle: "Challenge Mode!",
  othersGroupGameAlertMessage:
    "This game will count towards your leaderboard score. Good luck!",
  quitGames: "Are you sure you want to leave this screen?",
};

export default games;
