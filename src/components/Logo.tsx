import React, { useEffect, useState } from "react";
import vitalVoiceLogo from "@/assets/vitalvoice-logo.png";
import vitalVoiceLogoDark from "@/assets/vitalvoice-logo-dark.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "lg", showText = true, className = "" }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const sizes = {
    sm: { logo: "h-14" },
    md: { logo: "h-16" },
    lg: { logo: "h-20" },
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={isDark ? vitalVoiceLogoDark : vitalVoiceLogo} 
        alt="VitalVoice Logo" 
        className={`${sizes[size].logo} object-contain`} 
      />
    </div>
  );
};
