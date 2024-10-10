import SidebarWrappper from "@/components/shared/sidebar/SidebarWrappper";
import React from "react";

type Props = React.PropsWithChildren<{}>;

const Layout = ({ children }: Props) => {
  return <SidebarWrappper>{children}</SidebarWrappper>;
};

export default Layout;
