import { forwardRef, TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`
          w-full px-3 py-2 border rounded-lg text-sm resize-y min-h-[100px]
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300'
          }
          ${className}
        `}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';
