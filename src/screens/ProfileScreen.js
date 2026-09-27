import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const initials = user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <ScreenHeader eyebrow={user.role} title="Profile" subtitle="Your demo identity and app preferences." />
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}><Text style={styles.initials}>{initials}</Text></View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role.toUpperCase()}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.section, { color: colors.text }]}>Appearance</Text>
        <Pressable onPress={toggleTheme} style={styles.settingRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}><Text style={styles.icon}>{isDark ? '☾' : '☀'}</Text></View>
          <View style={styles.settingCopy}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{isDark ? 'Dark mode' : 'Light mode'}</Text>
            <Text style={[styles.settingHelp, { color: colors.textMuted }]}>Switch the theme across every major screen.</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accentSoft }}
            thumbColor={isDark ? colors.accent : '#FFFFFF'}
          />
        </Pressable>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.section, { color: colors.text }]}>Account details</Text>
        <Detail label="FULL NAME" value={user.name} colors={colors} />
        <Detail label="EMAIL ADDRESS" value={user.email} colors={colors} />
        <Detail label="ACCESS ROLE" value={user.role} colors={colors} />
      </View>
      <AppButton title="Log out" variant="danger" onPress={logout} style={styles.logout} />
      <Text style={[styles.version, { color: colors.textMuted }]}>Zahid Restaurant · Restaurant App MVP · Fall 2026</Text>
    </ScrollView>
  );
}

function Detail({ label, value, colors }) {
  return (
    <View style={[styles.detail, { borderBottomColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 20, paddingBottom: 110 },
  hero: { borderRadius: 24, alignItems: 'center', padding: 25 },
  avatar: { width: 78, height: 78, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  name: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 14 },
  email: { color: '#C9D8DC', fontSize: 13, marginTop: 4 },
  role: { color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.32)', borderWidth: 1, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 9, fontSize: 9, fontWeight: '900', letterSpacing: 1.3, marginTop: 12 },
  card: { borderWidth: 1, borderRadius: 19, padding: 15, marginTop: 15 },
  section: { fontSize: 16, fontWeight: '900', marginBottom: 10 },
  settingRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  settingCopy: { flex: 1, marginHorizontal: 11 },
  settingTitle: { fontSize: 14, fontWeight: '800' },
  settingHelp: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  detail: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  detailLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  detailValue: { fontSize: 14, fontWeight: '700', marginTop: 5 },
  logout: { marginTop: 18 },
  version: { textAlign: 'center', fontSize: 10, marginTop: 15 },
});
