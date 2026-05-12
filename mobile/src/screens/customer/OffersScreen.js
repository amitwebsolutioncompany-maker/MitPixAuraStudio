import React, {useEffect, useState} from 'react';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import {offerApi} from '../../api/endpoints';

export default function OffersScreen() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    offerApi.list().then(({data}) => setOffers(data.offers));
  }, []);

  return (
    <AppScreen>
      {!offers.length ? <EmptyState title="No active offers" /> : offers.map((offer) => (
        <ResourceCard key={offer._id} title={offer.title} subtitle={offer.description} meta={offer.discountPercent ? `${offer.discountPercent}% off` : offer.salon?.name} />
      ))}
    </AppScreen>
  );
}
