const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || "acie_access_secret_change_in_production",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "acie_refresh_secret_change_in_production",
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  resetTokenExpiryMs: 15 * 60 * 1000,
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

export default jwtConfig;
