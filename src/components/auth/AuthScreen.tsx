import React, { ReactNode, useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenProps = {
  children: ReactNode;
  contentOffset?: number;
  headerTop?: number;
};

export function AuthScreen({
  children,
  contentOffset = 280,
  headerTop = 64,
}: AuthScreenProps) {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showListener = Keyboard.addListener(showEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
    });
    const hideListener = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-otokas-primary" edges={["top"]}>
      <View
        className="absolute left-0 right-0 items-center justify-center z-0 pointer-events-none"
        style={{ top: headerTop }}
      >
        <View className="bg-white p-4 rounded-3xl mb-4">
          <Image
            source={require("../../../assets/images/splash-icon.png")}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
        </View>
        <Text className="text-white text-4xl font-bold tracking-tight">
          OTOKAS
        </Text>
        <Text className="text-blue-200 mt-1">Kelola Motor Bekas Anda</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1 z-10"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={{ height: isKeyboardVisible ? 40 : contentOffset }} />
          <View className="flex-1 bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl">
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthFormHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <Text className="text-2xl font-bold text-slate-900">{title}</Text>
      <Text className="text-slate-400 mt-1 mb-8">{description}</Text>
    </>
  );
}
