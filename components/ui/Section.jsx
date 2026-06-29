import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export default function Section({ 
  children, 
  className, 
  containerClass, 
  id,
  darker = false
}) {
  return (
    <section 
      id={id} 
      className={twMerge(clsx(
        'py-20 md:py-25 relative overflow-hidden',
        darker ? 'bg-[#021414]' : 'bg-transparent',
        className
      ))}
    >
      <div className={twMerge(clsx('mx-auto px-6 md:px-15 xl:px-20 relative z-10', containerClass))}>
        {children}
      </div>
    </section>
  );
}
