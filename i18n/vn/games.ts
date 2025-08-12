const games = {
  // Game Titles & Descriptions
  sortCharactersTitle: "Sắp Xếp Ký Tự",
  sortCharactersDescription: "Sắp xếp các chữ cái để tạo thành từ đúng.",
  wordFromTranslationTitle: "Chọn từ đúng",
  wordFromTranslationDescription:
    "Chọn từ tiếng Anh cho nghĩa tiếng Việt được cung cấp.",
  translationFromVoiceTitle: "Nghe và điền từ",
  translationFromVoiceDescription:
    "Chọn nghĩa tiếng Việt cho giọng đọc tiếng Anh được cung cấp.",
  speakAndCompareTitle: "Chấm điểm phát âm",
  speakAndCompareDescription: "Luyện nói và so sánh phát âm của bạn.",

  // UI Text for the game list screen
  wordsInThisGroup: "Các từ trong nhóm này ({{count}})",
  noWordsInGroupMessage:
    "Nhóm này không có từ nào. Vui lòng thêm từ vào nhóm để bắt đầu chơi.",
  noWordsMessage: "Nhóm này không có từ nào.",
  findWordsToAdd: "Tìm Từ Để Thêm",
  loadingGame: "Đang tải trò chơi...",
  notEnoughWordsTitle: "Không Đủ Từ",
  notEnoughWordsMessage_one:
    "Nhóm này cần ít nhất {{count}} từ để chơi trò chơi này.", // Vietnamese doesn't typically pluralize "từ" (word) like English
  notEnoughWordsMessage_other:
    "Nhóm này cần ít nhất {{count}} từ để chơi trò chơi này.",
  preparingQuestion: "Đang chuẩn bị câu hỏi...",
  progressText: "Câu {{current}} trên {{total}}",
  // For Games index screen
  gameRoadmapTitle: "Trò chơi đã xuất bản",
  noGroupsForGamesTitle: "Chưa Có Nhóm Nào Để Chơi!",
  noGroupsForGamesSubtitle:
    'Hãy tạo nhóm và thêm từ trong mục "Quản Lý Nhóm" để bắt đầu chơi.',
  // For SortCharactersGame and SingleWordSortGame
  sortPrompt: "Sắp xếp các chữ cái để tạo thành từ đúng",
  loadingWord: "Đang tải từ...",
  wordProgress: "Từ {{current}} trên {{total}}",
  tryAgain: "Thử lại!",
  correct: "Chính xác!",
  useLetters: "Dùng Chữ Cái",
  useKeyboard: "Dùng Bàn Phím",
  undo: "Hoàn tác",
  noDefinitionAvailable: "Không có định nghĩa nào.",
  // For SpeakAndCompareScreen
  gameErrorTitle: "Lỗi Trò Chơi",
  noWordsInGroupPractice:
    "Nhóm này không có từ nào để luyện tập hoặc không tìm thấy.",
  noGroupSelectedPractice: "Chưa chọn nhóm nào cho trò chơi.",
  // loadingGame: "Đang tải trò chơi...", // Already exists
  noWordsToPractice: "Không có từ nào để luyện tập.",
  backToGames: "Quay Lại Danh Sách Trò Chơi",
  tapToSpeakInstruction: "Chạm vào mic và nói cụm từ này:",
  // loadingWord: "Đang tải từ...", // Already exists
  listeningStatus: "Đang nghe...",
  startButton: "Bắt đầu",
  stopButton: "Dừng",
  // For ChooseCorrectFromVoice (TypeCorrectFromVoice)
  // translationFromVoiceTitle: "Nghĩa Tiếng Việt Qua Giọng Đọc Tiếng Anh", // Already exists
  notEnoughWordsMessageSingular:
    "Nhóm này cần ít nhất 1 từ để chơi trò chơi này.",
  tapToListenInstruction: "Chạm để Nghe",
  speedEasy: "Dễ",
  speedMedium: "Vừa",
  speedHigh: "Khó",
  typeWordPlaceholder: "Gõ từ vào đây",
  suggestButton: "Gợi ý",
  correctWordWas: "Từ đúng là: {{word}}",
  submitButton: "Nộp",
  // For GameOverScreen
  gameOverTitle: "Hoàn Thành Tốt!",
  gameOverMessage: "Bạn đã hoàn thành tất cả các từ thành công.",
  gameOverBackToGames: "Quay Lại",
  noSound: "Không ghi nhận dọng nói",
  //
  goToGroupsButton: "Đến Nhóm",
  addWordButton: "Thêm Từ",
  addWordModalTitle: "Thêm Từ Mới",
  addWordEmptyError: "Từ không được để trống.",
  addContentEmptyError: "Nội dung không được để trống.",
  createWordTitle: "Tạo Từ Mới",
  createWordForGroupTitle: "Tạo Từ",
  wordLabel: "Từ",
  wordPlaceholder: "Nhập từ",
  wordTypeLabel: "Loại từ",
  selectPrompt: "Chọn một loại từ", // More specific than "Choose a word type"
  wordType: {
    select: "Chọn loại từ...",
    noun: "Danh từ (n)",
    verb: "Động từ (v)",
    adjective: "Tính từ (adj)",
    adverb: "Trạng từ (adv)",
    preposition: "Giới từ (prep)",
    pronoun: "Đại từ (pron)",
    conjunction: "Liên từ (conj)",
    interjection: "Thán từ (interj)",
    phrase: "Cụm từ",
    other: "Khác",
  },
  contentLabel: "Nội dung (Nghĩa, Ví dụ, v.v.)",
  contentPlaceholder: "Nhập định nghĩa, ví dụ, v.v.",
  errorNoGroupSelected: "Chưa chọn nhóm. Không thể lưu từ.",
  wordAddedSuccess: "Đã thêm thành công từ '{{word}}'!",
  watchVideoPrompt:
    "Hãy xem video để học cách phát âm trước khi bắt đầu trò chơi!",
  myGroupGameAlertTitle: "Trận Đấu Giao Hữu!",
  myGroupGameAlertMessage:
    "Đây là trò chơi từ nhóm của bạn. Điểm sẽ không được ghi vào bảng xếp hạng. Chúc bạn luyện tập vui vẻ!",
  othersGroupGameAlertTitle: "Chế Độ Thử Thách!",
  othersGroupGameAlertMessage:
    "Trò chơi này sẽ được tính điểm vào bảng xếp hạng của bạn. Chúc may mắn!",
  quitGames: "Bạn có chắc chắn muốn rời khỏi màn hình này không?",
};

export default games;
