/*
 * Shared visual primitives for "The Registry" design language.
 *
 * Sidebar, Navbar, Login, Register and Dashboard were built first and
 * established the pattern: flat ink/paper/brass palette, sharp corners,
 * hairline borders instead of shadows, and a brass/moss/rust tag system
 * for status. These primitives let the remaining pages (Assets,
 * Subscriptions, Notifications, Workspace) reuse that pattern exactly
 * instead of each one inventing its own spacing and colors.
 */

export const inputCls =
    "w-full border border-border px-3 py-2 text-sm text-ink bg-surface placeholder:text-slate/70 focus:border-brass";

export const primaryBtnCls =
    "bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-60";

export const secondaryBtnCls =
    "border border-border text-ink px-4 py-2 text-sm hover:border-ink transition-colors disabled:opacity-60";

export const textLinkCls =
    "text-sm text-brass-strong hover:underline";


export function PageHeading({ children, action }){

    return (

        <div className="flex justify-between items-center mb-7 flex-wrap gap-3">

            <h1 className="font-display text-3xl font-semibold text-ink">
                {children}
            </h1>

            {action}

        </div>

    );

}


export function ErrorBanner({ children }){

    if(!children) return null;

    return (

        <div className="bg-rust-tint border border-rust/20 text-rust text-sm px-4 py-2.5 mb-5">
            {children}
        </div>

    );

}


export function EmptyState({ children }){

    return (

        <div className="bg-surface border border-dashed border-border px-5 py-8 text-center text-slate text-sm">
            {children}
        </div>

    );

}


// A flat row panel - the registry's basic unit for one record (an asset,
// a subscription, a notification). No shadow, no large radius.
export function Row({ children, className = "" }){

    return (

        <div className={`bg-surface border border-border px-5 py-4 ${className}`}>
            {children}
        </div>

    );

}


const tagTones = {
    brass: "bg-brass-tint text-brass-strong",
    moss:  "bg-moss-tint text-moss",
    rust:  "bg-rust-tint text-rust",
    ink:   "bg-ink/5 text-slate"
};

// Small status chip used for roles, warranty state, notification type.
// Set in mono because this is genuinely a short data token, not prose.
export function Tag({ tone = "ink", children }){

    return (
        <span className={`text-xs font-mono px-2 py-0.5 whitespace-nowrap ${tagTones[tone] || tagTones.ink}`}>
            {children}
        </span>
    );

}
