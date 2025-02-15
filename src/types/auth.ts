export type User = {
    id: string;
    email: string;
    full_name: string;
    picture?: string;
    disabled: boolean;
    subscription_tier: string | null;
    active_subscription: boolean;
  };