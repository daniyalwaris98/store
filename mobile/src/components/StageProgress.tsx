import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStage } from '../types/order';

interface StageProgressProps {
  currentStage: OrderStage;
  onUpdateStage?: () => void;
}

const stages: OrderStage[] = ['unpaid', 'processing', 'shipped', 'delivered'];

const stageConfig: Record<OrderStage, { icon: string; label: string; color: string }> = {
  unpaid: { icon: '⏱', label: 'Unpaid', color: '#FF9800' },
  processing: { icon: '📦', label: 'Processing', color: '#2196F3' },
  shipped: { icon: '🚚', label: 'Shipped', color: '#9C27B0' },
  delivered: { icon: '✓', label: 'Delivered', color: '#4CAF50' },
};

export function StageProgress({ currentStage, onUpdateStage }: StageProgressProps) {
  const currentIndex = stages.indexOf(currentStage);

  const handlePress = () => {
    if (onUpdateStage) {
      onUpdateStage();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {stages.map((stage, index) => {
          const config = stageConfig[stage];
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === stages.length - 1;

          return (
            <React.Fragment key={stage}>
              <View style={styles.stageItem}>
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isCurrent && styles.circleCurrent,
                    { borderColor: config.color },
                  ]}
                >
                  <Text style={styles.icon}>{config.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.label,
                    isCurrent && styles.labelCurrent,
                    isCompleted && styles.labelCompleted,
                  ]}
                >
                  {config.label}
                </Text>
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    isCompleted && styles.lineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {onUpdateStage && currentStage !== 'delivered' && (
        <View style={styles.updateButton}>
          <Text style={styles.updateText} onPress={handlePress}>
            Update Stage →
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageItem: {
    alignItems: 'center',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  circleCurrent: {
    backgroundColor: '#fff',
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    textAlign: 'center',
  },
  labelCurrent: {
    color: '#333',
    fontWeight: '600',
  },
  labelCompleted: {
    color: '#4CAF50',
  },
  line: {
    flex: 1,
    height: 3,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
    marginBottom: 24,
  },
  lineCompleted: {
    backgroundColor: '#4CAF50',
  },
  updateButton: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  updateText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
});