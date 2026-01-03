import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen1() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6B7B5E" />
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
    backgroundColor: '#6B7B5E',
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
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 70,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 1,
    opacity: 0.9,
    fontStyle: 'italic',
    marginTop: 16,
  },
});
