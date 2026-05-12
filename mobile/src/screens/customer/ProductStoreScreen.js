import React, {useEffect, useState} from 'react';
import {Button, Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import {productApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';

export default function ProductStoreScreen() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

  async function load() {
    const {data} = await productApi.list();
    setProducts(data.products || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function buy(product) {
    setMessage('');
    try {
      await productApi.createOrder({product: product._id, quantity: 1});
      setMessage(`${product.name} order placed`);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Order failed');
    }
  }

  return (
    <AppScreen onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>Beauty products</Text>
      <Text style={styles.subtitle}>MitPix Aura Studio grooming and beauty care products.</Text>
      {message ? <Text style={{marginBottom: 12}}>{message}</Text> : null}
      {!products.length ? <EmptyState title="No products available" /> : products.map((product) => (
        <ResourceCard
          key={product._id}
          title={product.name}
          subtitle={product.description}
          meta={`Rs ${product.price} | ${product.stock} in stock`}
          actionLabel="Buy"
          onPress={() => buy(product)}
        />
      ))}
      <Button mode="outlined" onPress={load}>Refresh products</Button>
    </AppScreen>
  );
}

