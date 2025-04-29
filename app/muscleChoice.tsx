import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed'; // Si tu utilises Themed, sinon remplace par View classique
import { useState } from 'react';

const muscleGroups = [
  { id: '1', name: 'Bras' },
  { id: '2', name: 'Jambes' },
  { id: '3', name: 'Dos' },
  { id: '4', name: 'Poitrine' },
  { id: '5', name: 'Épaules' },
  { id: '6', name: 'Abdominaux' },
];

export default function MuscleSelectionScreen() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    if (selectedGroups.includes(id)) {
      setSelectedGroups(selectedGroups.filter(groupId => groupId !== id));
    } else {
      setSelectedGroups([...selectedGroups, id]);
    }
  };

  const renderItem = ({ item }: { item: { id: string; name: string } }) => {
    const isSelected = selectedGroups.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => toggleSelection(item.id)}
      >
        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez vos groupes musculaires</Text>
      
      <FlatList
        data={muscleGroups}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // fond blanc
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  list: {
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  item: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent', // pas de bordure par défaut
  },
  selectedItem: {
    borderColor: '#007BFF', // bordure bleue quand sélectionné
  },
  itemText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
  },
});
