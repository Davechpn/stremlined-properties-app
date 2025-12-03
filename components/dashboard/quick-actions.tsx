/**
 * Quick Actions Component
 * 
 * Display action buttons for common dashboard tasks.
 * Actions are contextual based on user's role and organization state.
 */

import { lightImpact } from '@/lib/utils/haptics';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

interface Action {
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'contained' | 'outlined' | 'text';
}

interface QuickActionsProps {
  /**
   * Array of actions to display
   */
  actions: Action[];
  
  /**
   * Number of actions to display per row
   * @default 2
   */
  actionsPerRow?: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  actionsPerRow = 2,
}) => {
  const theme = useTheme();

  const handleActionPress = async (action: Action) => {
    await lightImpact();
    action.onPress();
  };

  // Group actions into rows
  const rows: Action[][] = [];
  for (let i = 0; i < actions.length; i += actionsPerRow) {
    rows.push(actions.slice(i, i + actionsPerRow));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((action, actionIndex) => (
            <View key={actionIndex} style={styles.actionContainer}>
              <Button
                mode={action.variant || 'outlined'}
                onPress={() => handleActionPress(action)}
                icon={action.icon}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                {action.label}
              </Button>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  actionContainer: {
    flex: 1,
  },
  button: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
