import { Tabs } from "expo-router";
import { TabBar } from "@/components/navigation/TabBar";
import { useTranslation } from "react-i18next";

export default function AppLayout() {
  const { t } = useTranslation();




  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#0F172A',
          borderBottomWidth: 1,
          borderBottomColor: '#1E293B',
        },
        headerTitleStyle: {
          color: '#FFF',
          fontFamily: 'Nunito-Bold',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="search" options={{ title: t('tabs.search') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
    </Tabs>
  );
}
