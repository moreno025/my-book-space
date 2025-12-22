import { Tabs } from "expo-router";
import { TabBar } from "@/components/navigation/TabBar";

export default function AppLayout() {
  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="search" options={{ title: "Buscar" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          href: null,
        }}
      />
    </Tabs>
  );
}
