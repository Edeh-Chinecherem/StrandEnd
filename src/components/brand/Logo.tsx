import React from 'react';

interface LogoProps {
  variant?: 'full' | 'mark' | 'stitch';
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'light', // 'light' means on light background (Ink text), 'dark' means on dark/indigo background (Chalk text)
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const isDarkBg = theme === 'dark';
  const textColor = isDarkBg ? 'text-[#F7F2EA]' : 'text-[#232A5C]';
  const strandColor = isDarkBg ? '#F7F2EA' : '#232A5C';
  const coralColor = '#E2573A';

  // Sizing definitions
  const sizeConfig = {
    sm: { height: 26, markSize: 26, textClass: 'text-lg', taglineClass: 'text-[9px]' },
    md: { height: 34, markSize: 34, textClass: 'text-2xl', taglineClass: 'text-xs' },
    lg: { height: 46, markSize: 46, textClass: 'text-3xl', taglineClass: 'text-sm' },
    xl: { height: 60, markSize: 60, textClass: 'text-4xl', taglineClass: 'text-base' },
  }[size];

  // Concept A Mark: The Strand (Continuous fluid thread curve ending in a solid coral dot)
  const StrandMark = (
    <svg
      width={sizeConfig.markSize}
      height={sizeConfig.markSize}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="StrandEnd Logo Mark"
    >
      {/* S-curve thread */}
      <path
        d="M28 8C20 8 13 11 13 18C13 25 31 23 31 31C31 36 24 37 17 35"
        stroke={strandColor}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* The Strand End: Terminal Coral Dot */}
      <circle cx="15.5" cy="35" r="4.5" fill={coralColor} />
    </svg>
  );

  // Concept B Mark: The Stitch (Running stitch mark for compact 24px icon or app badge)
  const StitchMark = (
    <svg
      width={sizeConfig.markSize}
      height={sizeConfig.markSize}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 rounded-lg shadow-sm"
      aria-label="StrandEnd App Icon"
    >
      <rect width="36" height="36" rx="8" fill="#232A5C" />
      {/* Tailor's running stitch in Chalk with coral knot finish */}
      <path
        d="M23 10C17 10 12 12 12 17C12 22 24 20 24 25C24 28 19 29.5 14 28"
        stroke="#F7F2EA"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="3.5 3.5"
        fill="none"
      />
      <circle cx="12.5" cy="28" r="3.2" fill="#E2573A" />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{StrandMark}</div>;
  }

  if (variant === 'stitch') {
    return <div className={`inline-flex items-center ${className}`}>{StitchMark}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {StrandMark}
      <div className="flex flex-col leading-none">
        <div className={`font-serif tracking-tight font-semibold flex items-baseline ${sizeConfig.textClass} ${textColor}`}>
          <span>Strand</span>
          <span className="text-[#E2573A]">End</span>
        </div>
        {showTagline && (
          <span className={`text-[#8C827A] font-sans font-medium tracking-normal mt-0.5 ${sizeConfig.taglineClass}`}>
            End the stranded feeling.
          </span>
        )}
      </div>
    </div>
  );
};

