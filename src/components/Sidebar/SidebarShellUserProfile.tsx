import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Avatar } from "@/components/Avatar/Avatar";
import { useSidebarShellContext } from "./SidebarShell";
import { sidebarShellUserProfileStyles } from "./Sidebar.styles";

export interface SidebarShellUser {
  displayName: string;
  photoURL?: string;
  plan?: string;
}

export interface SidebarShellUserProfileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  user: SidebarShellUser;
}

export const SidebarShellUserProfile = forwardRef<
  HTMLButtonElement,
  SidebarShellUserProfileProps
>(({ user, className, ...props }, ref) => {
  const { collapsed } = useSidebarShellContext();

  return (
    <button
      ref={ref}
      type="button"
      aria-label={user.displayName}
      className={sidebarShellUserProfileStyles({ collapsed, className })}
      {...props}
    >
      <Avatar
        src={user.photoURL}
        alt={user.displayName}
        size="sm"
        className="shrink-0"
      >
        {user.displayName.charAt(0)}
      </Avatar>
      {!collapsed && (
        <div className="flex min-w-0 flex-1 flex-col text-start">
          <span className="truncate text-body-3 font-medium text-era-primary">
            {user.displayName}
          </span>
          {user.plan && (
            <span className="truncate text-label text-era-muted">
              {user.plan} 플랜 이용 중
            </span>
          )}
        </div>
      )}
    </button>
  );
});
SidebarShellUserProfile.displayName = "SidebarShellUserProfile";
