import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function OrderStatusStep({ label, state, isLast }) {
  const { colors } = useTheme();
  const active = state === 'active';
  const complete = state === 'complete';
  const tone = active || complete ? colors.accent : colors.border;
  return (
    <View style={styles.step}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: tone, borderColor: tone }]}>
          <Text style={styles.check}>{complete ? '✓' : active ? '•' : ''}</Text>
        </View>
        {!isLast ? <View style={[styles.line, { backgroundColor: complete ? colors.accent : colors.border }]} /> : null}
      </View>
      <Text style={[styles.label, { color: active ? colors.accent : complete ? colors.text : colors.textMuted, fontWeight: active ? '900' : '700' }]}>{label}</Text>
    </View>
  );
}

export default React.memo(OrderStatusStep);

const styles = StyleSheet.create({
  step: { flex: 1, alignItems: 'center' },
  rail: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  check: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  line: { position: 'absolute', height: 3, width: '76%', left: '63%', zIndex: -1 },
  label: { marginTop: 7, fontSize: 10, textAlign: 'center' },
});
