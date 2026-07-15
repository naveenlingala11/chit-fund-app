import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useChitApp } from '@/hooks/useChitApp';
import { useAuctionSocket } from '@/hooks/useAuctionSocket';
import { LoginScreen } from '@/components/chit/LoginScreen';
import { Dashboard } from '@/components/chit/Dashboard';
import { ChitDetail } from '@/components/chit/ChitDetail';
import { ChitModals } from '@/components/chit/ChitModals';
import { Sidebar } from '@/components/chit/Sidebar';
import { MyProfile } from '@/components/chit/MyProfile';
import { ChitCalculator } from '@/components/chit/ChitCalculator';
import { RulesGuides } from '@/components/chit/RulesGuides';
import { HelpSupport } from '@/components/chit/HelpSupport';
import { ReportsAnalytics } from '@/components/chit/ReportsAnalytics';
import { Notifications } from '@/components/chit/Notifications';
import { AuctionCalendar } from '@/components/chit/AuctionCalendar';
import { FinancialProjections } from '@/components/chit/FinancialProjections';
import { AuditTrail } from '@/components/chit/AuditTrail';
import { MemberPassbook } from '@/components/chit/MemberPassbook';
import { getStyles } from '@/components/chit/styles';

export default function ChitAppEntry() {
  const colorScheme = useColorScheme();
  const appState = useChitApp();
  
  const isDark = appState.userThemeOverride
    ? appState.userThemeOverride === 'dark'
    : colorScheme === 'dark';
    
  const styles = getStyles(isDark);

  const {
    viewState,
    serverUrl,
    selectedChitDetails,
    currentUser,
    refreshChitDetails,
    setShowServerSettings,
    setShowAuctionRoom
  } = appState;

  // Manage WebSockets state reactively
  const auctionSocket = useAuctionSocket(
    serverUrl,
    selectedChitDetails?.id,
    currentUser,
    refreshChitDetails
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        {/* View State Router */}
        {viewState === 'login' && (
          <LoginScreen appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'dashboard' && (
          <Dashboard appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'chit_detail' && (
          <ChitDetail 
            appState={appState} 
            styles={styles} 
            isDark={isDark}
            startLiveBiddingRoom={auctionSocket.startLiveBiddingRoom}
            setShowAuctionRoom={setShowAuctionRoom}
          />
        )}

        {viewState === 'my_profile' && (
          <MyProfile appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'chit_calculator' && (
          <ChitCalculator appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'rules_guides' && (
          <RulesGuides appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'help_support' && (
          <HelpSupport appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'reports' && (
          <ReportsAnalytics appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'notifications' && (
          <Notifications appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'auction_calendar' && (
          <AuctionCalendar appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'financial_projections' && (
          <FinancialProjections appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'audit_trail' && (
          <AuditTrail appState={appState} styles={styles} isDark={isDark} />
        )}

        {viewState === 'passbook' && (
          <MemberPassbook appState={appState} styles={styles} isDark={isDark} />
        )}

        {/* All Modals Component Container */}
        <ChitModals 
          appState={appState} 
          styles={styles} 
          isDark={isDark} 
          auctionSocket={auctionSocket} 
        />

        {/* Sidebar Navigation Drawer */}
        <Sidebar 
          appState={appState} 
          styles={styles} 
          isDark={isDark} 
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
