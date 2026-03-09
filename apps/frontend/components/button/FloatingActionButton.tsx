import { type ReactNode } from "react";
import { Pressable, type PressableProps, View } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";

// ── Types ──────────────────────────────────────────────────────────────
type Variant = "primary" | "secondary" | "ghost" | "destructive";

type Size = "sm" | "md" | "lg";

type FloatingActionButtonProps = Omit<PressableProps, "children"> & {
	/** Visual variant — defaults to `"primary"` */
	variant?: Variant;
	/** Size preset — defaults to `"md"` */
	size?: Size;
	/** Icon element (e.g. `<Ionicons … />`) */
	icon: ReactNode;
	/** Optional label rendered beside the icon */
	label?: ReactNode;
	/** Extra Tailwind classes merged on the outer container */
	className?: string;
	/** Position on screen — defaults to `"bottom-right"` */
	position?: "bottom-right" | "bottom-left" | "bottom-center";
};

// ── Style maps ─────────────────────────────────────────────────────────

const variantContainer: Record<Variant, string> = {
	primary: "bg-amber-400 active:opacity-80",
	secondary: "bg-neutral-900 border border-neutral-800 active:opacity-80",
	ghost: "bg-neutral-800 active:bg-neutral-700",
	destructive: "border border-red-900/60 bg-red-950/60 active:bg-red-950/80",
};

const sizeMap: Record<Size, { container: string; iconOnly: string }> = {
	sm: { container: "px-4 py-3", iconOnly: "w-12 h-12" },
	md: { container: "px-5 py-4", iconOnly: "w-14 h-14" },
	lg: { container: "px-6 py-5", iconOnly: "w-16 h-16" },
};

const positionMap: Record<
	NonNullable<FloatingActionButtonProps["position"]>,
	string
> = {
	"bottom-right": "right-5 bottom-8",
	"bottom-left": "left-5 bottom-8",
	"bottom-center": "self-center bottom-8",
};

const shadowStyle = {
	shadowColor: "#000",
	shadowOffset: { width: 0, height: 4 },
	shadowOpacity: 0.35,
	shadowRadius: 8,
	elevation: 8,
};

// ── Component ──────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingActionButton({
	variant = "primary",
	size = "md",
	icon,
	label,
	className,
	position = "bottom-right",
	disabled = false,
	onPress,
	...rest
}: FloatingActionButtonProps) {
	const hasLabel = !!label;

	const containerCls = twMerge(
		"absolute z-50 flex-row items-center justify-center rounded-full overflow-hidden",
		variantContainer[variant],
		hasLabel ? sizeMap[size].container : sizeMap[size].iconOnly,
		positionMap[position],
		disabled && "opacity-50",
		className,
	);

	return (
		<AnimatedPressable
			onPress={disabled ? undefined : onPress}
			disabled={disabled}
			className={containerCls}
			style={shadowStyle}
			entering={FadeIn.duration(200)}
			exiting={FadeOut.duration(150)}
			layout={LinearTransition.springify().damping(18).stiffness(140)}
			{...rest}
		>
			<View>{icon}</View>
			{hasLabel && <View className="ml-2">{label}</View>}
		</AnimatedPressable>
	);
}
