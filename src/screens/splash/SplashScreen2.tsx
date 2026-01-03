import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreen2Props {
  onLogin: () => void;
  onSignUp: () => void;
}

export default function SplashScreen2({ onLogin, onSignUp }: SplashScreen2Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EFE6" />
      <ImageBackground
        source={require('../../../splash_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoLine}>A</Text>
            <Text style={styles.logoLine}>Good</Text>
            <Text style={styles.logoLine}>Fit</Text>
            <Text style={styles.tagline}>Wellness. Connection. Community</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={onLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={onSignUp}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5EFE6',
    opacity: 0.60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: width * 0.1, // Start from left side with some padding
  },
  logoContainer: {
    alignItems: 'flex-start', // Left align text
  },
  logoLine: {
    fontSize: 64,
    fontWeight: '700', // Bold weight like auth page
    color: '#6B7B5E',
    letterSpacing: -0.5,
    lineHeight: 70,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7B5E',
    letterSpacing: 1,
    opacity: 0.8,
    fontStyle: 'italic',
    marginTop: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 32,
    right: 32,
    gap: 16,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6B7B5E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7B5E',
    letterSpacing: 0.5,
  },
  signUpButton: {
    backgroundColor: '#6B7B5E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
