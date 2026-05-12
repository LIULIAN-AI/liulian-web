export type PersonaType = 'male' | 'female';

export function pickRandomPersona(): PersonaType {
  return Math.random() < 0.5 ? 'male' : 'female';
}

interface ProfessionalPersonaIconProps {
  persona: PersonaType;
  className?: string;
}

function MaleProfessionalAvatar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      width="1em"
      height="1em"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="professional persona male"
    >
      <circle cx="24" cy="24" r="22" fill="#FFF8F2" />
      <path d="M16 34C16 29.6 19.6 26 24 26C28.4 26 32 29.6 32 34V37H16V34Z" fill="#324B7A" />
      <path d="M23 28H25L26.4 32L24 36L21.6 32L23 28Z" fill="#C65B45" />
      <circle cx="24" cy="17" r="7.4" fill="#F2C5A0" />
      <path
        d="M16.8 16.8C16.8 12.3 20.3 9 24.5 9C28.7 9 31.8 12 31.8 16.3C30.4 15.2 29 14.6 27.5 14.6C24.6 14.6 22.6 16.2 20.9 17.9C19.6 17.7 18.4 17.3 16.8 16.8Z"
        fill="#4A372B"
      />
      <path d="M18.4 21.1C19.5 21.1 20.4 20.2 20.4 19.1V17.7H18.4V21.1Z" fill="#F2C5A0" />
      <path d="M29.7 21.1C30.8 21.1 31.7 20.2 31.7 19.1V17.7H29.7V21.1Z" fill="#F2C5A0" />
    </svg>
  );
}

function FemaleProfessionalAvatar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      width="1em"
      height="1em"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="professional persona female"
    >
      <circle cx="24" cy="24" r="22" fill="#FFF8F2" />
      <path d="M15.8 34C15.8 29.5 19.5 26 24 26C28.5 26 32.2 29.5 32.2 34V37H15.8V34Z" fill="#2E5A6A" />
      <path d="M21.5 28.4H26.5L24 32.2L21.5 28.4Z" fill="#B45A50" />
      <circle cx="24" cy="17" r="7.2" fill="#F3C7A6" />
      <path
        d="M16 19.5C16 12.8 19.4 9 24 9C28.6 9 32 12.7 32 19.4V21.5C30.9 20.8 29.7 20.3 28.2 20.1C26.9 18.9 25.6 18.1 24 18.1C22.4 18.1 21.1 18.9 19.8 20.1C18.3 20.3 17.1 20.8 16 21.5V19.5Z"
        fill="#5A3D33"
      />
      <path d="M16 24C17.3 23.2 18.8 22.7 20.4 22.7V25.7C18.7 25.7 17.2 25 16 24Z" fill="#5A3D33" />
      <path d="M32 24C30.8 25 29.3 25.7 27.6 25.7V22.7C29.2 22.7 30.7 23.2 32 24Z" fill="#5A3D33" />
    </svg>
  );
}

export function ProfessionalPersonaIcon({ persona, className }: ProfessionalPersonaIconProps) {
  if (persona === 'female') {
    return <FemaleProfessionalAvatar className={className} />;
  }
  return <MaleProfessionalAvatar className={className} />;
}
