export type LoginInput = {
  email: string;
  password: string;
};

export type LoginOutput = {
  accessToken: string;
  tokenType: "Bearer";
  user: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    active: boolean;
  };
};
