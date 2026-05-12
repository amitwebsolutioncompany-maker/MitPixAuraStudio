import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ScreenHero from '../../components/ScreenHero';
import {offerApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {colors} from '../../theme/theme';
import {heroImages} from '../../theme/visuals';

export default function OffersScreen() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    offerApi.list().then(({data}) => setOffers(data.offers));
  }, []);

  return (
    <AppScreen>
      <ScreenHero
        image={heroImages.offers}
        icon="offers"
        title="Luxury offers"
        subtitle="Premium deals and seasonal beauty privileges."
      />
      <Text variant="titleMedium" style={styles.title}>Current offers</Text>
      {!offers.length ? <EmptyState title="No active offers" /> : offers.map((offer) => (
        <View key={offer._id} style={offerStyles.card}>
          <View style={offerStyles.ribbon}>
            <Text style={offerStyles.ribbonText}>{offer.discountPercent ? `${offer.discountPercent}% OFF` : 'BENEFIT'}</Text>
          </View>
          <Text variant="titleMedium" style={offerStyles.title}>{offer.title}</Text>
          <Text style={offerStyles.description}>{offer.description}</Text>
          <Text style={offerStyles.meta}>{offer.salon?.name || 'All salons'} {offer.salon?.city ? `| ${offer.salon.city}` : ''}</Text>
        </View>
      ))}
    </AppScreen>
  );
}

const offerStyles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3C04E',
    padding: 14,
    backgroundColor: '#2D2307',
  },
  ribbon: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    backgroundColor: '#F3C04E',
  },
  ribbonText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    color: '#FFF8D7',
    fontWeight: '900',
  },
  description: {
    marginTop: 6,
    color: '#FFE8A3',
  },
  meta: {
    marginTop: 10,
    color: colors.successSoft,
    fontWeight: '800',
  },
});
