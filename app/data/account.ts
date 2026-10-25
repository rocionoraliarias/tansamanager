export type Account = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type DemoLogin = Account & {
  password: string;
};

export function canConfigureAlerts(user: Account | undefined) {
  if (!user) return false;
  return user.role !== "Supervisión";
}
