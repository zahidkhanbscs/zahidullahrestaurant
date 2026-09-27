import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AppButton({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) {
  const { colors } = useTheme();
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const backgroundColor = disabled ? colors.disabled : isOutline ? 'transparent' : isDanger ? colors.danger : colors.accent;
  const textColor = isOutline ? colors.primary : '#FFFFFF';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor: isOutline ? colors.primary : backgroundColor, opacity: pressed ? 0.78 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.text, { color: textColor }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  text: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
});
