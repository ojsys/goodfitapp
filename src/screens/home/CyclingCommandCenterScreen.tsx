import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';

// -------------------------------------------------------------------------
// Types & Interfaces
// -------------------------------------------------------------------------
interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  visualType: 'chart' | 'gauge' | 'zones' | 'bar';
}

interface ActionButtonProps {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

// -------------------------------------------------------------------------
// Constants & Theme
// -------------------------------------------------------------------------
const { width } = Dimensions.get('window');

const COLORS = {
  background: '#F8FAFC', // Slate 50
  foreground: '#0F172A', // Slate 900
  muted: '#64748B',      // Slate 500
  mutedLight: '#E2E8F0', // Slate 200
  card: '#FFFFFF',
  primary: '#3B82F6',    // Blue 500
  teal: '#14B8A6',       // Teal 500
  border: '#E2E8F0',
  success: '#22C55E',    // Green 500
  warning: '#EAB308',    // Yellow 500
  danger: '#EF4444',     // Red 500
  darkCard: '#1E293B',   // Slate 800
};

// -------------------------------------------------------------------------
// Helper Components
// -------------------------------------------------------------------------

/**
 * Renders a simple visual representation of an icon using text/emoji
 * or a placeholder image if needed.
 */
const IconSymbol: React.FC<{ name: string; size?: number; color?: string }> = ({
  name,
  size = 24,
  color = COLORS.foreground,
}) => {
  // Mapping "names" to simple unicode chars for standalone visual clarity
  const map: Record<string, string> = {
    'settings-2': '⚙️',
    'zap': '⚡',
    'heart': '❤️',
    'radar': '📡',
    'wrench': '🔧',
    'map': '🗺️',
    'home': '🏠',
    'activity': '📈',
    'lungs': '🫁',
    'bike': '🚲',
    'play-circle': '▶️',
    'users': '👥',
    'calendar': '📅',
    'user': '👤',
  };

  return (
    <Text style={{ fontSize: size, color, includeFontPadding: false }}>
      {map[name] || '?'}
    </Text>
  );
};

const MockChart: React.FC<{ type: string }> = ({ type }) => {
  if (type === 'chart') {
    // Sparkline simulation
    return (
      <View style={styles.chartContainer}>
        {[40, 60, 45, 70, 55, 80, 65, 50, 75, 90, 60, 85].map((h, i) => (
          <View
            key={i}
            style={[
              styles.sparkBar,
              { height: `${h}%`, backgroundColor: COLORS.primary, opacity: 0.6 + i * 0.03 },
            ]}
          />
        ))}
      </View>
    );
  }
  if (type === 'gauge') {
    // Gauge semi-circle simulation
    return (
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeArc} />
        <View style={styles.gaugeFill} />
        <Text style={styles.gaugeText}>Good</Text>
      </View>
    );
  }
  if (type === 'zones') {
    // Stacked bars
    return (
      <View style={styles.zonesContainer}>
        {['#94A3B8', '#3B82F6', '#22C55E', '#EAB308', '#EF4444'].map((c, i) => (
          <View key={i} style={[styles.zoneBar, { backgroundColor: c, width: `${(5 - i) * 20}%` }]} />
        ))}
      </View>
    );
  }
  if (type === 'bar') {
    // Vertical bars
    return (
      <View style={styles.chartContainer}>
        {[30, 50, 40, 80, 60, 90, 45].map((h, i) => (
          <View
            key={i}
            style={[
              styles.sparkBar,
              { height: `${h}%`, width: 6, backgroundColor: i === 5 ? COLORS.teal : COLORS.mutedLight },
            ]}
          />
        ))}
      </View>
    );
  }
  return null;
};

// -------------------------------------------------------------------------
// Main Component
// -------------------------------------------------------------------------
const CyclingCommandCenter: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Sticky Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Cycling Pro</Text>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol name="settings-2" size={20} color={COLORS.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Live Telemetry Hero Card */}
        <View style={styles.heroCard}>
          {/* Header Inside Card */}
          <View style={styles.heroHeader}>
            <View style={styles.statusContainer}>
              <View style={styles.pulsingDot} />
              <Text style={styles.statusText}>System Ready</Text>
            </View>
            <Text style={styles.batteryText}>98%</Text>
          </View>

          {/* Sensors Row */}
          <View style={styles.sensorsRow}>
            <View style={[styles.sensorPill, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
              <IconSymbol name="zap" size={12} color="#FACC15" />
              <Text style={[styles.sensorText, { color: '#FACC15' }]}>Connected</Text>
            </View>
            <View style={[styles.sensorPill, { backgroundColor: 'rgba(244, 63, 94, 0.2)' }]}>
              <IconSymbol name="heart" size={12} color="#FB7185" />
              <Text style={[styles.sensorText, { color: '#FB7185' }]}>68 bpm</Text>
            </View>
            <View style={[styles.sensorPill, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <IconSymbol name="radar" size={12} color="#60A5FA" />
              <Text style={[styles.sensorText, { color: '#60A5FA' }]}>Radar</Text>
            </View>
          </View>

          {/* Main Data Display */}
          <View style={styles.telemetryGrid}>
            <View style={styles.telemetrySide}>
              <Text style={styles.telemetryValueSmall}>0</Text>
              <Text style={styles.telemetryLabel}>WATTS</Text>
            </View>
            
            <View style={styles.telemetryCenter}>
              <Text style={styles.telemetryValueLarge}>0.0</Text>
              <Text style={styles.telemetryLabel}>KM/H</Text>
            </View>
            
            <View style={styles.telemetrySide}>
              <Text style={styles.telemetryValueSmall}>0</Text>
              <Text style={styles.telemetryLabel}>RPM</Text>
            </View>
          </View>

          {/* Bottom Elevation Graph Preview */}
          <View style={styles.elevationGraph}>
             {/* Simple SVG-like path simulated with Views */}
             <View style={styles.elevationLineContainer}>
                <View style={[styles.elevationBar, { height: 10 }]} />
                <View style={[styles.elevationBar, { height: 15 }]} />
                <View style={[styles.elevationBar, { height: 25 }]} />
                <View style={[styles.elevationBar, { height: 40 }]} />
                <View style={[styles.elevationBar, { height: 35 }]} />
                <View style={[styles.elevationBar, { height: 20 }]} />
                <View style={[styles.elevationBar, { height: 30 }]} />
                <View style={[styles.elevationBar, { height: 50, backgroundColor: COLORS.teal }]} />
                <View style={[styles.elevationBar, { height: 45 }]} />
                <View style={[styles.elevationBar, { height: 30 }]} />
             </View>
             <Text style={styles.elevationLabel}>Elevation Profile • Route A</Text>
          </View>

          {/* Background Decor */}
          <View style={styles.bgDecorCircle1} />
          <View style={styles.bgDecorCircle2} />
        </View>

        {/* 2. Quick Actions Bar */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF7ED' }]}>
            <IconSymbol name="wrench" size={20} color="#EA580C" />
            <Text style={[styles.actionLabel, { color: '#EA580C' }]}>Calibrate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]}>
            <IconSymbol name="map" size={20} color="#2563EB" />
            <Text style={[styles.actionLabel, { color: '#2563EB' }]}>Route</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FAF5FF' }]}>
            <IconSymbol name="home" size={20} color="#9333EA" />
            <Text style={[styles.actionLabel, { color: '#9333EA' }]}>Indoor</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Performance Metrics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Performance Analytics</Text>
          
          <View style={styles.metricsGrid}>
            {/* Card 1: FTP */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                  <IconSymbol name="activity" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.metricTitle}>FTP</Text>
              </View>
              <Text style={styles.metricValue}>245<Text style={styles.metricUnit}>w</Text></Text>
              <MockChart type="chart" />
            </View>

            {/* Card 2: VO2 Max */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                  <IconSymbol name="lungs" size={16} color={COLORS.teal} />
                </View>
                <Text style={styles.metricTitle}>VO2 Max</Text>
              </View>
              <Text style={styles.metricValue}>54</Text>
              <MockChart type="gauge" />
            </View>

            {/* Card 3: Power Zones */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                  <IconSymbol name="zap" size={16} color={COLORS.warning} />
                </View>
                <Text style={styles.metricTitle}>Zones</Text>
              </View>
              <MockChart type="zones" />
            </View>

            {/* Card 4: Weekly Load */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                  <IconSymbol name="calendar" size={16} color={COLORS.muted} />
                </View>
                <Text style={styles.metricTitle}>Load</Text>
              </View>
              <Text style={styles.metricValue}>450<Text style={styles.metricUnit}>tss</Text></Text>
              <MockChart type="bar" />
            </View>
          </View>
        </View>

        {/* 4. Gear Tracker */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Gear Tracker</Text>
          <View style={styles.gearCard}>
            <View style={styles.gearIconContainer}>
               <IconSymbol name="bike" size={24} color={COLORS.foreground} />
            </View>
            <View style={styles.gearContent}>
              <View style={styles.gearHeaderRow}>
                <Text style={styles.gearName}>Canyon Aeroad</Text>
                <Text style={styles.gearDistance}>Service in 200km</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '85%' }]} />
              </View>
              <Text style={styles.gearStatusText}>Chain Wear: Good (85%)</Text>
            </View>
          </View>
        </View>
        
        {/* Spacer for Bottom Nav & FAB */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
        <Text style={styles.fabText}>START RIDE</Text>
        <IconSymbol name="play-circle" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

// -------------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(248, 250, 252, 0.9)', // Glassmorphic approximation
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 12 : 50,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.foreground,
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Scroll Content
  scrollContent: {
    paddingTop: 110, // Account for sticky header
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  // Hero Card
  heroCard: {
    width: '100%',
    backgroundColor: COLORS.darkCard,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bgDecorCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.15)', // Blue primary transparent
    zIndex: -1,
  },
  bgDecorCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(20, 184, 166, 0.1)', // Teal transparent
    zIndex: -1,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  statusText: {
    color: COLORS.mutedLight,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  batteryText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  sensorsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  sensorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sensorText: {
    fontSize: 10,
    fontWeight: '700',
  },
  telemetryGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  telemetrySide: {
    alignItems: 'center',
    paddingBottom: 8,
    flex: 1,
  },
  telemetryCenter: {
    alignItems: 'center',
    flex: 1.5,
  },
  telemetryValueLarge: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 60,
    fontVariant: ['tabular-nums'],
  },
  telemetryValueSmall: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 1,
  },
  elevationGraph: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  elevationLineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 50,
    marginBottom: 8,
  },
  elevationBar: {
    width: (width - 48 - 24) / 11, // Rough width calc
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  elevationLabel: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: 'center',
  },
  
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Section
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 16,
    marginLeft: 4,
  },
  
  // Performance Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 32 - 12) / 2, // 2 columns
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 8,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.muted,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  
  // Charts
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 30,
  },
  sparkBar: {
    width: 4,
    borderRadius: 2,
  },
  gaugeContainer: {
    height: 30,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gaugeArc: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    position: 'absolute',
    top: 0,
  },
  gaugeFill: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: COLORS.teal,
    borderRightColor: COLORS.teal, // Half fill
    position: 'absolute',
    top: 0,
    transform: [{ rotate: '-45deg' }], // Adjust for gauge look
  },
  gaugeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.teal,
    marginTop: 14,
  },
  zonesContainer: {
    gap: 4,
  },
  zoneBar: {
    height: 4,
    borderRadius: 2,
  },

  // Gear Tracker
  gearCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  gearIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearContent: {
    flex: 1,
  },
  gearHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gearName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  gearDistance: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginBottom: 6,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  gearStatusText: {
    fontSize: 11,
    color: COLORS.muted,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 104, // Above nav bar (72 + 24 + 8)
    left: 24,
    right: 24,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary, // Could apply gradient if library available
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
  },
  fabText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Bottom Navigation
  bottomNavContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width - 48,
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 36,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  navItem: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});

export default CyclingCommandCenter;