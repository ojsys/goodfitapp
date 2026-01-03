import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Switch,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';

// Types
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  alert?: boolean;
}

interface ReportItemProps {
  id: string;
  user: string;
  reason: string;
  date: string;
  avatarColor: string;
}

// Mock Data
const REPORTS_DATA: ReportItemProps[] = [
  { id: '1', user: 'Alex M.', reason: 'Spam / Bot Behavior', date: '2m ago', avatarColor: '#EF4444' },
  { id: '2', user: 'Sarah K.', reason: 'Inappropriate Content', date: '15m ago', avatarColor: '#F59E0B' },
  { id: '3', user: 'GymBro_99', reason: 'Harassment', date: '1h ago', avatarColor: '#3B82F6' },
];

const AdminDashboard: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [reports, setReports] = useState<ReportItemProps[]>(REPORTS_DATA);

  const handleDismiss = (id: string) => {
    setReports(prev => prev.filter(item => item.id !== id));
  };

  const handleBan = (user: string, id: string) => {
    Alert.alert('Confirm Ban', `Are you sure you want to ban ${user}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Ban User', style: 'destructive', onPress: () => handleDismiss(id) },
    ]);
  };

  const handleEmergencyFreeze = () => {
    Alert.alert('Emergency Freeze', 'This will pause all social interactions on the platform. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'ACTIVATE FREEZE', style: 'destructive' },
    ]);
  };

  // --- Sub Components ---

  const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, alert }) => (
    <View style={[styles.card, styles.statCard]}>
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        {alert && <View style={styles.alertDot} />}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.trendContainer}>
        <Text style={[styles.trendIcon, isPositive ? styles.textSuccess : styles.textDanger]}>
          {isPositive ? '↑' : '↓'}
        </Text>
        <Text style={[styles.trendText, isPositive ? styles.textSuccess : styles.textDanger]}>
          {change}
        </Text>
      </View>
    </View>
  );

  const ReportItem: React.FC<{ item: ReportItemProps }> = ({ item }) => (
    <View style={[styles.card, styles.reportCard]}>
      <View style={styles.reportHeader}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{item.user.charAt(0)}</Text>
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportUser}>{item.user}</Text>
          <Text style={styles.reportReason}>Report: {item.reason}</Text>
        </View>
        <Text style={styles.reportTime}>{item.date}</Text>
      </View>
      <View style={styles.reportActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dismissButton]} 
          onPress={() => handleDismiss(item.id)}
        >
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.banButton]} 
          onPress={() => handleBan(item.user, item.id)}
        >
          <Text style={styles.banText}>Ban User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const RetentionChart = () => (
    <View style={[styles.card, styles.chartCard]}>
      <View style={styles.chartHeader}>
        <Text style={styles.sectionTitle}>User Retention</Text>
        <View style={styles.chartLegend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Active Users</Text>
        </View>
      </View>
      
      {/* Simulated Chart Visualization */}
      <View style={styles.chartContainer}>
        {/* Y-Axis Lines */}
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.gridLine} />
        ))}
        
        {/* Bars (Simulating the visual rhythm of a chart) */}
        <View style={styles.barContainer}>
          {[40, 55, 45, 70, 65, 85, 90].map((height, index) => (
            <View key={index} style={styles.barWrapper}>
              <View style={[styles.bar, { height: `${height}%` }]} />
              <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Overview & Moderation</Text>
        </View>
        <View style={styles.headerControls}>
          <Text style={styles.modeText}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Metric Grid */}
        <View style={styles.gridContainer}>
          <StatCard 
            title="DAU (Active)" 
            value="1.2k" 
            change="+5.2%" 
            isPositive={true} 
          />
          <StatCard 
            title="New Signups" 
            value="45" 
            change="+12%" 
            isPositive={true} 
          />
          <StatCard 
            title="Open Reports" 
            value="3" 
            change="+1" 
            isPositive={false} 
            alert={true} 
          />
          <StatCard 
            title="Live Events" 
            value="8" 
            change="Active" 
            isPositive={true} 
          />
        </View>

        {/* Retention Chart */}
        <RetentionChart />

        {/* Moderation Queue */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Moderation Queue</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{reports.length} New</Text>
          </View>
        </View>

        {reports.length > 0 ? (
          reports.map(item => <ReportItem key={item.id} item={item} />)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>All caught up! No reports.</Text>
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable 
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed
        ]}
        onPress={handleEmergencyFreeze}
      >
        <View style={styles.fabIconContainer}>
          {/* Creating a shield-like visual with text/emoji since no icons allowed */}
          <Text style={styles.fabIcon}>🛡️</Text>
        </View>
      </Pressable>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50
  },
  scrollContent: {
    padding: 16,
  },
  footerSpacer: {
    height: 80,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A', // Slate 900
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B', // Slate 500
    marginTop: 2,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeText: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 4,
  },

  // Grid Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statCard: {
    width: '48%', // Approx half width
    minHeight: 110,
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSuccess: {
    color: '#10B981', // Green 500
  },
  textDanger: {
    color: '#EF4444', // Red 500
  },

  // Chart Styles
  chartCard: {
    width: '100%',
    height: 220,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F1F5F9',
    bottom: 0,
    top: 0, // Distributed purely via flex space usually, but here fixed overlay
    marginVertical: 15, // Simplified vertical rhythm
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flex: 1,
    paddingHorizontal: 8,
  },
  barWrapper: {
    alignItems: 'center',
    width: '10%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Moderation List Styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  badgeText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  reportCard: {
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  reportReason: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  reportTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    backgroundColor: '#F1F5F9',
  },
  dismissText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  banButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  banText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
  },

  // FAB Styles
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#DC2626',
  },
  fabIconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 26,
    marginTop: 2, // Slight adjustment for emoji centering
  },
});

export default AdminDashboard;