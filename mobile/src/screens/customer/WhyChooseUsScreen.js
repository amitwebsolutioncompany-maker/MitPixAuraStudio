import React, {useEffect, useState} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import MenuIcon from '../../components/MenuIcon';
import ScreenHero from '../../components/ScreenHero';
import {bookingApi, contentApi} from '../../api/endpoints';
import {colors} from '../../theme/theme';
import {heroImages} from '../../theme/visuals';

const fallbackContent = {
  title: 'Why Choose Us',
  subtitle: 'Luxury salon privileges crafted for clients who value time, comfort and premium care.',
  heroImage: heroImages.whyChoose,
  benefits: [
    {title: 'Daily Signature Offers', description: 'Exclusive daily beauty privileges with premium value.', icon: 'offers'},
    {title: 'Luxury Feel', description: 'An elegant salon atmosphere for a polished experience.', icon: 'salon'},
    {title: 'Premium Service', description: 'Expert care, refined products and detail-first grooming.', icon: 'staff'},
    {title: 'Fast Appointments', description: 'Book ahead, arrive on time and skip the waiting queue.', icon: 'slots'},
  ],
  party: {
    title: 'Annual Elite Client Party',
    address: 'MitPix Aura Studio, Main Luxury Lounge',
    date: '31 December 2026',
    image: heroImages.party,
    inviteRule: 'Clients with 20+ salon visits in a year receive an exclusive party invitation.',
    luckyDrawNote: 'Lucky draw winners from invited guests receive premium gifts.',
    prizes: [
      {rank: '1st Prize', title: 'Luxury Beauty Hamper', description: 'Premium care products and salon vouchers.'},
      {rank: '2nd Prize', title: 'Signature Makeover', description: 'A complete premium grooming session.'},
      {rank: '3rd Prize', title: 'Gold Service Voucher', description: 'Special voucher for your next salon visit.'},
    ],
  },
};

export default function WhyChooseUsScreen() {
  const [content, setContent] = useState(fallbackContent);
  const [reward, setReward] = useState(null);

  useEffect(() => {
    contentApi.get('why-choose-us')
      .then(({data}) => setContent(data.content || fallbackContent))
      .catch(() => setContent(fallbackContent));
    bookingApi.monthlyRewards()
      .then(({data}) => setReward(data))
      .catch(() => setReward(null));
  }, []);

  const party = content.party || fallbackContent.party;

  return (
    <AppScreen>
      <ScreenHero
        image={content.heroImage || fallbackContent.heroImage}
        icon="why"
        title={content.title || fallbackContent.title}
        subtitle={content.subtitle || fallbackContent.subtitle}
      />

      <View style={screenStyles.benefitGrid}>
        {(content.benefits || fallbackContent.benefits).map((benefit) => (
          <Card key={benefit.title} style={screenStyles.benefitCard} mode="elevated">
            <Card.Content>
              <View style={screenStyles.iconBadge}>
                <MenuIcon name={benefit.icon || 'why'} size={18} color={colors.ink} />
              </View>
              <Text variant="titleMedium" style={screenStyles.cardTitle}>{benefit.title}</Text>
              <Text style={screenStyles.cardText}>{benefit.description}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <ImageBackground source={{uri: party.image || heroImages.party}} imageStyle={screenStyles.partyImage} style={screenStyles.partyCard}>
        <View style={screenStyles.partyOverlay}>
          <Text variant="headlineSmall" style={screenStyles.partyTitle}>{party.title}</Text>
          <Text style={screenStyles.partyMeta}>{party.date}</Text>
          <Text style={screenStyles.partyMeta}>{party.address}</Text>
          <Text style={screenStyles.partyCopy}>{party.inviteRule}</Text>
          <Text style={screenStyles.partyCopy}>{party.luckyDrawNote}</Text>
        </View>
      </ImageBackground>

      <Card style={screenStyles.monthlyCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={screenStyles.cardTitle}>Monthly Reward Gift</Text>
          <Text style={screenStyles.cardText}>
            {reward?.paymentWinner?.name || 'Top paying customer'} gets the monthly gift.
          </Text>
          <Text style={screenStyles.cardText}>
            {reward?.paymentWinner ? `${reward.paymentWinner.services} services | Rs ${reward.paymentWinner.paid || 0}` : 'Winner updates after completed payments are saved.'}
          </Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={screenStyles.prizeHeading}>Lucky Draw Gifts</Text>
      {(party.prizes || fallbackContent.party.prizes).map((prize) => (
        <Card key={prize.rank} style={screenStyles.prizeCard} mode="elevated">
          <Card.Content style={screenStyles.prizeContent}>
            <View style={screenStyles.rankBadge}>
              <Text style={screenStyles.rankText}>{prize.rank}</Text>
            </View>
            <View style={screenStyles.prizeTextWrap}>
              <Text variant="titleMedium" style={screenStyles.cardTitle}>{prize.title}</Text>
              <Text style={screenStyles.cardText}>{prize.description}</Text>
            </View>
          </Card.Content>
        </Card>
      ))}
    </AppScreen>
  );
}

const screenStyles = StyleSheet.create({
  benefitGrid: {
    gap: 12,
  },
  benefitCard: {
    borderRadius: 8,
    backgroundColor: colors.panel,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: colors.softGold,
  },
  cardTitle: {
    color: colors.softGold,
    fontWeight: '900',
  },
  cardText: {
    marginTop: 6,
    color: colors.text,
  },
  partyCard: {
    minHeight: 300,
    overflow: 'hidden',
    borderRadius: 8,
    marginTop: 18,
    backgroundColor: colors.charcoal,
  },
  partyImage: {
    borderRadius: 8,
  },
  partyOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  partyTitle: {
    color: colors.softGold,
    fontWeight: '900',
  },
  partyMeta: {
    marginTop: 6,
    color: colors.text,
    fontWeight: '800',
  },
  partyCopy: {
    marginTop: 10,
    color: colors.text,
  },
  prizeHeading: {
    marginTop: 18,
    marginBottom: 8,
    color: colors.gold,
    fontWeight: '900',
  },
  monthlyCard: {
    marginTop: 18,
    borderRadius: 8,
    backgroundColor: colors.panel,
  },
  prizeCard: {
    borderRadius: 8,
    backgroundColor: colors.panel,
  },
  prizeContent: {
    flexDirection: 'row',
    gap: 12,
  },
  rankBadge: {
    width: 74,
    minHeight: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: colors.deepGold,
  },
  rankText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  prizeTextWrap: {
    flex: 1,
  },
});
