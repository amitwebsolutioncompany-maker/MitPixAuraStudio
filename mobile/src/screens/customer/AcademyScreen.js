import React, {useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import AppScreen from '../../components/AppScreen';
import EmptyState from '../../components/EmptyState';
import ResourceCard from '../../components/ResourceCard';
import ScreenHero from '../../components/ScreenHero';
import UpcomingCover from '../../components/UpcomingCover';
import {academyApi} from '../../api/endpoints';
import {styles} from '../../theme/styles';
import {heroImages} from '../../theme/visuals';

export default function AcademyScreen() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');

  async function load() {
    const {data} = await academyApi.list();
    setCourses(data.courses || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function enroll(course) {
    setMessage('');
    try {
      await academyApi.enroll({course: course._id});
      setMessage(`${course.title} enrollment sent`);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Enrollment failed');
    }
  }

  return (
    <AppScreen onRefresh={load}>
      <UpcomingCover
        title="Academy coming soon"
        subtitle="Courses, batches and enrollment will open here after the academy schedule is ready."
      />
      <ScreenHero
        image={heroImages.academy}
        icon="academy"
        title="MitPix Aura Academy"
        subtitle="Online and offline grooming beauty courses."
      />
      <Text variant="titleMedium" style={styles.title}>Courses</Text>
      <Text style={styles.subtitle}>Online and offline grooming beauty courses.</Text>
      {message ? <Text style={{marginBottom: 12}}>{message}</Text> : null}
      {!courses.length ? <EmptyState title="No courses available" /> : courses.map((course) => (
        <ResourceCard
          key={course._id}
          title={course.title}
          subtitle={course.description}
          meta={`${course.mode} | Rs ${course.price} | ${course.duration || 'Flexible'}`}
          actionLabel="Enroll"
          onPress={() => enroll(course)}
        />
      ))}
    </AppScreen>
  );
}
