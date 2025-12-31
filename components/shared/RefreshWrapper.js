import React, { useState, useCallback } from "react";
import { ScrollView, RefreshControl, View } from "react-native";

/**
 * A wrapper that makes any screen scrollable and refreshable.
 *
 * @param {Function} onRefresh - The async function to call when pulling down.
 * @param {Boolean} refreshing - (Optional) Force the spinner state. If omitted, the component handles it automatically.
 * @param {React.ReactNode} children - The content of the screen.
 * @param {String} className - (Optional) Tailwind classes for the container.
 */
export default function RefreshWrapper({
  children,
  onRefresh,
  refreshing: externalRefreshing,
  className,
}) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  // Determine if we are using internal state or external prop
  const isRefreshing =
    externalRefreshing !== undefined ? externalRefreshing : internalRefreshing;

  const onRefreshHandler = useCallback(async () => {
    // If the parent controls the state (externalRefreshing is passed), just call the function
    if (externalRefreshing !== undefined) {
      if (onRefresh) onRefresh();
      return;
    }

    // Otherwise, handle the loading state locally
    setInternalRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setInternalRefreshing(false);
    }
  }, [onRefresh, externalRefreshing]);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}

      showsVerticalScrollIndicator={false}
      className={className}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefreshHandler}
          colors={["#000"]} // Android spinner color
          tintColor="#000" // iOS spinner color
        />
      }
    >
      {children}
    </ScrollView>
  );
}