import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';

interface ChitCalculatorProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

export const ChitCalculator: React.FC<ChitCalculatorProps> = ({ appState, styles, isDark }) => {
  const { setViewState, setShowSidebar } = appState;

  // Form Inputs
  const [chitAmount, setChitAmount] = useState('1000000');
  const [membersCount, setMembersCount] = useState('20');
  const [bidDiscountPct, setBidDiscountPct] = useState('25'); // 25% avg discount

  const chitVal = parseFloat(chitAmount) || 0;
  const members = parseInt(membersCount) || 1;
  const discountPct = parseFloat(bidDiscountPct) || 0;

  // Calculators
  const monthlyBaseInstallment = chitVal / members;
  const bidDiscountAmount = (chitVal * discountPct) / 100;
  const foremanCommission = chitVal * 0.05; // standard 5%
  const dividendPool = Math.max(0, bidDiscountAmount - foremanCommission);
  const dividendPerMember = dividendPool / members;
  const netInstallmentDue = monthlyBaseInstallment - dividendPerMember;

  // Bank comparison
  const bankInterestRate = 0.07; // 7% standard RD interest
  const bankYearlyYield = (monthlyBaseInstallment * members) * (1 + bankInterestRate);

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
            Chit Planner / Calculator
          </Text>
        </View>
      </View>

      <ScrollView style={{ padding: 16 }}>
        {/* Dynamic Inputs Card */}
        <View style={styles.card}>
          <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>🧮 Interactive Chit Simulator</Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, marginBottom: 4 }}>Chit Scheme Value (₹):</Text>
            <TextInput
              style={[styles.input, { height: 42 }]}
              keyboardType="numeric"
              value={chitAmount}
              onChangeText={setChitAmount}
              placeholder="e.g. 1000000"
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, marginBottom: 4 }}>Members Count / Months:</Text>
              <TextInput
                style={[styles.input, { height: 42 }]}
                keyboardType="numeric"
                value={membersCount}
                onChangeText={setMembersCount}
                placeholder="e.g. 20"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, marginBottom: 4 }}>Avg. Bid Discount (%):</Text>
              <TextInput
                style={[styles.input, { height: 42 }]}
                keyboardType="numeric"
                value={bidDiscountPct}
                onChangeText={setBidDiscountPct}
                placeholder="e.g. 25"
              />
            </View>
          </View>
        </View>

        {/* Calculation Projections Card */}
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#6366F1' }]}>
          <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 15, fontWeight: 'bold', marginBottom: 12 }}>📊 Month-wise Estimation Results</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}>Base Monthly Installment:</Text>
            <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 12, fontWeight: 'bold' }}>₹{monthlyBaseInstallment.toLocaleString('en-IN')}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}>Bid Discount Amount ({discountPct}%):</Text>
            <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 12, fontWeight: 'bold' }}>₹{bidDiscountAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}>Foreman Owner Commission (5%):</Text>
            <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold' }}>- ₹{foremanCommission.toLocaleString('en-IN')}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}>Total Dividend Pool distributed:</Text>
            <Text style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold' }}>+ ₹{dividendPool.toLocaleString('en-IN')}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
            <Text style={{ color: '#6366F1', fontSize: 13, fontWeight: 'bold' }}>Dividend Received / Member:</Text>
            <Text style={{ color: '#6366F1', fontSize: 13, fontWeight: 'bold' }}>₹{dividendPerMember.toLocaleString('en-IN')}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, marginTop: 4 }}>
            <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 14, fontWeight: 'bold' }}>Net Installment to Pay:</Text>
            <Text style={{ color: '#F59E0B', fontSize: 16, fontWeight: 'bold' }}>₹{netInstallmentDue.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Investment Comparison Card */}
        <View style={styles.card}>
          <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>⚔️ Chit Funds vs. Bank Fixed / Recurrent Deposits</Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginBottom: 10, lineHeight: 16 }}>
            Unlike standard Bank Deposits where your money is locked completely, Chit Funds function as both an **investment** and a **borrowing mechanism** providing instant liquid capital!
          </Text>

          <View style={{ backgroundColor: isDark ? '#0F172A' : '#F1F5F9', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>💼 Liquid Borrowing Benefit:</Text>
            <Text style={{ color: isDark ? '#E2E8F0' : '#475569', fontSize: 10, lineHeight: 14 }}>
              If you win the bid discount in Month 3, you get immediate access to ₹{(chitVal - bidDiscountAmount).toLocaleString('en-IN')} cash layout to fund business, medical, or marriage needs instantly, while continuing to pay monthly shares. Banks will charge 12%-18% personal loan interest for similar credits!
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};
