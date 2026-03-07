import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
	useController,
	type Control,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";
import {
	Pressable,
	Text,
	TextInput,
	View,
	type TextInputProps,
} from "react-native";
import { twMerge } from "tailwind-merge";

type TextInputFieldProps<T extends FieldValues> = TextInputProps & {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	icon?: React.ReactNode;
};

export function TextInputField<T extends FieldValues>({
	control,
	name,
	label,
	...textInputProps
}: TextInputFieldProps<T>) {
	const {
		field: { onChange, onBlur, value },
		fieldState: { error },
	} = useController({ control, name });
	const [isFocused, setIsFocused] = useState(false);
	const [isSecure, setIsSecure] = useState(textInputProps.secureTextEntry);

	return (
		<View className="mb-4">
			{label && (
				<Text className="text-neutral-400 text-xs font-semibold tracking-wider uppercase mb-2">
					{label}
				</Text>
			)}
			<View
				className={twMerge(
					"flex-row items-center bg-neutral-900 border border-neutral-800 rounded-xl py-3.5 px-4",
					error && "border-red-400",
					isFocused && "border-amber-400",
				)}
			>
				{textInputProps.icon && (
					<View className="mr-3">{textInputProps.icon}</View>
				)}
				<TextInput
					value={value}
					onChangeText={onChange}
					placeholderTextColor="#404040"
					className="flex-1 text-white text-sm outline-0"
					autoCapitalize="none"
					autoCorrect={false}
					onFocus={(e) => {
						if (textInputProps.onFocus) textInputProps.onFocus(e);
						setIsFocused(true);
					}}
					onBlur={(e) => {
						if (textInputProps.onBlur) textInputProps.onBlur(e);
						onBlur();
						setIsFocused(false);
					}}
					{...textInputProps}
					secureTextEntry={isSecure}
				/>
				{textInputProps.secureTextEntry && (
					<Pressable
						onPress={() => {
							setIsSecure((prev) => !prev);
						}}
						className="ml-3"
					>
						<Ionicons
							name={isSecure ? "eye-off" : "eye"}
							size={16}
							color="#737373"
						/>
					</Pressable>
				)}
			</View>
			{error && (
				<Text className="text-red-400 text-xs mt-1">{error.message}</Text>
			)}
		</View>
	);
}
