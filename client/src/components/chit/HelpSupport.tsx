import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { SUPPORT_CONFIG } from '@/constants/config';

interface HelpSupportProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

export const HelpSupport: React.FC<HelpSupportProps> = ({ appState, styles, isDark }) => {
  const { setViewState, setShowSidebar } = appState;

  // Form states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I upload a monthly installment payment receipt?",
      a: "Go to your Chit Details group screen, tap on the 'PAYMENTS' tab. If there are outstanding dues, you will see a '💳 Pay Installment' button. Fill in the payment details, choose UPI/Cash, and upload your receipt screenshot. The Foreman will verify it."
    },
    {
      q: "Why is my payment status showing 'Pending Approval'?",
      a: "Once you upload a receipt, it goes to the group Foreman (Owner) ledger review queue. The Foreman cross-checks the UPI reference ID or cash receipt. Once verified, they tap 'Approve' and the status shifts to 'VERIFIED' instantly."
    },
    {
      q: "What documents are accepted as guarantor collateral?",
      a: "Valid sureties include Government-issued ID cards, recent monthly payslips (showing proof of income), registered property deed documents, or legal signed promissory notes. You can upload scanned files or clear photos of these."
    },
    {
      q: "How long does it take to disburse the prize money?",
      a: "Disbursal is initiated by the Foreman as soon as: (1) your submitted guarantor sureties are reviewed and approved, and (2) all monthly payments are cleared. This typically takes 24 to 48 hours."
    }
  ];

  const handleSubmitTicket = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Validation Error', 'Please fill in both the Subject and Message fields.');
      return;
    }

    setLoading(true);
    // Simulate support ticket API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '🎟️ Ticket Submitted Successfully!',
        `Your support request has been logged. Our help desk agent will review the request (Ref: TS-${Math.floor(Math.random() * 900000 + 100000)}) and contact you via phone or email within 24 hours.`,
        [
          { text: 'OK', onPress: () => {
            setSubject('');
            setMessage('');
          }}
        ]
      );
    }, 1500);
  };

  const handleSupportCall = () => {
    Linking.openURL(`tel:${SUPPORT_CONFIG.PHONE}`);
  };

  const handleSupportWhatsApp = () => {
    Linking.openURL(`https://api.whatsapp.com/send?phone=${SUPPORT_CONFIG.WHATSAPP_PHONE}&text=${encodeURIComponent(SUPPORT_CONFIG.WHATSAPP_SUPPORT_MSG)}`);
  };

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
            Help & Support
          </Text>
        </View>
      </View>

      <ScrollView style={{ padding: 16 }}>
        {/* Quick Contact Options */}
        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>
          📞 Quick Contact Desk
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: '#25D366', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
            onPress={handleSupportWhatsApp}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>💬 WhatsApp Us</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: '#6366F1', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
            onPress={handleSupportCall}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>📞 Call Help Desk</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>
          ❓ Frequently Asked Questions
        </Text>
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <View 
              key={idx} 
              style={{ 
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: isDark ? '#334155' : '#E2E8F0', 
                marginBottom: 8, 
                overflow: 'hidden' 
              }}
            >
              <TouchableOpacity 
                style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                onPress={() => setOpenFaq(isOpen ? null : idx)}
              >
                <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 12, flex: 1, marginRight: 10 }}>{faq.q}</Text>
                <Text style={{ color: '#6366F1', fontSize: 12, fontWeight: 'bold' }}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {isOpen && (
                <View style={{ padding: 12, borderTopWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0', backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
                  <Text style={{ color: isDark ? '#E2E8F0' : '#475569', fontSize: 11, lineHeight: 16 }}>{faq.a}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Submit Ticket Form */}
        <View style={[styles.card, { marginTop: 15 }]}>
          <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>🎟️ Log a Support Ticket / Message</Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginBottom: 4 }}>Subject / Query Topic:</Text>
            <TextInput
              style={[styles.input, { height: 40 }]}
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Issue with payment verification"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginBottom: 4 }}>Detailed Message:</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top', paddingVertical: 10 }]}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              placeholder="Explain your problem or request in detail..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            />
          </View>

          <TouchableOpacity 
            style={[styles.actionBtn, { height: 44, justifyContent: 'center' }]} 
            onPress={handleSubmitTicket}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.actionBtnText}>Submit Support Request</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};
