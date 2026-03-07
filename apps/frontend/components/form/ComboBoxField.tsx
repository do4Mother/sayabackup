import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
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
	TextInput,
	View,
	type ViewProps,
} from "react-native";

export type ComboBoxOption = {
	label: string;
	value: string;
};

type ComboBoxFieldProps<T extends FieldValues> = ViewProps & {
	control: Control<T>;
	name: FieldPath<T>;
	label?: string;
	placeholder?: string;
	searchPlaceholder?: string;
	options: ComboBoxOption[];
	emptyMessage?: string;
};

export function ComboBoxField<T extends FieldValues>({
	control,
	name,
	label,
	placeholder = "Select an option",
	searchPlaceholder = "Search...",
	options,
	emptyMessage = "No results found",
	...viewProps
}: ComboBoxFieldProps<T>) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const {
		field: { onChange, value },
		fieldState: { error },
	} = useController({ control, name });

	const filtered = useMemo(() => {
		if (!search.trim()) return options;
		const query = search.toLowerCase();
		return options.filter((o) => o.label.toLowerCase().includes(query));
	}, [search, options]);

	const handleOpen = () => {
		setSearch("");
		setOpen(true);
	};

	const selected = options.find((o) => o.value === value);

	return (
		<View className="mb-4" {...viewProps}>
			{label && (
				<Text className="text-neutral-400 text-xs font-semibold tracking-wider uppercase mb-2">
					{label}
				</Text>
			)}

			<Pressable
				onPress={handleOpen}
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
				<Ionicons name="chevron-expand" size={16} color="#737373" />
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
						className="bg-neutral-900 rounded-t-3xl max-h-[70%] border-t border-neutral-800"
					>
						<View className="items-center pt-3 pb-1">
							<View className="w-10 h-1 rounded-full bg-neutral-700" />
						</View>

						{label && (
							<Text className="text-white text-base font-bold px-5 pt-3 pb-2">
								{label}
							</Text>
						)}

						{/* Search Input */}
						<View className="mx-4 mb-2 flex-row items-center bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
							<View className="pl-3.5 pr-2">
								<Ionicons name="search" size={16} color="#737373" />
							</View>
							<TextInput
								value={search}
								onChangeText={setSearch}
								placeholder={searchPlaceholder}
								placeholderTextColor="#404040"
								className="flex-1 text-white text-sm py-3 pr-3"
								autoCapitalize="none"
								autoCorrect={false}
								autoFocus
							/>
							{search.length > 0 && (
								<Pressable
									onPress={() => setSearch("")}
									className="pr-3.5 pl-2"
								>
									<Ionicons name="close-circle" size={16} color="#737373" />
								</Pressable>
							)}
						</View>

						<FlatList
							data={filtered}
							keyExtractor={(item) => item.value}
							keyboardShouldPersistTaps="handled"
							contentContainerStyle={{
								paddingHorizontal: 12,
								paddingBottom: 40,
							}}
							ListEmptyComponent={
								<View className="items-center py-8">
									<Ionicons name="search-outline" size={28} color="#525252" />
									<Text className="text-neutral-500 text-sm mt-2">
										{emptyMessage}
									</Text>
								</View>
							}
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
