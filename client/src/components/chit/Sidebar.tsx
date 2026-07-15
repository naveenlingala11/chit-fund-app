import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';

interface SidebarProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ appState, styles, isDark }) => {
  const {
    currentUser,
    setCurrentUser,
    viewState,
    setViewState,
    setLoginStep,
    showSidebar,
    setShowSidebar
  } = appState;

  if (!currentUser || !showSidebar) return null;

  return (
    <Modal
      transparent
      visible={showSidebar}
      animationType="fade"
      onRequestClose={() => setShowSidebar(false)}
    >
      <Pressable style={styles.sidebarOverlay} onPress={() => setShowSidebar(false)}>
        <Pressable style={styles.sidebarContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>ChitSangham Menu</Text>
            <TouchableOpacity style={styles.sidebarCloseBtn} onPress={() => setShowSidebar(false)}>
              <Text style={styles.sidebarCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* User Profile Summary */}
            <View style={styles.sidebarProfile}>
              <View style={styles.sidebarProfileRow}>
                <View style={styles.sidebarAvatar}>
                  <Text style={styles.sidebarAvatarText}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sidebarName} numberOfLines={1}>{currentUser.name}</Text>
                  <Text style={styles.sidebarRoleText}>
                    {currentUser.role === 'foreman' ? '👑 Owner' : '👥 Member'}
                  </Text>
                </View>
              </View>
              <Text style={styles.sidebarPhone}>📞 {currentUser.phone}</Text>
            </View>

            {/* Navigation links */}
            <TouchableOpacity 
              style={[styles.sidebarNavItem, viewState === 'dashboard' && styles.sidebarNavItemActive]}
              onPress={() => {
                setViewState('dashboard');
                setShowSidebar(false);
              }}
            >
              <Text style={styles.sidebarNavIcon}>🏠</Text>
              <Text style={[styles.sidebarNavText, viewState === 'dashboard' && styles.sidebarNavTextActive]}>
                Dashboard / Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sidebarNavItem, viewState === 'my_profile' && styles.sidebarNavItemActive]}
              onPress={() => {
                setViewState('my_profile');
                setShowSidebar(false);
              }}
            >
              <Text style={styles.sidebarNavIcon}>👤</Text>
              <Text style={[styles.sidebarNavText, viewState === 'my_profile' && styles.sidebarNavTextActive]}>
                View My Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sidebarNavItem, viewState === 'chit_calculator' && styles.sidebarNavItemActive]}
              onPress={() => {
                setViewState('chit_calculator');
                setShowSidebar(false);
              }}
            >
              <Text style={styles.sidebarNavIcon}>🧮</Text>
              <Text style={[styles.sidebarNavText, viewState === 'chit_calculator' && styles.sidebarNavTextActive]}>
                Chit Calculator
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sidebarNavItem, viewState === 'rules_guides' && styles.sidebarNavItemActive]}
              onPress={() => {
                setViewState('rules_guides');
                setShowSidebar(false);
              }}
            >
              <Text style={styles.sidebarNavIcon}>📜</Text>
              <Text style={[styles.sidebarNavText, viewState === 'rules_guides' && styles.sidebarNavTextActive]}>
                Chit Rules & Guides
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sidebarNavItem, viewState === 'help_support' && styles.sidebarNavItemActive]}
              onPress={() => {
                setViewState('help_support');
                setShowSidebar(false);
              }}
            >
              <Text style={styles.sidebarNavIcon}>📞</Text>
              <Text style={[styles.sidebarNavText, viewState === 'help_support' && styles.sidebarNavTextActive]}>
                Help & Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sidebarNavItem, viewState === 'passbook' && styles.sidebarNavItemActive]}
              onPress={() => {
                setViewState('passbook');
                setShowSidebar(false);
              }}
            >
              <Text style={styles.sidebarNavIcon}>📖</Text>
              <Text style={[styles.sidebarNavText, viewState === 'passbook' && styles.sidebarNavTextActive]}>
                My Digital Passbook
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sidebarNavItem, viewState === 'notifications' && styles.sidebarNavItemActive]}
              onPress={() => {
                setViewState('notifications');
                setShowSidebar(false);
              }}
            >
              <Text style={styles.sidebarNavIcon}>🔔</Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.sidebarNavText, viewState === 'notifications' && styles.sidebarNavTextActive]}>
                  Notifications
                </Text>
                {(appState.notificationCount || 0) > 0 && (
                  <View style={{
                    backgroundColor: '#EF4444', minWidth: 18, height: 18, borderRadius: 9,
                    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
                  }}>
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>
                      {appState.notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sidebarNavItem, viewState === 'auction_calendar' && styles.sidebarNavItemActive]}
              onPress={() => {
                setViewState('auction_calendar');
                setShowSidebar(false);
              }}
            >
              <Text style={styles.sidebarNavIcon}>📅</Text>
              <Text style={[styles.sidebarNavText, viewState === 'auction_calendar' && styles.sidebarNavTextActive]}>
                Auction Calendar
              </Text>
            </TouchableOpacity>

            {/* Owner/Foreman Only Tools */}
            {currentUser?.role === 'foreman' && (
              <>
                <TouchableOpacity 
                  style={[styles.sidebarNavItem, viewState === 'reports' && styles.sidebarNavItemActive]}
                  onPress={() => {
                    setViewState('reports');
                    setShowSidebar(false);
                  }}
                >
                  <Text style={styles.sidebarNavIcon}>📊</Text>
                  <Text style={[styles.sidebarNavText, viewState === 'reports' && styles.sidebarNavTextActive]}>
                    Reports & Analytics
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.sidebarNavItem, viewState === 'financial_projections' && styles.sidebarNavItemActive]}
                  onPress={() => {
                    setViewState('financial_projections');
                    setShowSidebar(false);
                  }}
                >
                  <Text style={styles.sidebarNavIcon}>💹</Text>
                  <Text style={[styles.sidebarNavText, viewState === 'financial_projections' && styles.sidebarNavTextActive]}>
                    Financial Projections
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.sidebarNavItem, viewState === 'audit_trail' && styles.sidebarNavItemActive]}
                  onPress={() => {
                    setViewState('audit_trail');
                    setShowSidebar(false);
                  }}
                >
                  <Text style={styles.sidebarNavIcon}>🔒</Text>
                  <Text style={[styles.sidebarNavText, viewState === 'audit_trail' && styles.sidebarNavTextActive]}>
                    Audit Trail Log
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.sidebarDivider} />

            {/* Theme Toggle Button */}
            <TouchableOpacity 
              style={styles.sidebarNavItem}
              onPress={() => {
                const current = appState.userThemeOverride || (isDark ? 'dark' : 'light');
                const next = current === 'dark' ? 'light' : 'dark';
                appState.setUserThemeOverride(next);
              }}
            >
              <Text style={styles.sidebarNavIcon}>{isDark ? '☀️' : '🌙'}</Text>
              <Text style={styles.sidebarNavText}>
                Switch to {isDark ? 'Light' : 'Dark'} Mode
              </Text>
            </TouchableOpacity>

            {/* Logout button */}
            <TouchableOpacity 
              style={styles.sidebarNavItem}
              onPress={() => {
                setShowSidebar(false);
                setCurrentUser(null);
                setViewState('login');
                setLoginStep('role_selection');
              }}
            >
              <Text style={[styles.sidebarNavIcon, { color: '#EF4444' }]}>🚪</Text>
              <Text style={[styles.sidebarNavText, { color: '#EF4444' }]}>Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
