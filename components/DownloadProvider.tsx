import { DB_DIR } from "@/services/downloadDb";
import useLanguageStore from "@/store/languageStore";
import useThemeStore from "@/store/themeStore";
import * as FileSystem from "expo-file-system";
import { useSegments } from "expo-router";
import * as SQLite from "expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, ReactNode, useContext } from "react";
import { Modal, Text, View } from "react-native";
import { scale, ScaledSheet } from "react-native-size-matters";
import Rive from "rive-react-native";
import StatusBar from "./StatusBar";

// Define the status types
export enum DownloadStatus {
  PENDING = "Pending",
  SUCCESS = "Success",
  ERROR = "Error",
  SYNC = "SYNC",
}

// Define the context type
interface DownloadContextType {
  status: DownloadStatus | null;
  message: string | null;
  showDownloadAlert: (status: DownloadStatus, message?: string) => void;
  hideDownloadAlert: () => void;
}

// Create the context
const DownloadContext = createContext<DownloadContextType | undefined>(
  undefined
);

// Custom hook to use the download context
export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error("useDownload must be used within a DownloadProvider");
  }
  return context;
};

const DownloadAlert: React.FC<object> = () => {
  const segments = useSegments();

  const db = useSQLiteContext();
  const { downloadHandle, downloadSuccess, downloading, syncSuccess } =
    useLanguageStore();
  const [isShowDownloadVisible, setIsShowDownloadVisible] =
    React.useState<boolean>(false);
  const [isSync, setIsSync] = React.useState<boolean>(false);
  const [dbList, setDbList] = React.useState<
    { total: number; success: number; name: string; status: DownloadStatus }[]
  >([]);
  const { colors } = useThemeStore();

  React.useEffect(() => {
    if (!downloadSuccess) {
      setIsShowDownloadVisible(true);
      downloadHandle().then(async () => {
        const LIMIT = 100;
        db.withTransactionAsync(async () => {
          setIsSync(true);
          const dbs = await FileSystem.readDirectoryAsync(DB_DIR);
          const dbList = dbs.filter(
            (localDB) => !localDB.includes("teiresource.db")
          );
          const status = dbList.map((_, i) => ({
            name: `Fetching ${i}`,
            total: 0,
            success: 0,
            status: DownloadStatus.PENDING,
          }));
          setDbList(status);
          for (let i = 0; i < dbList.length; i++) {
            const localDB = dbList[i];
            let page = 0;
            const _db = await SQLite.openDatabaseAsync(localDB, {
              useNewConnection: true,
            });
            status[i].status = DownloadStatus.SYNC;
            // Get the total count of records in the source table
            const countResult = await _db.getFirstAsync<{
              total_count: number;
            }>(`SELECT COUNT(*) as total_count FROM 'fts_words'`);
            const totalRecordsInDb = countResult?.total_count ?? 0;
            status[i].total = totalRecordsInDb;
            setDbList([...status]);

            let result: WordStore[] = [];
            do {
              result = await _db.getAllAsync(
                `SELECT * FROM 'fts_words' LIMIT ${page},${LIMIT}`
              );
              if (result.length) {
                let query = "";
                for (const row of result) {
                  // Escape double quotes within the data to prevent SQL syntax errors
                  const word = row.word.replace(/"/g, '""');
                  const content = row.content.replace(/"/g, '""');
                  const parsedword = row.parsedword.replace(/"/g, '""');
                  query += `INSERT INTO fts_words (word, content, parsedword, source) 
                      VALUES ("${word}", "${content}", "${parsedword}", "${localDB}");
                      `;
                }
                if (query !== "") {
                  await db
                    .execAsync(query)
                    .then(() => {})
                    .catch((e) => {
                      console.log("[INSERT INTO] error", e);
                      console.log(query);
                    });
                }
                status[i].success += result.length;
                setDbList([...status]);
                page += LIMIT;
              } else {
                status[i].status = DownloadStatus.SUCCESS;
                setDbList([...status]);
                break;
              }
            } while (result.length);
            await _db.closeAsync();
          }
          syncSuccess();
          setIsShowDownloadVisible(false);
          setIsSync(false);
        });
      });
    }
  }, []);

  const status = React.useMemo(() => {
    if (isSync) {
      return DownloadStatus.SYNC;
    }
    if (downloading) {
      return DownloadStatus.PENDING;
    }
    if (downloadSuccess) {
      return DownloadStatus.SUCCESS;
    }
    if (!downloadSuccess && !downloading) {
      return DownloadStatus.ERROR;
    }
  }, [downloadSuccess, downloading, isSync]);

  const { alertMessage, alertTitle, backgroundColor } = React.useMemo(() => {
    let alertTitle = "";
    let alertMessage = "";
    let backgroundColor = "";

    switch (status) {
      case DownloadStatus.PENDING:
        alertTitle = "Download Pending";
        alertMessage = "Your download is in progress...";
        backgroundColor = "#f0ad4e"; // Orange
        break;
      case DownloadStatus.SUCCESS:
        alertTitle = "Download Successful";
        alertMessage = "Your file has been downloaded successfully.";
        backgroundColor = "#5cb85c"; // Green
        break;
      case DownloadStatus.ERROR:
        alertTitle = "Download Error";
        alertMessage = "An error occurred during download.";
        backgroundColor = "#d9534f"; // Red
        break;
      case DownloadStatus.SYNC:
        alertTitle = "Import Library";
        alertMessage = "Importing a new library, please wait...";
        backgroundColor = "#d9534f"; // Red
        break;
    }
    return { alertMessage, alertTitle, backgroundColor };
  }, [status]);

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isShowDownloadVisible && segments[0] === "(main)"}
      onRequestClose={() => {}}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.alertContainer, { backgroundColor: "white" }]}>
          <Text style={styles.alertTitle}>{alertTitle}</Text>
          <Text style={styles.alertMessage}>{alertMessage}</Text>
          <Rive
            resourceName="untitled" // weather_app.riv
            autoplay={true}
            style={{ width: scale(150), height: scale(150) }}
          />
          {dbList.length > 0 && (
            <View style={styles.dbListContainer}>
              {dbList.map((item, index) => (
                <Text
                  key={index}
                  style={[
                    styles.dbListItem,
                    {
                      color:
                        item.status === DownloadStatus.SYNC
                          ? colors.primary
                          : item.status === DownloadStatus.SUCCESS
                          ? colors.success
                          : colors.shadow,
                    },
                  ]}
                >
                  {`${item.name}: ${item.success}/${item.total} ${
                    item.status === DownloadStatus.SYNC ? "(Syncing)" : ""
                  }`}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const DownloadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      {children}
      <DownloadAlert />
    </View>
  );
};

const styles = ScaledSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertContainer: {
    width: "300@s",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  dbListContainer: {
    width: "100%",
    marginBottom: 15,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  dbListItem: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default DownloadProvider;
