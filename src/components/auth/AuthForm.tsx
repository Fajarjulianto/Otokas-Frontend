import { Eye, EyeOff } from "lucide-react-native";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string;
  success?: string;
  trailing?: ReactNode;
  containerClassName?: string;
  inputClassName?: string;
};

export function AuthField({
  label,
  error,
  success,
  trailing,
  containerClassName = "mb-5",
  inputClassName = "",
  ...inputProps
}: AuthFieldProps) {
  const borderClass = error
    ? "border-red-300"
    : success
      ? "border-emerald-400"
      : "border-slate-200";

  return (
    <View className={containerClassName}>
      <Text className="text-slate-700 font-semibold mb-2">{label}</Text>
      <View className="relative">
        <TextInput
          {...inputProps}
          className={`w-full bg-slate-50 border p-4 rounded-xl text-slate-900 ${borderClass} ${inputClassName}`}
        />
        {trailing && <View className="absolute right-4 top-4">{trailing}</View>}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1.5 ml-1">{error}</Text>
      )}
      {success && (
        <Text className="text-emerald-600 text-xs mt-1.5 ml-1 font-medium">
          {success}
        </Text>
      )}
    </View>
  );
}

type PasswordFieldProps = Omit<AuthFieldProps, "trailing" | "secureTextEntry"> & {
  visible: boolean;
  onToggleVisibility: () => void;
};

export function PasswordField({
  visible,
  onToggleVisibility,
  ...props
}: PasswordFieldProps) {
  return (
    <AuthField
      {...props}
      secureTextEntry={!visible}
      trailing={
        <TouchableOpacity onPress={onToggleVisibility}>
          {visible ? (
            <EyeOff size={20} color="#94a3b8" />
          ) : (
            <Eye size={20} color="#94a3b8" />
          )}
        </TouchableOpacity>
      }
    />
  );
}

export function AuthError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
      <Text className="text-red-600 text-sm font-medium">{message}</Text>
    </View>
  );
}

type AuthSubmitButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
};

export function AuthSubmitButton({
  label,
  onPress,
  disabled,
  loading = false,
}: AuthSubmitButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`w-full p-4 rounded-2xl shadow-lg active:opacity-90 ${
        !disabled && !loading ? "bg-[#f59e0b]" : "bg-slate-200"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text
          className={`text-center font-bold text-lg ${
            disabled ? "text-slate-400" : "text-white"
          }`}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
