import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

interface LoginScreenProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ appState, styles, isDark }) => {
  const {
    loginStep,
    setLoginStep,
    selectedRole,
    setSelectedRole,
    loginMode,
    setLoginMode,
    mobileNumber,
    setMobileNumber,
    passwordInput,
    setPasswordInput,
    otpCode,
    setOtpCode,
    otpTimer,
    setOtpSent,
    setOtpTimer,
    registerName,
    setRegisterName,
    registerPhone,
    setRegisterPhone,
    availableUsers,
    setCurrentUser,
    setViewState,
    fetchChits,
    serverUrl,
  } = appState;

  const handleSendOtpLocal = () => {
    if (mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    setOtpTimer(30);
    alert('OTP Sent! For testing, enter verification code: 1234');
  };

  const handleLoginLocal = () => {
    if (mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    if (loginMode === 'password' && !passwordInput) {
      alert('Please enter your password');
      return;
    }

    if (loginMode === 'otp' && otpCode !== '1234') {
      alert('Invalid OTP code. Use 1234 for testing.');
      return;
    }

    const matchedUser = availableUsers.find((u: any) => u.phone === mobileNumber && u.role === selectedRole);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setViewState('dashboard');
      fetchChits(matchedUser);
      setMobileNumber('');
      setPasswordInput('');
      setOtpCode('');
      setOtpSent(false);
    } else {
      alert(`No registered ${selectedRole === 'foreman' ? 'Owner' : 'Member'} found with mobile number ${mobileNumber}`);
    }
  };

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.appTitle}>ChitSangham (చిట్టీ సంఘం)</Text>
      <Text style={styles.appSubtitle}>Secure Digital Chit Fund Ledger & Auction Room</Text>

      {loginStep === 'role_selection' ? (
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { textAlign: 'center', marginBottom: 20 }]}>Select Your Persona (పాత్రను ఎంచుకోండి)</Text>
          <TouchableOpacity
            style={[styles.roleSelectBtn, styles.ownerBtnBorder, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2F6' }]}
            onPress={() => {
              setSelectedRole('foreman');
              setLoginStep('credentials');
            }}
          >
            <Text style={styles.roleEmoji}>👑</Text>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.roleBtnTitle}>Chit Organizer / Owner</Text>
              <Text style={styles.roleBtnSub}>చిట్టీ నిర్వాహకుడు / యజమాని</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleSelectBtn, styles.memberBtnBorder, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}
            onPress={() => {
              setSelectedRole('member');
              setLoginStep('credentials');
            }}
          >
            <Text style={styles.roleEmoji}>👥</Text>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.roleBtnTitle}>Member / Subscriber</Text>
              <Text style={styles.roleBtnSub}>చిట్టీ సభ్యుడు / చందాదారుడు</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : loginStep === 'credentials' ? (
        <View style={styles.card}>
          <View style={styles.loginHeaderRow}>
            <TouchableOpacity onPress={() => setLoginStep('role_selection')} style={styles.loginBackBtn}>
              <Text style={{ color: '#818CF8', fontWeight: 'bold' }}>◀ Back</Text>
            </TouchableOpacity>
            <Text style={styles.loginTitleText}>
              {selectedRole === 'foreman' ? 'Owner Login' : 'Member Login'}
            </Text>
            <View style={{ width: 45 }} />
          </View>

          <Text style={styles.inputLabel}>Registered Mobile Number (మొబైల్ సంఖ్య)</Text>
          <TextInput
            style={styles.input}
            maxLength={10}
            keyboardType="phone-pad"
            placeholder="e.g. 9876543210"
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />

          <View style={styles.loginModeTabs}>
            <TouchableOpacity
              style={[styles.loginModeTab, loginMode === 'password' && styles.loginModeTabActive]}
              onPress={() => setLoginMode('password')}
            >
              <Text style={[styles.loginModeTabText, loginMode === 'password' && styles.loginModeTabTextActive]}>
                Password
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.loginModeTab, loginMode === 'otp' && styles.loginModeTabActive]}
              onPress={() => setLoginMode('otp')}
            >
              <Text style={[styles.loginModeTabText, loginMode === 'otp' && styles.loginModeTabTextActive]}>
                OTP Login
              </Text>
            </TouchableOpacity>
          </View>

          {loginMode === 'password' ? (
            <View>
              <Text style={styles.inputLabel}>Password (పాస్‌వర్డ్)</Text>
              <TextInput
                style={styles.input}
                secureTextEntry={true}
                placeholder="Enter Password (e.g. 123456)"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={passwordInput}
                onChangeText={setPasswordInput}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.inputLabel}>Enter OTP Code (4-digit)</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder="Enter 4-digit code"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />
                <TouchableOpacity
                  disabled={otpTimer > 0}
                  style={[styles.sendOtpBtn, { backgroundColor: otpTimer > 0 ? '#475569' : '#818CF8' }]}
                  onPress={handleSendOtpLocal}
                >
                  <Text style={styles.sendOtpBtnText}>
                    {otpTimer > 0 ? "Resend in " + otpTimer + "s" : 'Send OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleLoginLocal}>
            <Text style={styles.submitBtnText}>Verify & Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignSelf: 'center', marginTop: 15 }}
            onPress={() => {
              setRegisterName('');
              setRegisterPhone('');
              setLoginStep('register');
            }}
          >
            <Text style={{ color: '#818CF8', fontSize: 13, fontWeight: 'bold', textDecorationLine: 'underline' }}>
              New here? Register Account (కొత్త ఖాతాను సృష్టించండి)
            </Text>
          </TouchableOpacity>

          <View style={styles.demoAccountsCard}>
            <Text style={styles.demoAccountsTitle}>⚡ Quick Test Credentials (టెస్టింగ్ కొరకు):</Text>
            <Text style={styles.demoAccountRow}>
              <Text style={{ fontWeight: 'bold', color: '#818CF8' }}>Owner: </Text>9876543210 (Password: 123456 / OTP: 1234)
            </Text>
            <Text style={styles.demoAccountRow}>
              <Text style={{ fontWeight: 'bold', color: '#10B981' }}>Member: </Text>9000000001 (Password: 123456 / OTP: 1234)
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.loginHeaderRow}>
            <TouchableOpacity onPress={() => setLoginStep('credentials')} style={styles.loginBackBtn}>
              <Text style={{ color: '#818CF8', fontWeight: 'bold' }}>◀ Back</Text>
            </TouchableOpacity>
            <Text style={styles.loginTitleText}>
              {selectedRole === 'foreman' ? 'Owner Registration' : 'Member Registration'}
            </Text>
            <View style={{ width: 45 }} />
          </View>

          <Text style={styles.inputLabel}>Full Name (పూర్తి పేరు)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rama Krishna"
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={registerName}
            onChangeText={setRegisterName}
          />

          <Text style={styles.inputLabel}>Mobile Number (మొబైల్ సంఖ్య)</Text>
          <TextInput
            style={styles.input}
            maxLength={10}
            keyboardType="phone-pad"
            placeholder="e.g. 9876543210"
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={registerPhone}
            onChangeText={setRegisterPhone}
          />

          <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginBottom: 15, lineHeight: 15 }}>
            * By registering, you will be enrolled as a registered {selectedRole === 'foreman' ? 'Owner / Organizer' : 'Member / Subscriber'} in the database.
          </Text>

          <TouchableOpacity style={styles.submitBtn} onPress={appState.handleEditMember ? appState.handleRegister : () => {}}>
            <Text style={styles.submitBtnText}>Submit & Register</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
