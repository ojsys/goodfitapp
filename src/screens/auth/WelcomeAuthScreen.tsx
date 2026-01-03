import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

// -----------------------------------------------------------------------------
// DESIGN SYSTEM & TOKENS
// -----------------------------------------------------------------------------

const COLORS = {
  primary: '#2D6A4F', // Deep calming green
  primaryLight: '#40916C', // Lighter interaction state
  background: '#F0F7F4', // Very light mint/white
  card: '#FFFFFF',
  textMain: '#1B4332', // Dark green/black for headings
  textSub: '#748B82', // Muted sage gray
  border: '#D8E2DC',
  googleBorder: '#E5E7EB',
  white: '#FFFFFF',
  shadow: '#000000',
};

const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 32,
};

const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 24,
  xl: 40, // For the bottom sheet
};

// -----------------------------------------------------------------------------
// ASSETS (Placeholders)
// -----------------------------------------------------------------------------

// Use cycling background image
const BG_IMAGE_SOURCE = require('../../../assets/cycling-background.jpg');

// Actual company logos
const GOOGLE_LOGO = require('../../../assets/google-logo.png');
const APPLE_LOGO = require('../../../assets/apple-logo.png');

// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'outline';
  logo?: any; // Company logo image
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  logo,
  loading = false,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonContainer,
        isPrimary ? styles.buttonPrimary : styles.buttonOutline,
        pressed && (isPrimary ? styles.buttonPrimaryPressed : styles.buttonOutlinePressed),
        loading && styles.buttonDisabled,
      ]}
      disabled={loading}
    >
      {logo && !loading && (
        <Image source={logo} style={styles.buttonIcon} resizeMode="contain" />
      )}
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : COLORS.textMain} />
      ) : (
        <Text style={[styles.buttonText, isPrimary ? styles.textWhite : styles.textDark]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

// -----------------------------------------------------------------------------
// MAIN SCREEN COMPONENT
// -----------------------------------------------------------------------------

interface WelcomeAuthScreenProps {
  navigation: any;
}

const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({ navigation }) => {
  const { googleSignIn, appleSignIn } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleEmailContinue = () => {
    navigation.navigate('EmailAuth');
  };

  const handleGoogleContinue = async () => {
    setGoogleLoading(true);
    try {
      await googleSignIn();
      // Navigation handled by AuthContext
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleContinue = async () => {
    setAppleLoading(true);
    try {
      await appleSignIn();
      // Navigation handled by AuthContext
    } catch (error: any) {
      Alert.alert('Apple Sign-In Failed', error.message);
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Background Image Area */}
      <ImageBackground
        source={BG_IMAGE_SOURCE}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* We use a gradient overlay or simply let the image shine. 
            Here the image acts as the "Abstract gradient wave". */}
        <View style={styles.backgroundOverlay} />
      </ImageBackground>

      {/* Bottom Sheet Content */}
      <View style={styles.bottomSheet}>
        <View style={styles.contentWrapper}>
          
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.logoText}>A Good Fit</Text>
            <Text style={styles.taglineText}>
              Find your people, move together.{'\n'}Supportive connections for every body.
            </Text>
          </View>

          {/* Auth Buttons Section */}
          <View style={styles.authContainer}>
            <Button 
              title="Continue with Email" 
              onPress={handleEmailContinue} 
              variant="primary" 
            />
            
            <View style={styles.gap} />
            
            <Button
              title="Continue with Google"
              onPress={handleGoogleContinue}
              variant="outline"
              logo={GOOGLE_LOGO}
              loading={googleLoading}
            />

            <View style={styles.gap} />

            {Platform.OS === 'ios' && (
              <Button
                title="Continue with Apple"
                onPress={handleAppleContinue}
                variant="outline"
                logo={APPLE_LOGO}
                loading={appleLoading}
              />
            )}
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>.
            </Text>
          </View>

        </View>
      </View>
    </View>
  );
};

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject, // Fill entire screen
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.1)', // Slight tint if needed
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xxl : SPACING.lg,
    // Soft shadow for the sheet
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 20,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 500, // Constrain width for tablets
    alignSelf: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textMain,
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
    // Font family would ideally be a custom rounded sans-serif
  },
  taglineText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  authContainer: {
    marginBottom: SPACING.lg,
  },
  gap: {
    height: SPACING.md,
  },
  buttonContainer: {
    width: '100%',
    height: 56, // Accessible touch target
    borderRadius: BORDER_RADIUS.lg, // Pill/Rounded shape
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    // Subtle shadow for primary button
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPrimaryPressed: {
    backgroundColor: COLORS.primaryLight,
  },
  buttonOutline: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.googleBorder,
  },
  buttonOutlinePressed: {
    backgroundColor: '#F9FAFB',
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  textWhite: {
    color: COLORS.white,
  },
  textDark: {
    color: COLORS.textMain,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footerContainer: {
    marginTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  footerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    fontWeight: '600',
    color: COLORS.textMain,
    textDecorationLine: 'underline',
  },
});

export default WelcomeAuthScreen;