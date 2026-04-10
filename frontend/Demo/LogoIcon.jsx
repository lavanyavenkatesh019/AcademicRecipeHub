import React from 'react';

const LogoIcon = ({ className = "h-8 w-8 transition-transform duration-300", color = "#ea580c" }) => (
  <svg 
    viewBox="0 0 100 120" 
    className={`${className} filter drop-shadow-sm`} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Steam Lines */}
    <path 
      d="M40 25c0-5 3-10 3-15M50 25c0-5 3-10 3-15M60 25c0-5 3-10 3-15" 
      stroke={color} 
      strokeWidth="4" 
      strokeLinecap="round" 
    />
    
    {/* Chef Hat Top */}
    <path 
      d="M30 60c-15 0-15-20 0-20c0-10 10-15 20-15s20 5 20 15c15 0 15 20 0 20" 
      stroke={color} 
      strokeWidth="6" 
      strokeLinecap="round" 
    />
    
    {/* Integrated H Base */}
    <path 
      d="M35 60v40M65 60v40M35 80h30" 
      stroke={color} 
      strokeWidth="10" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* H Legs Base extensions */}
    <path d="M30 100h10M60 100h10" stroke={color} strokeWidth="10" strokeLinecap="round" />
  </svg>
);

export default LogoIcon;
