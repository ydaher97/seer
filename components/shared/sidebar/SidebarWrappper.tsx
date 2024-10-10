import React from "react";
import DesktopNav from "./nav/DesktopNav";
import MobileNav from "./nav/MobileNav";

type Props = React.PropsWithChildren<{}>;

const SidebarWrappper = ({ children }: Props) => {
  return (
    <div className="h-full p-4 flex flex-col lg:flex-row gap-4">
      <DesktopNav />
      <MobileNav />
      <main className="h-[calc(100%-88px)] lg:h-full w-full flex gap-4">
        {children}
      </main>
    </div>
  );
};

export default SidebarWrappper;
