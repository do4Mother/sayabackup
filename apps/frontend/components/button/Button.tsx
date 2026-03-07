import { useEffect, type ReactNode } from "react";
import { Pressable, Text, View, type PressableProps } from "react-native";
import Animated, {
	Easing,
	FadeIn,
	FadeOut,
	LinearTransition,
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";

// ── Variant / Size unions ──────────────────────────────────────────────
type Variant =
	| "primary"
	| "secondary"
	| "ghost"
	| "destructive"
	| "outline"
	| "icon"
	| "link";

type Size = "xs" | "sm" | "md" | "lg";

// ── Props ──────────────────────────────────────────────────────────────
type AppButtonProps = Omit<PressableProps, "children"> & {
	/** Visual variant — defaults to `"primary"` */
	variant?: Variant;
	/** Size preset — defaults to `"md"` */
	size?: Size;
	/** Show a loading spinner and disable interactions */
	loading?: boolean;
	/** Leading icon element (e.g. `<Ionicons … />`) */
	icon?: ReactNode;
	/** Trailing icon element */
	iconRight?: ReactNode;
	/** Label text – alternatively pass children */
	label?: string;
	/** Arbitrary children (takes precedence over `label`) */
	children?: ReactNode;
	/** Extra Tailwind classes merged on the outer Pressable */
	className?: string;
	/** Extra Tailwind classes merged on the label Text */
	textClassName?: string;
	/** Stretch to full width (default `true` for non-icon variants) */
	fullWidth?: boolean;
	/** Make the button circular — mainly used with `icon` variant */
	round?: boolean;
};

// ── Style maps ─────────────────────────────────────────────────────────

const containerBase = "flex-row items-center justify-center rounded-xl";

const variantContainer: Record<Variant, string> = {
	primary: "bg-amber-400 active:opacity-80",
	secondary: "bg-neutral-900 border border-neutral-800 active:opacity-80",
	ghost: "bg-neutral-800 active:bg-neutral-700",
	destructive: "border border-red-900/60 active:bg-red-950/40",
	outline: "border border-neutral-800 active:bg-neutral-900",
	icon: "bg-neutral-900 border border-neutral-800 active:bg-neutral-800",
	link: "active:opacity-60",
};

const disabledContainer: Record<Variant, string> = {
	primary: "bg-neutral-800",
	secondary: "bg-neutral-900 border border-neutral-800 opacity-50",
	ghost: "bg-neutral-800 opacity-50",
	destructive: "border border-neutral-800 opacity-50",
	outline: "border border-neutral-800 opacity-50",
	icon: "bg-neutral-900 border border-neutral-800 opacity-50",
	link: "opacity-40",
};

const sizeContainer: Record<Size, string> = {
	xs: "px-3 py-1.5",
	sm: "px-4 py-2",
	md: "px-5 py-3",
	lg: "px-6 py-4",
};

const iconSizeContainer: Record<Size, string> = {
	xs: "w-8 h-8",
	sm: "w-9 h-9",
	md: "w-10 h-10",
	lg: "w-12 h-12",
};

const variantText: Record<Variant, string> = {
	primary: "text-neutral-950 font-bold tracking-wide",
	secondary: "text-white font-semibold",
	ghost: "text-neutral-300 font-semibold",
	destructive: "text-red-400 font-semibold",
	outline: "text-neutral-300 font-semibold",
	icon: "text-white",
	link: "text-neutral-400 font-medium",
};

const disabledText: Record<Variant, string> = {
	primary: "text-neutral-500 font-semibold",
	secondary: "text-neutral-500 font-semibold",
	ghost: "text-neutral-500 font-semibold",
	destructive: "text-neutral-500 font-semibold",
	outline: "text-neutral-500 font-semibold",
	icon: "text-neutral-500",
	link: "text-neutral-600 font-medium",
};

const sizeText: Record<Size, string> = {
	xs: "text-xs",
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
};

const spinnerColor: Record<Variant, string> = {
	primary: "#171717",
	secondary: "#ffffff",
	ghost: "#d4d4d4",
	destructive: "#f87171",
	outline: "#d4d4d4",
	icon: "#ffffff",
	link: "#a3a3a3",
};

// ── Animated spinner ───────────────────────────────────────────────────

const SPINNER_SIZES: Record<Size, number> = { xs: 14, sm: 16, md: 18, lg: 22 };

function Spinner({ size, color }: { size: Size; color: string }) {
	const rotation = useSharedValue(0);

	useEffect(() => {
		rotation.value = withRepeat(
			withTiming(360, { duration: 700, easing: Easing.linear }),
			-1,
			false,
		);
		return () => cancelAnimation(rotation);
	}, [rotation]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
	}));

	const s = SPINNER_SIZES[size];

	return (
		<Animated.View
			style={[
				{
					width: s,
					height: s,
					borderRadius: s / 2,
					borderWidth: 2.5,
					borderColor: `${color}30`,
					borderTopColor: color,
				},
				animatedStyle,
			]}
		/>
	);
}

// ── Component ──────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
	variant = "primary",
	size = "md",
	loading = false,
	disabled = false,
	icon,
	iconRight,
	label,
	children,
	className,
	textClassName,
	fullWidth,
	round = false,
	onPress,
	...rest
}: AppButtonProps) {
	const isIcon = variant === "icon" || variant === "link";
	const isDisabled = disabled || loading;
	const shouldFullWidth = fullWidth ?? !isIcon;

	// ── Container classes ────────────────────────────────────────────
	const containerCls = twMerge(
		containerBase,
		isDisabled ? disabledContainer[variant] : variantContainer[variant],
		isIcon ? iconSizeContainer[size] : sizeContainer[size],
		shouldFullWidth && "w-full",
		round && "rounded-full",
		!round && isIcon && "rounded-full",
		"overflow-hidden",
		className,
	);

	// ── Text classes ─────────────────────────────────────────────────
	const textCls = twMerge(
		isDisabled ? disabledText[variant] : variantText[variant],
		sizeText[size],
		(icon || iconRight) && !isIcon && "mx-1",
		textClassName,
	);

	// ── Content ──────────────────────────────────────────────────────
	const content =
		children ?? (label ? <Text className={textCls}>{label}</Text> : null);

	return (
		<AnimatedPressable
			onPress={isDisabled ? undefined : onPress}
			disabled={isDisabled}
			className={containerCls}
			layout={LinearTransition.springify().damping(18).stiffness(140)}
			{...rest}
		>
			{loading ? (
				<Animated.View
					key="loader"
					entering={FadeIn.duration(200)}
					exiting={FadeOut.duration(150)}
				>
					<Spinner size={size} color={spinnerColor[variant]} />
				</Animated.View>
			) : (
				<Animated.View
					key="content"
					entering={FadeIn.duration(200)}
					exiting={FadeOut.duration(150)}
					className="flex-row items-center justify-center"
				>
					{icon && <View className={content ? "mr-2" : ""}>{icon}</View>}
					{content}
					{iconRight && (
						<View className={content ? "ml-2" : ""}>{iconRight}</View>
					)}
				</Animated.View>
			)}
		</AnimatedPressable>
	);
}
