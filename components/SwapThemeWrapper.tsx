import useThemeStore from "@/store/themeStore";
import { delay } from "@/utils";
import type { SkImage } from "@shopify/react-native-skia";
import {
  Canvas,
  Circle,
  Image,
  ImageShader,
  makeImageFromView,
} from "@shopify/react-native-skia";

import React, { useRef } from "react";
import { PixelRatio, useWindowDimensions, View } from "react-native";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
const pd = PixelRatio.get();

const OverlayImage: React.FC<{
  image: SkImage | null;
  image2: SkImage | null;
  onAnimationFinished?: () => void;
}> = ({ image, image2, onAnimationFinished }) => {
  const { width, height } = useWindowDimensions();
  const r = useSharedValue(12);

  React.useEffect(() => {
    cancelAnimation(r);
    if (!!image2 && !!image) {
      r.value = withTiming(1000, { duration: 800 }, (finished) => {
        if (finished && onAnimationFinished) {
          runOnJS(onAnimationFinished)();
        }
      });
    } else {
      r.value = 12;
    }
  }, [image2, image]);

  return (
    <Canvas style={{ flex: 1 }}>
      {!!image && (
        <Image
          image={image}
          fit="contain"
          x={0}
          y={0}
          width={image.width() / pd}
          height={image.height() / pd}
        />
      )}
      {!!image2 && (
        <Circle cx={width / 2} cy={height / 2} r={r}>
          <ImageShader
            image={image2}
            fit="cover"
            rect={{
              x: 0,
              y: 0,
              width: image2.width() / pd,
              height: image2.height() / pd,
            }}
          />
        </Circle>
      )}
    </Canvas>
  );
};

const SwapThemeWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isSwappingTheme = useThemeStore((state) => state.isSwappingTheme);
  const setToggleSwappingTheme = useThemeStore(
    (state) => state.setIsSwappingTheme
  );
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isVisible = useSharedValue(false);
  const [image, setImage] = React.useState<SkImage | null>(null);
  const [image2, setImage2] = React.useState<SkImage | null>(null);
  const ref = useRef<View>(null);

  const snapshoot = async () => {
    await delay(100);
    // Take the snapshot of the view
    const snapshot = await makeImageFromView(ref as never);
    setImage(snapshot);
    await delay(100);
    isVisible.value = true;
    toggleTheme();
    await delay(200);
    const snapshot2 = await makeImageFromView(ref as never);
    setImage2(snapshot2);
  };

  React.useEffect(() => {
    if (isSwappingTheme) {
      snapshoot();
    } else {
      setImage(null);
      setImage2(null);
      isVisible.value = false;
    }
  }, [isSwappingTheme]);

  const canvasContainerStyle = useAnimatedStyle(() => {
    return {
      zIndex: isVisible.value ? 2 : -1,
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <View ref={ref} style={{ flex: 1 }} collapsable={false}>
        {children}
      </View>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
          },
          canvasContainerStyle,
        ]}
      >
        <OverlayImage
          image={image}
          image2={image2}
          onAnimationFinished={() => setToggleSwappingTheme(false)}
        />
      </Animated.View>
    </View>
  );
};

export default SwapThemeWrapper;
