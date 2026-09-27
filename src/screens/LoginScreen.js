import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import AppButton from '../components/AppButton';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from '../hooks/useForm';

const initialValues = { name: '', email: '', password: '', confirmPassword: '', role: 'Customer' };

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = useCallback((values) => {
    const errors = {};
    if (mode === 'signup' && values.name.trim().length < 2) errors.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
    if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    else if (!/\d/.test(values.password)) errors.password = 'Password must contain at least one digit.';
    if (mode === 'signup' && values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.';
    return errors;
  }, [mode]);
  const form = useForm(initialValues, validate);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    form.resetForm(initialValues);
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleSubmit = async () => {
    if (!form.validateForm()) return;
    setSubmitting(true);
    try {
      if (mode === 'login') await login(form.values);
      else await signup(form.values);
    } catch (error) {
      form.setErrors((current) => ({ ...current, form: error.message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
          <Text style={styles.brandLetter}>Z</Text>
          <View style={[styles.brandDot, { backgroundColor: colors.accent }]} />
        </View>
        <Text style={[styles.brand, { color: colors.primary }]}>Zahid Restaurant</Text>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>Comfort, crafted with character.</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.modeSwitch, { backgroundColor: colors.surfaceMuted }]}>
            {['login', 'signup'].map((item) => {
              const selected = mode === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => switchMode(item)}
                  style={[styles.modeButton, selected && { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.modeText, { color: selected ? '#FFFFFF' : colors.textMuted }]}>
                    {item === 'login' ? 'Login' : 'Sign up'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.heading, { color: colors.text }]}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
          <Text style={[styles.helper, { color: colors.textMuted }]}>
            {mode === 'login' ? 'Use a demo account to explore your role.' : 'Choose a role and complete the details below.'}
          </Text>

          {mode === 'signup' ? (
            <FormField
              label="Full name"
              value={form.values.name}
              onChangeText={(value) => form.setFieldValue('name', value)}
              error={form.errors.name}
              placeholder="Your full name"
              autoCapitalize="words"
              style={styles.field}
            />
          ) : null}
          <FormField
            label="Email"
            value={form.values.email}
            onChangeText={(value) => form.setFieldValue('email', value)}
            error={form.errors.email}
            placeholder="name@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.field}
          />
          <FormField
            label="Password"
            value={form.values.password}
            onChangeText={(value) => form.setFieldValue('password', value)}
            error={form.errors.password}
            placeholder="Minimum 8 characters"
            secureTextEntry={!showPassword}
            onToggleSecure={() => setShowPassword((current) => !current)}
            style={styles.field}
          />
          {mode === 'signup' ? (
            <FormField
              label="Confirm password"
              value={form.values.confirmPassword}
              onChangeText={(value) => form.setFieldValue('confirmPassword', value)}
              error={form.errors.confirmPassword}
              placeholder="Repeat password"
              secureTextEntry={!showConfirm}
              onToggleSecure={() => setShowConfirm((current) => !current)}
              style={styles.field}
            />
          ) : null}

          <Text style={[styles.roleLabel, { color: colors.text }]}>Continue as</Text>
          <View style={styles.roles}>
            {['Customer', 'Manager'].map((role) => {
              const selected = form.values.role === role;
              return (
                <Pressable
                  key={role}
                  onPress={() => form.setFieldValue('role', role)}
                  style={[styles.role, { borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.accentSoft : colors.surface }]}
                >
                  <Text style={styles.roleIcon}>{role === 'Customer' ? '◉' : '◆'}</Text>
                  <Text style={[styles.roleText, { color: selected ? colors.accent : colors.text }]}>{role}</Text>
                </Pressable>
              );
            })}
          </View>

          {form.errors.form ? <Text style={[styles.formError, { color: colors.danger }]}>{form.errors.form}</Text> : null}
          <AppButton
            title={mode === 'login' ? 'Enter restaurant' : 'Create account'}
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submit}
          />
          <Text style={[styles.delayNote, { color: colors.textMuted }]}>Demo authentication includes a 1-second secure check.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 42, paddingBottom: 32 },
  brandMark: { width: 68, height: 68, borderRadius: 22, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] },
  brandLetter: { color: '#FFFFFF', fontSize: 37, fontWeight: '900' },
  brandDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, right: 8, top: 8 },
  brand: { textAlign: 'center', marginTop: 18, fontSize: 28, fontWeight: '900' },
  tagline: { textAlign: 'center', marginTop: 5, fontSize: 14 },
  card: { marginTop: 26, borderRadius: 25, borderWidth: 1, padding: 20 },
  modeSwitch: { flexDirection: 'row', borderRadius: 13, padding: 4 },
  modeButton: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modeText: { fontWeight: '800' },
  heading: { fontSize: 23, fontWeight: '900', marginTop: 22 },
  helper: { fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 7 },
  field: { marginTop: 14 },
  roleLabel: { fontSize: 13, fontWeight: '700', marginTop: 18, marginBottom: 8 },
  roles: { flexDirection: 'row', gap: 10 },
  role: { flex: 1, borderWidth: 1.5, borderRadius: 13, padding: 12, alignItems: 'center', gap: 5 },
  roleIcon: { fontSize: 18 },
  roleText: { fontWeight: '800' },
  formError: { marginTop: 14, fontSize: 13, textAlign: 'center', fontWeight: '700' },
  submit: { marginTop: 18 },
  delayNote: { textAlign: 'center', marginTop: 11, fontSize: 11 },
});
