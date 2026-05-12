import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {bookingApi, contentApi, offerApi} from '../api/endpoints';
import {colors} from '../theme/theme';

export default function BottomPromoTicker() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    async function load() {
      const nextItems = [];
      try {
        const [{data: offerData}, {data: contentData}, {data: rewardData}] = await Promise.all([
          offerApi.list(),
          contentApi.get('why-choose-us'),
          bookingApi.monthlyRewards(),
        ]);
        const firstOffer = offerData.offers?.[0];
        if (firstOffer) {
          nextItems.push({
            label: 'Offer',
            title: firstOffer.title,
            detail: firstOffer.discountPercent ? `${firstOffer.discountPercent}% off` : firstOffer.description,
          });
        }
        const party = contentData.content?.party;
        if (party) {
          nextItems.push({
            label: 'Annual party',
            title: party.date,
            detail: party.prizes?.[0] ? `${party.prizes[0].rank}: ${party.prizes[0].title}` : party.title,
          });
        }
        const winner = rewardData.paymentWinner || rewardData.serviceWinner;
        nextItems.push({
          label: 'Monthly gift',
          title: winner?.name || 'Winner updating soon',
          detail: winner ? `${winner.services} services | Rs ${winner.paid || 0}` : rewardData.monthlyGift,
        });
      } catch (_err) {
        nextItems.push({label: 'Monthly gift', title: 'Rewards', detail: 'Top service and top payment winners appear here'});
      }
      if (mounted) setItems(nextItems);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (items.length < 2) return undefined;
    const timer = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, {toValue: 0, duration: 220, useNativeDriver: true}),
        Animated.timing(fade, {toValue: 1, duration: 220, useNativeDriver: true}),
      ]).start();
      setIndex((current) => (current + 1) % items.length);
    }, 5600);
    return () => clearInterval(timer);
  }, [fade, items.length]);

  const item = useMemo(() => items[index] || items[0], [index, items]);
  if (!item) return null;

  return (
    <View style={tickerStyles.wrap}>
      <Animated.View style={[tickerStyles.box, {opacity: fade}]}>
        <Text style={tickerStyles.label}>{item.label}</Text>
        <Text numberOfLines={1} style={tickerStyles.title}>{item.title}</Text>
        <Text numberOfLines={1} style={tickerStyles.detail}>{item.detail}</Text>
      </Animated.View>
    </View>
  );
}

const tickerStyles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.ink,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  box: {
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3C04E',
    backgroundColor: '#2D2307',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  label: {color: '#F3C04E', fontSize: 11, fontWeight: '800'},
  title: {color: '#FFF8D7', fontSize: 15, fontWeight: '800', marginTop: 2},
  detail: {color: '#FFE8A3', fontSize: 12, marginTop: 2},
});
