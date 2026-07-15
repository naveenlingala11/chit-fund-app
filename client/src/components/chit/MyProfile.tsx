import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';

interface MyProfileProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

export const MyProfile: React.FC<MyProfileProps> = ({ appState, styles, isDark }) => {
  const {
    currentUser,
    setViewState,
    chits,
    payments,
    viewChitDetails,
    setShowSidebar
  } = appState;

  if (!currentUser) return null;

  // Filter chits this user is enrolled in
  const myEnrolledChits = chits.filter((c: any) => 
    c.foreman_id === currentUser.id || 
    c.members?.some((m: any) => m.user_id === currentUser.id)
  );

  // Stats calculation
  const totalEnrolled = myEnrolledChits.length;
  
  // Total payments made by this user in all chits
  const myTotalPaid = payments
    ?.filter((p: any) => p.user_id === currentUser.id && p.payment_status === 'verified')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount_paid.toString()), 0) || 0;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ marginRight: 15, padding: 4 }}
            onPress={() => setShowSidebar(true)}
          >
            <Text style={{ fontSize: 24, color: isDark ? '#FFF' : '#0F172A', fontWeight: 'bold' }}>☰</Text>
          </TouchableOpacity>
          <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 18, fontWeight: 'bold' }}>
            My Profile
          </Text>
        </View>
      </View>

      <ScrollView style={{ padding: 16 }}>
        {/* Profile Card */}
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 25 }]}>
          <View style={[styles.headerAvatar, { width: 80, height: 80, borderRadius: 40, marginRight: 0, marginBottom: 15 }]}>
            <Text style={[styles.headerAvatarText, { fontSize: 32 }]}>
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 22, fontWeight: 'bold' }}>{currentUser.name}</Text>
          <Text style={{ color: '#818CF8', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 4 }}>
            {currentUser.role === 'foreman' ? '👑 Foreman / Owner' : '👥 Member / Subscriber'}
          </Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 13, marginTop: 8 }}>📞 +91 {currentUser.phone}</Text>
          {currentUser.email && <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 13 }}>✉️ {currentUser.email}</Text>}
        </View>

        {/* Stats Section */}
        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>
          📊 My Sangham Statistics
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0', alignItems: 'center' }}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, textAlign: 'center' }}>Joined Groups</Text>
            <Text style={{ color: '#6366F1', fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>{totalEnrolled}</Text>
          </View>
          <View style={{ flex: 1.3, backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0', alignItems: 'center' }}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, textAlign: 'center' }}>Verified Payments</Text>
            <Text style={{ color: '#10B981', fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>₹{myTotalPaid.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Enrolled Chits */}
        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>
          📂 My Active Chits
        </Text>
        {myEnrolledChits.length === 0 ? (
          <View style={[styles.card, { padding: 20, alignItems: 'center' }]}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}>You have not joined any chit groups yet.</Text>
          </View>
        ) : (
          myEnrolledChits.map((chit: any) => (
            <TouchableOpacity 
              key={chit.id} 
              style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0', marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              onPress={() => viewChitDetails(chit)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 14 }}>{chit.name}</Text>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginTop: 2 }}>
                  Value: ₹{parseFloat(chit.chit_value).toLocaleString('en-IN')} | {chit.members_count} Members
                </Text>
              </View>
              <Text style={{ color: '#6366F1', fontSize: 12, fontWeight: 'bold' }}>View Details ➔</Text>
            </TouchableOpacity>
          ))
        )}

        {/* Settings options */}
        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 8, textTransform: 'uppercase' }}>
          ⚙️ Application Preferences
        </Text>
        <View style={[styles.card, { paddingVertical: 8 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 }}>
            <View>
              <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 13, fontWeight: 'bold' }}>Dark Mode Theme</Text>
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }}>Toggle visual preference theme</Text>
            </View>
            <Switch value={isDark} disabled />
          </View>
        </View>

        {/* Member Document Vault */}
        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 'bold', marginTop: 10, marginBottom: 8, textTransform: 'uppercase' }}>
          📁 Secure Document Vault (KYC & Collaterals)
        </Text>
        <View style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0', marginBottom: 20 }}>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginBottom: 12 }}>
            Stored documents can be attached with 1-click when submitting surety verification for auction wins.
          </Text>

          {[
            { type: 'Government ID / Aadhaar', number: 'XXXX-XXXX-4819', status: 'VERIFIED ✓', icon: '🪪' },
            { type: 'PAN Card / Tax ID', number: 'ABCDE1234F', status: 'VERIFIED ✓', icon: '💳' },
            { type: 'Income Proof / Salary Slip', number: 'Salary Slip 2026.pdf', status: 'STORED', icon: '📄' },
          ].map((doc, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: idx < 2 ? 1 : 0, borderBottomColor: isDark ? '#334155' : '#E2E8F0' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 20 }}>{doc.icon}</Text>
                <View>
                  <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 13 }}>{doc.type}</Text>
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }}>{doc.number}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ color: '#10B981', fontSize: 9, fontWeight: '800' }}>{doc.status}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};
