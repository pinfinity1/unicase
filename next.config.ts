const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1", // برای نمایش روی سیستم خودتان ضروری است
        port: "9000",
        pathname: "/unicase-media/**",
      },
      {
        protocol: "http",
        hostname: "minio", // اگر روزی اپ را داخل داکر بردید لازم می‌شود
        port: "9000",
        pathname: "/unicase-media/**",
      },
    ],
  },
};
export default nextConfig;
