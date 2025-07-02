import { Mixpanel } from "mixpanel-react-native";

const trackAutomaticEvents = false;
const mixpanel = new Mixpanel(
  "7b7ed589cac2a2b523fcf7e018564982",
  trackAutomaticEvents
);
mixpanel.init();

export default mixpanel;

export const login = (userId: string) => {
  mixpanel.identify(userId);
};

export const logout = () => {
  mixpanel.reset();
};

export const showAds = (properties?: Record<string, any>) => {
  mixpanel.track("Show Ads", properties);
};
