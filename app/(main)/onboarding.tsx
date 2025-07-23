import { Nunito_900Black } from "@expo-google-fonts/nunito";
import {
    Canvas,
    Circle,
    Group,
    Text as SkiaText,
    useFont,
} from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const CIRCLE_RADIUS = 50;
const PARTICLE_COUNT = 20;

const WelcomeScreen = () => {
  const fontSize = 32;
  const font = useFont(Nunito_900Black, fontSize);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: useSharedValue(Math.random() * width),
    y: useSharedValue(Math.random() * height),
    scale: useSharedValue(0),
  }));

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 1000 });

    particles.forEach((particle, index) => {
      particle.scale.value = withSequence(
        withDelay(index * 50, withTiming(1, { duration: 500 })),
        withDelay(1000 + index * 50, withTiming(0, { duration: 500 }))
      );
      particle.x.value = withTiming(Math.random() * width, { duration: 1500 });
      particle.y.value = withTiming(Math.random() * height, { duration: 1500 });
    });
  }, []);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {particles.map((particle, index) => (
          <Group key={index}>
            <Circle
              cx={particle.x}
              cy={particle.y}
              r={CIRCLE_RADIUS * particle.scale.value}
              color={`hsl(${Math.random() * 360}, 70%, 50%)`}
            />
          </Group>
        ))}
        <Group
          transform={[
            { translateX: width / 2 - 150 },
            { translateY: height / 2 - 50 },
          ]}
        >
          <SkiaText
            x={0}
            y={0}
            text="Welcome to Onboard"
            color="#333"
            font={font}
          />
          <SkiaText
            x={0}
            y={60}
            text="My Application for Learn English Word"
            color="#666"
            font={font}
          />
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  canvas: {
    flex: 1,
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    top: height / 2 - 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
});

export default WelcomeScreen;
