export function GlassEffects() {
  return (
    <svg className="fixed h-0 w-0 pointer-events-none z-0">
      <defs>
        <filter id="liquid-prism" x="-20%" y="-20%" width="140%" height="140%">
          {/* ۱. ایجاد موج‌های درشت و مایع (Liquid Waves) */}
          <feTurbulence
            type="turbulence"
            baseFrequency="0.007" /* 👈 عدد خیلی کم = موج‌های خیلی بزرگ و نرم */
            numOctaves="1"
            result="noise"
          />

          {/* ۲. اعمال اعوجاج سنگین (Distortion) */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="10" /* 👈 قدرت اعوجاج! قبلاً ۲ بود، الان ۱۰ شد (متن‌ها قشنگ کج میشن) */
            xChannelSelector="R"
            yChannelSelector="G"
            result="distorted"
          />

          {/* ۳. همون شکست نور رنگی (RGB Split) که دوست داشتی */}
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            in="distorted"
            result="redChannel"
          />
          <feOffset in="redChannel" dx="-2" dy="0" result="redShifted" />

          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            in="distorted"
            result="blueChannel"
          />
          <feOffset in="blueChannel" dx="2" dy="0" result="blueShifted" />

          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            in="distorted"
            result="greenChannel"
          />

          <feBlend
            mode="screen"
            in="redShifted"
            in2="greenChannel"
            result="rg"
          />
          <feBlend
            mode="screen"
            in="rg"
            in2="blueShifted"
            result="recomposed"
          />
          <feComposite operator="in" in="recomposed" in2="SourceGraphic" />
        </filter>
      </defs>
    </svg>
  );
}
