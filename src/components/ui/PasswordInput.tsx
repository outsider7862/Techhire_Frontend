"use client";

import { useState } from "react";

/**
 * A password field with a show/hide eye toggle. Drop-in replacement for a
 * `<input type="password">` — pass the same props (value, onChange, required,
 * placeholder, className, …) and it keeps the caller's styling, adding room on
 * the right for the toggle button.
 */
export default function PasswordInput({
    className = "",
    ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <input {...props} type={show ? "text" : "password"} className={`${className} pr-10`} />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                tabIndex={-1}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
            >
                {show ? (
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                ) : (
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </div>
    );
}
