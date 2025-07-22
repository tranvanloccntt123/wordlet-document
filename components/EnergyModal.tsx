import useAdMobStore from "@/store/admobStore";
import useEnergyStore from "@/store/energyStore";
import useThemeStore from "@/store/themeStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ScaledSheet, ms, s } from "react-native-size-matters";
import GameButtons from "./GameButtons";

const duration = 700;

const AnimatedEnergyIcon = () => {
  const { colors } = useThemeStore();

  const scaleAnim = useSharedValue(0.5);

  React.useEffect(() => {
    scaleAnim.value = withRepeat(
      withSequence(withTiming(1, { duration }), withTiming(0.5, { duration })),
      -1
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      opacity: scaleAnim.value,
    };
  });

  return (
    <View style={{ paddingTop: s(50), paddingBottom: s(15) }}>
      <Animated.View style={containerStyle}>
        <FontAwesome
          name="flash"
          size={s(100)}
          color={colors.warning} // Using warning color for energy, adjust as needed
        />
      </Animated.View>
    </View>
  );
};

const EnergyModal: React.FC = () => {
  const { isVisible, setIsVisible } = useEnergyStore();
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const styles = createStyles(colors);
  const isLoaded = useAdMobStore((state) => state.rewardLoaded);
  const reward = useAdMobStore((state) => state.reward);

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)} // Handle Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <AnimatedEnergyIcon />
          <Text style={styles.titleText}>{t("common.energyModalTitle")}</Text>
          <Text style={styles.messageText}>
            {t("common.energyModalMessage")}
          </Text>
          <GameButtons
            fontSize={s(15)}
            primaryButtonText={t("common.letCharge")}
            skipButtonText={t("common.goBack")}
            skipButtonTextColor="black"
            onPrimaryPress={() => {
              if (!isLoaded) return;
              reward?.show();
              setIsVisible(false);
            }}
            onSkipPress={() => {
              setIsVisible(false);
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (
  colors: any // Define a proper type for colors if available
) =>
  ScaledSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    container: {
      width: "85%",
      maxWidth: s(320),
      padding: ms(20),
      backgroundColor: colors.card,
      borderRadius: s(12),
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    icon: {
      marginBottom: ms(15),
    },
    titleText: {
      fontSize: ms(20),
      fontWeight: "bold",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: ms(10),
    },
    messageText: {
      fontSize: ms(16),
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: ms(25),
      lineHeight: ms(22),
    },
    button: {
      paddingVertical: ms(12),
      paddingHorizontal: ms(30),
      borderRadius: s(8),
      alignItems: "center",
      width: "100%",
    },
    buttonText: {
      fontSize: ms(16),
      fontWeight: "bold",
    },
  });

export default EnergyModal;
