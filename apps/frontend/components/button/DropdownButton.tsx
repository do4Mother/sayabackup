import {
	Children,
	createContext,
	isValidElement,
	useCallback,
	useContext,
	useRef,
	useState,
	type ReactElement,
	type ReactNode,
} from "react";
import {
	Modal,
	Pressable,
	Text,
	View,
	type LayoutRectangle,
	type PressableProps,
} from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";

// ── Context (internal) ─────────────────────────────────────────────────

type DropdownCtx = {
	close: () => void;
	totalItems: number;
	getIndex: () => number;
};

const DropdownContext = createContext<DropdownCtx | null>(null);

// ── Types ──────────────────────────────────────────────────────────────

type Variant = "primary" | "secondary" | "ghost" | "outline";

type Size = "xs" | "sm" | "md" | "lg";

// ── DropdownButtonItem ─────────────────────────────────────────────────

type DropdownButtonItemProps = {
	/** Display label */
	label: string;
	/** Optional leading icon */
	icon?: ReactNode;
	/** Destructive styling (red text) */
	destructive?: boolean;
	/** Disabled state */
	disabled?: boolean;
	/** Called when the item is pressed */
	onPress: () => void;
};

/** Mark for validation */
const DROPDOWN_ITEM_TYPE = Symbol.for("DropdownButtonItem");

export function DropdownButtonItem({
	label,
	icon,
	destructive = false,
	disabled = false,
	onPress,
}: DropdownButtonItemProps) {
	const ctx = useContext(DropdownContext);
	if (!ctx) {
		throw new Error(
			"<DropdownButtonItem> must be used as a child of <DropdownButton>.",
		);
	}

	const index = ctx.getIndex();

	return (
		<Pressable
			disabled={disabled}
			onPress={() => {
				ctx.close();
				onPress();
			}}
			className={twMerge(
				"flex-row items-center px-4 py-3 active:bg-neutral-800",
				index < ctx.totalItems - 1 && "border-b border-neutral-800/60",
				disabled && "opacity-40",
			)}
		>
			{icon && <View className="mr-3">{icon}</View>}
			<Text
				className={twMerge(
					"text-sm font-medium flex-1",
					destructive ? "text-red-400" : "text-neutral-200",
					disabled && "text-neutral-500",
				)}
			>
				{label}
			</Text>
		</Pressable>
	);
}

/** Attach symbol so we can validate children */
DropdownButtonItem._dropdownItemType = DROPDOWN_ITEM_TYPE;

// ── DropdownButton ─────────────────────────────────────────────────────

type DropdownButtonProps = Omit<PressableProps, "children"> & {
	/** Visual variant — defaults to `"secondary"` */
	variant?: Variant;
	/** Size preset — defaults to `"md"` */
	size?: Size;
	/** Leading icon element */
	icon?: ReactNode;
	/** Trailing icon element (defaults to chevron-down) */
	iconRight?: ReactNode;
	/** Button label */
	label?: string;
	/** Children must be `<DropdownButtonItem>` elements */
	children:
		| ReactElement<DropdownButtonItemProps>
		| ReactElement<DropdownButtonItemProps>[];
	/** Extra Tailwind classes on the trigger button */
	className?: string;
	/** Extra Tailwind classes on the label text */
	textClassName?: string;
	/** Stretch to full width */
	fullWidth?: boolean;
	/** Menu alignment — defaults to `"left"` */
	align?: "left" | "right";
};

// ── Style maps ─────────────────────────────────────────────────────────

const containerBase = "flex-row items-center justify-center rounded-xl";

const variantContainer: Record<Variant, string> = {
	primary: "bg-amber-400 active:opacity-80",
	secondary: "bg-neutral-900 border border-neutral-800 active:opacity-80",
	ghost: "bg-transparent active:bg-neutral-700",
	outline: "border border-neutral-800 active:bg-neutral-900",
};

const disabledContainer: Record<Variant, string> = {
	primary: "bg-neutral-800",
	secondary: "bg-neutral-900 border border-neutral-800 opacity-50",
	ghost: "bg-neutral-800 opacity-50",
	outline: "border border-neutral-800 opacity-50",
};

const sizeContainer: Record<Size, string> = {
	xs: "px-3 py-1.5",
	sm: "px-4 py-2",
	md: "px-5 py-3",
	lg: "px-6 py-4",
};

const variantText: Record<Variant, string> = {
	primary: "text-neutral-950 font-bold tracking-wide",
	secondary: "text-white font-semibold",
	ghost: "text-neutral-300 font-semibold",
	outline: "text-neutral-300 font-semibold",
};

const disabledText: Record<Variant, string> = {
	primary: "text-neutral-500 font-semibold",
	secondary: "text-neutral-500 font-semibold",
	ghost: "text-neutral-500 font-semibold",
	outline: "text-neutral-500 font-semibold",
};

const sizeText: Record<Size, string> = {
	xs: "text-xs",
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
};

const _chevronColor: Record<Variant, string> = {
	primary: "#171717",
	secondary: "#a3a3a3",
	ghost: "#a3a3a3",
	outline: "#a3a3a3",
};

const _chevronSize: Record<Size, number> = {
	xs: 12,
	sm: 14,
	md: 16,
	lg: 18,
};

// ── Component ──────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DropdownButton({
	variant = "secondary",
	size = "md",
	icon,
	iconRight,
	label,
	children,
	className,
	textClassName,
	fullWidth = false,
	align = "left",
	disabled = false,
	...rest
}: DropdownButtonProps) {
	// ── Validate children ────────────────────────────────────────────
	const validChildren = Children.toArray(children).filter((child) => {
		if (!isValidElement(child)) return false;
		const type = child.type as typeof DropdownButtonItem;
		if (type._dropdownItemType !== DROPDOWN_ITEM_TYPE) {
			const name =
				(type as unknown as { displayName?: string })?.displayName ??
				(type as unknown as { name?: string })?.name ??
				type;
			console.warn(
				"[DropdownButton] Only <DropdownButtonItem> is allowed as a child. Found:",
				name,
			);
			return false;
		}
		return true;
	});

	const totalItems = validChildren.length;

	const [open, setOpen] = useState(false);
	const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
	const triggerRef = useRef<View>(null);

	const measureAndOpen = useCallback(() => {
		triggerRef.current?.measureInWindow((x, y, width, height) => {
			setAnchor({ x, y, width, height });
			setOpen(true);
		});
	}, []);

	const close = useCallback(() => setOpen(false), []);

	// Counter ref for providing sequential indices to items
	let indexCounter = -1;
	const getIndex = () => {
		indexCounter += 1;
		return indexCounter;
	};

	// ── Trigger classes ──────────────────────────────────────────────
	const containerCls = twMerge(
		containerBase,
		disabled ? disabledContainer[variant] : variantContainer[variant],
		sizeContainer[size],
		fullWidth && "w-full",
		"overflow-hidden",
		className,
	);

	const textCls = twMerge(
		disabled ? disabledText[variant] : variantText[variant],
		sizeText[size],
		(icon || iconRight) && "mx-1",
		textClassName,
	);

	// ── Chevron ──────────────────────────────────────────────────────
	const trailing = iconRight;

	// ── Label content ────────────────────────────────────────────────
	const triggerContent = label ? (
		<Text className={textCls}>{label}</Text>
	) : null;

	// ── Menu position ────────────────────────────────────────────────
	const menuStyle = anchor
		? {
				position: "absolute" as const,
				top: anchor.y + anchor.height + 6,
				...(align === "right"
					? { right: undefined, left: anchor.x + anchor.width - 200 }
					: { left: anchor.x }),
				minWidth: Math.max(anchor.width, 180),
				maxWidth: 280,
			}
		: {};

	return (
		<>
			{/* ── Trigger button ────────────────────────────────────── */}
			<View ref={triggerRef} collapsable={false}>
				<AnimatedPressable
					onPress={disabled ? undefined : measureAndOpen}
					disabled={disabled}
					className={containerCls}
					layout={LinearTransition.springify().damping(18).stiffness(140)}
					{...rest}
				>
					<Animated.View
						key="content"
						entering={FadeIn.duration(200)}
						exiting={FadeOut.duration(150)}
						className="flex-row items-center justify-center"
					>
						{icon && (
							<View className={triggerContent ? "mr-2" : ""}>{icon}</View>
						)}
						{triggerContent}
						<View className={triggerContent ? "ml-2" : ""}>{trailing}</View>
					</Animated.View>
				</AnimatedPressable>
			</View>

			{/* ── Dropdown menu (modal overlay) ─────────────────────── */}
			<Modal
				visible={open}
				transparent
				animationType="none"
				onRequestClose={close}
			>
				{/* Backdrop */}
				<Pressable className="flex-1" onPress={close}>
					{/* Menu */}
					<Animated.View
						entering={FadeIn.duration(150)}
						exiting={FadeOut.duration(100)}
						style={[menuStyle, shadowStyle]}
						className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
					>
						<DropdownContext.Provider value={{ close, totalItems, getIndex }}>
							{validChildren}
						</DropdownContext.Provider>
					</Animated.View>
				</Pressable>
			</Modal>
		</>
	);
}

// ── Drop shadow (consistent with FAB) ─────────────────────────────────

const shadowStyle = {
	shadowColor: "#000",
	shadowOffset: { width: 0, height: 4 },
	shadowOpacity: 0.4,
	shadowRadius: 10,
	elevation: 10,
};
