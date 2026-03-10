import {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { AppButton } from "../button/AppButton";

// ── Types ──────────────────────────────────────────────────────────────

type AlertButtonStyle = "default" | "cancel" | "destructive";

type AlertButton = {
	text: string;
	style?: AlertButtonStyle;
	onPress?: () => void;
};

type AlertState = {
	visible: boolean;
	title: string;
	message?: string;
	buttons: AlertButton[];
};

type AlertContextValue = {
	alert: (title: string, message?: string, buttons?: AlertButton[]) => void;
};

// ── Context ────────────────────────────────────────────────────────────

const AlertContext = createContext<AlertContextValue | null>(null);

// ── Hook ───────────────────────────────────────────────────────────────

export function useAlert(): AlertContextValue {
	const ctx = useContext(AlertContext);
	if (!ctx) {
		throw new Error("useAlert must be used within an <AlertProvider>");
	}
	return ctx;
}

// ── Button variant mapping ─────────────────────────────────────────────

function getButtonVariant(
	style?: AlertButtonStyle,
	isOnly?: boolean,
): "primary" | "ghost" | "destructive" {
	if (style === "destructive") return "destructive";
	if (style === "cancel") return "ghost";
	return isOnly ? "primary" : "ghost";
}

// ── Provider ───────────────────────────────────────────────────────────

const ENTER_MS = 180;
const EXIT_MS = 150;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AlertProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AlertState>({
		visible: false,
		title: "",
		message: undefined,
		buttons: [],
	});

	// Keep content mounted during exit animation
	const [mounted, setMounted] = useState(false);
	const backdropOpacity = useSharedValue(0);
	const dialogScale = useSharedValue(0.95);
	const dialogOpacity = useSharedValue(0);
	const pendingCallback = useRef<(() => void) | undefined>(undefined);

	const animateIn = useCallback(() => {
		backdropOpacity.value = withTiming(1, { duration: ENTER_MS });
		dialogScale.value = withTiming(1, { duration: ENTER_MS });
		dialogOpacity.value = withTiming(1, { duration: ENTER_MS });
	}, [backdropOpacity, dialogScale, dialogOpacity]);

	const finishDismiss = useCallback(() => {
		setMounted(false);
		setState((prev) => ({ ...prev, visible: false }));
		const cb = pendingCallback.current;
		pendingCallback.current = undefined;
		cb?.();
	}, []);

	const animateOut = useCallback(() => {
		backdropOpacity.value = withTiming(0, { duration: EXIT_MS });
		dialogScale.value = withTiming(0.95, { duration: EXIT_MS });
		dialogOpacity.value = withTiming(0, { duration: EXIT_MS }, (finished) => {
			if (finished) {
				runOnJS(finishDismiss)();
			}
		});
	}, [backdropOpacity, dialogScale, dialogOpacity, finishDismiss]);

	const alert = useCallback(
		(title: string, message?: string, buttons?: AlertButton[]) => {
			setState({
				visible: true,
				title,
				message,
				buttons: buttons ?? [{ text: "OK" }],
			});
			setMounted(true);
			// Reset values before animating in
			backdropOpacity.value = 0;
			dialogScale.value = 0.95;
			dialogOpacity.value = 0;
			// Schedule animate-in on next frame
			requestAnimationFrame(() => animateIn());
		},
		[animateIn, backdropOpacity, dialogScale, dialogOpacity],
	);

	const dismiss = useCallback(
		(onPress?: () => void) => {
			pendingCallback.current = onPress;
			animateOut();
		},
		[animateOut],
	);

	const resolvedButtons =
		state.buttons.length === 0 ? [{ text: "OK" }] : state.buttons;

	const isOnlyButton = resolvedButtons.length === 1;

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: backdropOpacity.value,
	}));

	const dialogStyle = useAnimatedStyle(() => ({
		opacity: dialogOpacity.value,
		transform: [{ scale: dialogScale.value }],
	}));

	return (
		<AlertContext.Provider value={{ alert }}>
			{children}

			{mounted && (
				<View
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 9999,
					}}
					pointerEvents="box-none"
				>
					{/* Backdrop */}
					<AnimatedPressable
						onPress={() => dismiss()}
						style={[
							{
								flex: 1,
								alignItems: "center",
								justifyContent: "center",
								backgroundColor: "rgba(0,0,0,0.7)",
								paddingHorizontal: 24,
							},
							backdropStyle,
						]}
					>
						{/* Dialog */}
						<Animated.View
							style={[
								{
									width: "100%",
									maxWidth: 384,
								},
								dialogStyle,
							]}
							className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
							// Prevent backdrop press from closing when clicking the dialog
							onStartShouldSetResponder={() => true}
						>
							{/* Content */}
							<View className="px-6 pt-6 pb-5">
								<Text className="text-white text-lg font-bold text-center">
									{state.title}
								</Text>
								{state.message ? (
									<Text className="text-neutral-400 text-sm text-center mt-4 leading-5">
										{state.message}
									</Text>
								) : null}
							</View>

							{/* Divider */}
							<View className="h-px bg-neutral-800" />

							{/* Buttons */}
							<View className="flex-row gap-2.5 px-4 py-3.5">
								{resolvedButtons.map((btn) => (
									<AppButton
										key={btn.text}
										variant={getButtonVariant(btn.style, isOnlyButton)}
										size="sm"
										label={btn.text}
										onPress={() => dismiss(btn.onPress)}
										className="flex-1"
										fullWidth={false}
									/>
								))}
							</View>
						</Animated.View>
					</AnimatedPressable>
				</View>
			)}
		</AlertContext.Provider>
	);
}
