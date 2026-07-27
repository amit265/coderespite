import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, Platform } from "react-native";

const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

function getColor(count) {
  if (count === 0) return "#eee";
  if (count <= 2) return "#9be9a8";
  if (count <= 4) return "#40c463";
  if (count <= 6) return "#30a14e";
  return "#216e39";
}

export default function StreakHeatmap({ data }) {
  const [tooltip, setTooltip] = useState(null); // {date, count, x, y}

  // Group data by week (columns)
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      {/* Days labels vertically */}
      <View style={styles.daysColumn}>
        {daysOfWeek.map((day, i) => (
          <Text key={i} style={styles.dayLabel}>
            {day}
          </Text>
        ))}
      </View>

      {/* Heatmap grid */}
      <View style={styles.grid}>
        {weeks.map((week, colIdx) => (
          <View key={colIdx} style={styles.weekColumn}>
            {week.map((day, rowIdx) => (
              <Pressable
                key={day.date ?? `${colIdx}-${rowIdx}`}
                disabled={!day.date}
                onPress={(e) => {
                  if (!day.date) return;
                  const { pageX, pageY } = e.nativeEvent;
                  setTooltip({
                    date: day.date,
                    count: day.count,
                    x: pageX,
                    y: pageY,
                  });
                }}
                style={[
                  styles.square,
                  { backgroundColor: day.date ? getColor(day.count) : "#fff" },
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Tooltip modal */}
      <Modal
        transparent
        visible={!!tooltip}
        animationType="fade"
        onRequestClose={() => setTooltip(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setTooltip(null)}>
          {tooltip && (
            <View
              style={[
                styles.tooltip,
                { top: tooltip.y - 70, left: tooltip.x - 60 },
              ]}
            >
              <Text style={styles.tooltipText}>{tooltip.date}</Text>
              <Text style={styles.tooltipText}>Activity: {tooltip.count}</Text>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center" },
  daysColumn: {
    justifyContent: "space-between",
    height: 140, // 20*7 + margin, adjust as needed
    marginRight: 6,
  },
  dayLabel: {
    fontSize: 12,
    color: "#555",
    height: 20,
    textAlign: "center",
    marginTop: 2,
  },
  grid: { flexDirection: "row" },
  weekColumn: { flexDirection: "column" },
  square: {
    width: 20,
    height: 20,
    marginVertical: 2,
    marginHorizontal: 2,
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    width: "100%",
    alignSelf: "center",
    ...(Platform.OS === 'web' && {
      maxWidth: 480,
    }),
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "#000",
    padding: 8,
    borderRadius: 6,
    opacity: 0.8,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
  },
});
