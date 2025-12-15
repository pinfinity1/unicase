const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/unicase-media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/unicase-media/**",
      },
      {
        protocol: "http",
        hostname: "minio", // برای زمانی که در آینده روی سرور رفت
        port: "9000",
        pathname: "/unicase-media/**",
      },
    ],
  },
};
export default nextConfig;
