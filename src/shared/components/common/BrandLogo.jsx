import React from 'react';
import { Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { RADIUS, SHADOWS } from '../../constants/theme.js';

const BrandLogo = ({ size = 96, style }) => (
  <Image
    source={require('../../../../assets/Logo.png')}
    style={[styles.logo, { width: size, height: size }, style]}
    resizeMode="contain"
    accessibilityRole="image"
    accessibilityLabel="KinalEat"
  />
);

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm
  }
});

BrandLogo.propTypes = {
  size: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};

export default BrandLogo;
