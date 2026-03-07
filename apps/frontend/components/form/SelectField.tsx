import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
	useController,
	type Control,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";
import {
	FlatList,
	Modal,
	Pressable,
	Text,
	View,
	type ViewProps,
} from "react-native";

export type SelectOption = {
	label: string;
	value: string;
};

type SelectFieldProps<T extends FieldValues> = ViewProps & {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	placeholder?: string;
	options: SelectOption[];
};

export function SelectField<T extends FieldValues>({
	control,
	name,
	label,
	placeholder = "Select an option",
	options,
	...viewProps
}: SelectFieldProps<T>) {
	const [open, setOpen] = useState(false);
	const {
		field: { onChange, value },
		fieldState: { error },
	} = useController({ control, name });

	const selected = options.find((o) => o.value === value);

	return (
		<View className="mb-4" {...viewProps}>
			{label && (
				<Text className="text-neutral-400 text-xs font-semibold tracking-wider uppercase mb-2">
					{label}
				</Text>
			)}

			<Pressable
				onPress={() => setOpen(true)}
				className="flex-row items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl py-3.5 px-4"
			>
				<Text
					className={
						selected
							? "text-white text-sm flex-1"
							: "text-neutral-600 text-sm flex-1"
					}
				>
					{selected ? selected.label : placeholder}
				</Text>
				<Ionicons name="chevron-down" size={16} color="#737373" />
			</Pressable>

			{error && (
				<Text className="text-red-400 text-xs mt-1">{error.message}</Text>
			)}

			<Modal
				visible={open}
				transparent
				animationType="fade"
				onRequestClose={() => setOpen(false)}
			>
				<Pressable
					className="flex-1 bg-black/60 justify-end"
					onPress={() => setOpen(false)}
				>
					<Pressable
						onPress={() => {}}
						className="bg-neutral-900 rounded-t-3xl max-h-[60%] border-t border-neutral-800"
					>
						<View className="items-center pt-3 pb-1">
							<View className="w-10 h-1 rounded-full bg-neutral-700" />
						</View>

						{label && (
							<Text className="text-white text-base font-bold px-5 pt-3 pb-2">
								{label}
							</Text>
						)}

						<FlatList
							data={options}
							keyExtractor={(item) => item.value}
							contentContainerStyle={{
								paddingHorizontal: 12,
								paddingBottom: 40,
							}}
							renderItem={({ item }) => {
								const isSelected = item.value === value;
								return (
									<Pressable
										onPress={() => {
											onChange(item.value);
											setOpen(false);
										}}
										className={`flex-row items-center justify-between px-4 py-3.5 rounded-xl ${
											isSelected ? "bg-neutral-800" : "active:bg-neutral-800/50"
										}`}
									>
										<Text
											className={`text-sm ${
												isSelected
													? "text-white font-semibold"
													: "text-neutral-300"
											}`}
										>
											{item.label}
										</Text>
										{isSelected && (
											<Ionicons name="checkmark" size={18} color="#ec4899" />
										)}
									</Pressable>
								);
							}}
						/>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}
