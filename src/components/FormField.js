import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function FormField({ label, error, secureTextEntry, onToggleSecure, style, ...inputProps }) {
  const { colors } = useTheme();
  return (
    <View style={style}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          style={[styles.input, { color: colors.text }]}
          secureTextEntry={secureTextEntry}
          {...inputProps}
        />
        {onToggleSecure ? (
          <Pressable onPress={onToggleSecure} hitSlop={10}>
            <Text style={[styles.show, { color: colors.primary }]}>{secureTextEntry ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', marginBottom: 7 },
  inputWrap: { minHeight: 50, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  show: { fontSize: 13, fontWeight: '800', paddingLeft: 10 },
  error: { fontSize: 12, marginTop: 5 },
});
